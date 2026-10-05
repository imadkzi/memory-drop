export type StorageFileMetadata = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  thumbnailLink?: string | null;
  webContentLink?: string | null;
};

export type CreateResumableUploadInput = {
  folderId: string;
  filename: string;
  mimeType: string;
  size: number;
  /** Browser origin — required for CORS if the client uploads directly to Drive */
  origin?: string;
};

export type CreateResumableUploadResult = {
  uploadUrl: string;
};

export type UploadFileStreamInput = {
  folderId: string;
  filename: string;
  mimeType: string;
  body: NodeJS.ReadableStream | ReadableStream<Uint8Array>;
};

export interface StorageProvider {
  createWeddingFolder(weddingName: string, rootFolderId?: string | null): Promise<{
    folderId: string;
    rootFolderId: string;
  }>;
  createResumableUpload(input: CreateResumableUploadInput): Promise<CreateResumableUploadResult>;
  uploadFileStream(input: UploadFileStreamInput): Promise<StorageFileMetadata>;
  getFile(fileId: string): Promise<StorageFileMetadata>;
  getFilePreview(
    fileId: string,
    size?: "thumb" | "large",
  ): Promise<{ thumbnailLink?: string | null }>;
  downloadFile(fileId: string): Promise<ReadableStream<Uint8Array> | NodeJS.ReadableStream>;
  deleteFile(fileId: string): Promise<void>;
  listFiles(folderId: string): Promise<StorageFileMetadata[]>;
}
