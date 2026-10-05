import { Readable } from "stream";
import { google } from "googleapis";
import { getEnv } from "@/lib/validation/env";
import { logger } from "@/lib/logging/logger";
import type {
  CreateResumableUploadInput,
  CreateResumableUploadResult,
  StorageFileMetadata,
  StorageProvider,
  UploadFileStreamInput,
} from "@/lib/storage/types";

const ROOT_FOLDER_NAME = "Wedding Memories";

export type GoogleDriveAuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
};

export class GoogleDriveStorageProvider implements StorageProvider {
  private oauth2;
  private drive;

  constructor(private tokens: GoogleDriveAuthTokens) {
    const env = getEnv();
    this.oauth2 = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI,
    );
    this.oauth2.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      expiry_date: tokens.expiresAt.getTime(),
    });
    this.drive = google.drive({ version: "v3", auth: this.oauth2 });
  }

  async createWeddingFolder(weddingName: string, rootFolderId?: string | null) {
    let rootId = rootFolderId ?? null;
    if (!rootId) {
      rootId = await this.findOrCreateFolder(ROOT_FOLDER_NAME, "root");
    }
    const folderId = await this.findOrCreateFolder(weddingName, rootId);
    return { folderId, rootFolderId: rootId };
  }

  async createResumableUpload(
    input: CreateResumableUploadInput,
  ): Promise<CreateResumableUploadResult> {
    const accessToken = await this.getAccessToken();
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": input.mimeType,
      "X-Upload-Content-Length": String(input.size),
    };
    if (input.origin) {
      headers.Origin = input.origin;
    }

    const initRes = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,mimeType,size",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: input.filename,
          mimeType: input.mimeType,
          parents: [input.folderId],
        }),
      },
    );

    if (!initRes.ok) {
      const body = await initRes.text();
      logger.error("drive_resumable_init_failed", {
        status: initRes.status,
        body: body.slice(0, 500),
      });
      throw new Error("Unable to start upload session");
    }

    const uploadUrl = initRes.headers.get("location");
    if (!uploadUrl) {
      throw new Error("Drive did not return an upload URL");
    }
    return { uploadUrl };
  }

  async uploadFileStream(input: UploadFileStreamInput): Promise<StorageFileMetadata> {
    const body =
      typeof (input.body as ReadableStream).getReader === "function"
        ? Readable.fromWeb(input.body as import("stream/web").ReadableStream)
        : (input.body as NodeJS.ReadableStream);

    const res = await this.drive.files.create({
      requestBody: {
        name: input.filename,
        mimeType: input.mimeType,
        parents: [input.folderId],
      },
      media: {
        mimeType: input.mimeType,
        body,
      },
      fields: "id,name,mimeType,size,thumbnailLink,webContentLink",
      supportsAllDrives: true,
    });

    if (!res.data.id) {
      throw new Error("Drive upload did not return a file id");
    }

    return {
      id: res.data.id,
      name: res.data.name ?? input.filename,
      mimeType: res.data.mimeType ?? input.mimeType,
      size: Number(res.data.size ?? 0),
      thumbnailLink: res.data.thumbnailLink,
      webContentLink: res.data.webContentLink,
    };
  }

  async getFile(fileId: string): Promise<StorageFileMetadata> {
    const res = await this.drive.files.get({
      fileId,
      fields: "id,name,mimeType,size,thumbnailLink,webContentLink",
      supportsAllDrives: true,
    });
    return {
      id: res.data.id!,
      name: res.data.name ?? "file",
      mimeType: res.data.mimeType ?? "application/octet-stream",
      size: Number(res.data.size ?? 0),
      thumbnailLink: res.data.thumbnailLink,
      webContentLink: res.data.webContentLink,
    };
  }

  async getFilePreview(fileId: string, size: "thumb" | "large" = "thumb") {
    const file = await this.getFile(fileId);
    const thumbnailLink = file.thumbnailLink
      ? sizedDriveThumbnail(file.thumbnailLink, size === "large" ? 1600 : 400)
      : null;
    return { thumbnailLink };
  }

  async downloadFile(fileId: string) {
    const res = await this.drive.files.get(
      { fileId, alt: "media", supportsAllDrives: true },
      { responseType: "stream" },
    );
    return res.data as NodeJS.ReadableStream;
  }

  async deleteFile(fileId: string) {
    await this.drive.files.delete({ fileId, supportsAllDrives: true });
  }

  async listFiles(folderId: string): Promise<StorageFileMetadata[]> {
    const res = await this.drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id,name,mimeType,size,thumbnailLink,webContentLink)",
      pageSize: 1000,
      supportsAllDrives: true,
    });
    return (res.data.files ?? []).map((file) => ({
      id: file.id!,
      name: file.name ?? "file",
      mimeType: file.mimeType ?? "application/octet-stream",
      size: Number(file.size ?? 0),
      thumbnailLink: file.thumbnailLink,
      webContentLink: file.webContentLink,
    }));
  }

  private async findOrCreateFolder(name: string, parentId: string) {
    const escaped = name.replace(/'/g, "\\'");
    const parentClause = parentId === "root" ? "'root' in parents" : `'${parentId}' in parents`;
    const existing = await this.drive.files.list({
      q: `mimeType = 'application/vnd.google-apps.folder' and name = '${escaped}' and ${parentClause} and trashed = false`,
      fields: "files(id,name)",
      pageSize: 1,
      supportsAllDrives: true,
    });
    if (existing.data.files?.[0]?.id) {
      return existing.data.files[0].id;
    }
    const created = await this.drive.files.create({
      requestBody: {
        name,
        mimeType: "application/vnd.google-apps.folder",
        parents: parentId === "root" ? undefined : [parentId],
      },
      fields: "id",
      supportsAllDrives: true,
    });
    if (!created.data.id) {
      throw new Error("Failed to create Drive folder");
    }
    return created.data.id;
  }

  private async getAccessToken() {
    const token = await this.oauth2.getAccessToken();
    if (!token.token) {
      throw new Error("Unable to obtain Google access token");
    }
    return token.token;
  }
}

/** Drive thumbnails often end in =s220; bump for lightbox-quality previews. */
function sizedDriveThumbnail(link: string, px: number) {
  if (/=s\d+/.test(link)) {
    return link.replace(/=s\d+(-[a-z]+)?/i, `=s${px}$1`);
  }
  return `${link}=s${px}`;
}
