"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type UploadItem = {
  id: string;
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
  mediaId?: string;
};

type Props = {
  token: string;
  weddingName: string;
  uploadEnabled: boolean;
};

export function GuestUploadExperience({
  token,
  weddingName,
  uploadEnabled,
}: Props) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [phase, setPhase] = useState<"idle" | "ready" | "uploading" | "done">(
    "idle",
  );

  const selectedCount = items.length;
  const completedCount = items.filter((item) => item.status === "done").length;
  const overallProgress = useMemo(() => {
    if (!items.length) return 0;
    return Math.round(
      items.reduce((sum, item) => sum + item.progress, 0) / items.length,
    );
  }, [items]);

  const onSelect = useCallback((files: FileList | null) => {
    if (!files?.length) return;
    setItems(
      Array.from(files).map((file) => ({
        id: crypto.randomUUID(),
        file,
        status: "pending" as const,
        progress: 0,
      })),
    );
    setPhase("ready");
  }, []);

  async function uploadOne(item: UploadItem) {
    setItems((prev) =>
      prev.map((row) =>
        row.id === item.id
          ? { ...row, status: "uploading", progress: 5, error: undefined }
          : row,
      ),
    );

    const mediaId = await new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload/file");
      xhr.setRequestHeader("x-upload-token", token);
      xhr.setRequestHeader("x-filename", encodeURIComponent(item.file.name));
      xhr.setRequestHeader(
        "x-mime-type",
        item.file.type || "application/octet-stream",
      );
      xhr.setRequestHeader("x-file-size", String(item.file.size));
      xhr.setRequestHeader(
        "Content-Type",
        item.file.type || "application/octet-stream",
      );

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        const progress = Math.max(
          5,
          Math.min(95, Math.round((event.loaded / event.total) * 100)),
        );
        setItems((prev) =>
          prev.map((row) => (row.id === item.id ? { ...row, progress } : row)),
        );
      };

      xhr.onload = () => {
        try {
          const body = JSON.parse(xhr.responseText || "{}") as {
            error?: string;
            mediaId?: string;
          };
          if (xhr.status >= 200 && xhr.status < 300 && body.mediaId) {
            resolve(body.mediaId);
            return;
          }
          reject(
            new Error(
              body.error ?? "We couldn't upload this file. Please try again.",
            ),
          );
        } catch {
          reject(new Error("We couldn't upload this file. Please try again."));
        }
      };
      xhr.onerror = () =>
        reject(new Error("We couldn't upload this file. Please try again."));
      xhr.send(item.file);
    });

    setItems((prev) =>
      prev.map((row) =>
        row.id === item.id
          ? { ...row, status: "done", progress: 100, mediaId }
          : row,
      ),
    );
  }

  async function runQueue(targets: UploadItem[]) {
    setPhase("uploading");
    for (const item of targets) {
      try {
        await uploadOne(item);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "We couldn't upload this file. Please try again.";
        setItems((prev) =>
          prev.map((row) =>
            row.id === item.id
              ? { ...row, status: "error", error: message, progress: 0 }
              : row,
          ),
        );
      }
    }
    setItems((prev) => {
      setPhase(prev.every((row) => row.status === "done") ? "done" : "ready");
      return prev;
    });
  }

  if (!uploadEnabled) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-24 text-center">
        <div className="chapter-rule mb-5 bg-bloom" />
        <h1 className="font-serif text-4xl tracking-tight text-ink sm:text-5xl">
          {weddingName}
        </h1>
        <p className="mt-6 font-sans text-base text-muted-foreground">
          Uploads are temporarily closed for this wedding.
        </p>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-24 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-bloom-soft text-bloom">
          <Heart className="size-6 fill-current" aria-hidden />
        </div>
        <h1 className="animate-fade-rise mt-6 font-serif text-4xl tracking-tight text-ink sm:text-5xl">
          All done
        </h1>
        <p className="animate-fade-rise-delay mt-4 font-sans text-lg leading-relaxed text-ink/75">
          Your memories have been added to {weddingName}&apos;s wedding
          collection.
        </p>
        <p className="animate-fade-rise-delay mt-8 font-sans text-base text-muted-foreground">
          Thank you.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <div className="rounded-xl border border-ink/8 bg-[#faf6f2]/90 px-6 py-10 text-center shadow-[0_18px_50px_-28px_rgba(40,20,20,0.35)] sm:px-8 sm:py-12">
        <div className="chapter-rule mx-auto mb-6 bg-bloom" />
        <h1 className="animate-fade-rise font-serif text-4xl tracking-tight text-ink sm:text-5xl">
          {weddingName}
        </h1>
        <p className="animate-fade-rise-delay mt-6 font-sans text-xl text-ink">
          Share your memories
        </p>
        <p className="animate-fade-rise-delay mt-3 font-sans text-base text-muted-foreground">
          Help us collect the moments from our wedding day.
        </p>

        {phase === "idle" && (
          <div className="animate-fade-rise-delay mt-10 space-y-4">
            <label className="block">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/quicktime,.heic,.heif,.mov,.mp4"
                multiple
                className="hidden"
                onChange={(event) => onSelect(event.target.files)}
              />
              <span className="flex h-14 w-full cursor-pointer items-center justify-center rounded-md bg-bloom px-4 text-base font-semibold text-white shadow-[0_12px_30px_-14px_rgba(80,30,40,0.45)] transition hover:bg-bloom/90">
                Choose Photos & Videos
              </span>
            </label>
            <p className="font-sans text-sm text-muted-foreground">
              No account required. Uploading means the files go to this
              wedding&apos;s collection.{" "}
              <Link
                href="/privacy"
                className="underline-offset-4 hover:text-ink hover:underline"
              >
                Privacy policy
              </Link>
            </p>
          </div>
        )}

        {phase === "ready" && (
          <div className="mt-10 space-y-6 text-left">
            <p className="text-center font-sans text-lg text-ink">
              {selectedCount} {selectedCount === 1 ? "memory" : "memories"}{" "}
              selected
            </p>
            <ul className="max-h-48 space-y-2 overflow-y-auto font-sans text-sm text-muted-foreground">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3">
                  <span className="truncate">{item.file.name}</span>
                  {item.status === "error" && (
                    <span className="shrink-0 text-destructive">
                      {item.error}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <Button
              className="h-14 w-full bg-bloom text-base font-semibold text-white hover:bg-bloom/90"
              size="lg"
              onClick={() => runQueue(items.filter((i) => i.status !== "done"))}
            >
              Upload {selectedCount}{" "}
              {selectedCount === 1 ? "Memory" : "Memories"}
            </Button>
            {items.some((item) => item.status === "error") && (
              <Button
                className="h-12 w-full border-ink/20 bg-transparent text-ink hover:bg-ink/5"
                variant="outline"
                onClick={() =>
                  runQueue(items.filter((i) => i.status === "error"))
                }
              >
                Retry failed uploads
              </Button>
            )}
            <label className="block text-center font-sans text-sm text-muted-foreground">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/quicktime,.heic,.heif,.mov,.mp4"
                multiple
                className="hidden"
                onChange={(event) => onSelect(event.target.files)}
              />
              <span className="cursor-pointer underline-offset-4 hover:text-ink hover:underline">
                Choose different files
              </span>
            </label>
          </div>
        )}

        {phase === "uploading" && (
          <div className="mt-10 space-y-6">
            <p className="font-sans text-lg text-ink">
              Uploading your memories…
            </p>
            <p className="font-serif text-3xl text-ink">
              {completedCount} / {selectedCount}
            </p>
            <Progress value={overallProgress} className={cn("h-2")} />
            <p className="animate-soft-pulse font-sans text-sm text-muted-foreground">
              Please keep this page open
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
