"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, m } from "motion/react";
import { Film, Heart, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type UploadItem = {
  id: string;
  file: File;
  previewUrl: string | null;
  status: "pending" | "uploading" | "done" | "error";
  /** Bytes uploaded for this file (0…file.size). */
  loaded: number;
  error?: string;
  mediaId?: string;
};

type Props = {
  token: string;
  weddingName: string;
  uploadEnabled: boolean;
  driveReady: boolean;
};

function isVideo(file: File) {
  return file.type.startsWith("video/") || /\.(mp4|mov|m4v)$/i.test(file.name);
}

function isImagePreviewable(file: File) {
  if (file.type.startsWith("image/")) {
    return !/heic|heif/i.test(file.type) && !/\.(heic|heif)$/i.test(file.name);
  }
  return false;
}

function revokePreviews(items: UploadItem[]) {
  for (const item of items) {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
  }
}

export function GuestUploadExperience({
  token,
  weddingName,
  uploadEnabled,
  driveReady,
}: Props) {
  const reduced = usePrefersReducedMotion();
  const [items, setItems] = useState<UploadItem[]>([]);
  const [phase, setPhase] = useState<"idle" | "ready" | "uploading" | "done">(
    "idle",
  );

  useEffect(() => {
    return () => revokePreviews(items);
    // Only revoke on unmount; selection changes revoke the previous set explicitly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCount = items.length;
  const completedCount = items.filter((item) => item.status === "done").length;
  const totalBytes = useMemo(
    () => items.reduce((sum, item) => sum + item.file.size, 0),
    [items],
  );
  const loadedBytes = useMemo(
    () => items.reduce((sum, item) => sum + item.loaded, 0),
    [items],
  );
  const overallProgress = useMemo(() => {
    if (!totalBytes) return 0;
    return Math.min(100, Math.round((loadedBytes / totalBytes) * 100));
  }, [loadedBytes, totalBytes]);

  const onSelect = useCallback((files: FileList | null) => {
    if (!files?.length) return;
    setItems((prev) => {
      revokePreviews(prev);
      return Array.from(files).map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: isImagePreviewable(file)
          ? URL.createObjectURL(file)
          : isVideo(file)
            ? URL.createObjectURL(file)
            : null,
        status: "pending" as const,
        loaded: 0,
      }));
    });
    setPhase("ready");
  }, []);

  async function uploadOne(item: UploadItem) {
    setItems((prev) =>
      prev.map((row) =>
        row.id === item.id
          ? { ...row, status: "uploading", loaded: 0, error: undefined }
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
        const loaded = Math.min(event.loaded, item.file.size);
        setItems((prev) =>
          prev.map((row) => (row.id === item.id ? { ...row, loaded } : row)),
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
          ? {
              ...row,
              status: "done",
              loaded: row.file.size,
              mediaId,
            }
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
              ? { ...row, status: "error", error: message, loaded: 0 }
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
      <StationaryShell weddingName={weddingName}>
        <p className="mt-6 font-sans text-base text-muted-foreground">
          Uploads are temporarily closed for this wedding.
        </p>
      </StationaryShell>
    );
  }

  if (!driveReady) {
    return (
      <StationaryShell weddingName={weddingName}>
        <p className="mt-6 font-sans text-base leading-relaxed text-muted-foreground">
          This collection isn&apos;t ready for uploads yet. The couple still
          needs to finish setup — please try again later.
        </p>
      </StationaryShell>
    );
  }

  if (phase === "done") {
    return (
      <m.div
        className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-24 text-center"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-bloom-soft text-bloom">
          <Heart className="size-6 fill-current" aria-hidden />
        </div>
        <h1 className="mt-6 font-serif text-4xl tracking-tight text-ink sm:text-5xl">
          All done
        </h1>
        <p className="mt-4 font-sans text-lg leading-relaxed text-ink/75">
          Your memories have been added to {weddingName}&apos;s wedding
          collection.
        </p>
        <p className="mt-8 font-sans text-base text-ink/55">Thank you.</p>
      </m.div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <div className="border border-ink/10 bg-white/90 px-6 py-10 text-center shadow-[0_1px_0_oklch(0.22_0.03_35/0.04)] sm:px-8 sm:py-12">
        <div className="chapter-rule mx-auto mb-6 bg-bloom" />
        <h1 className="font-serif text-4xl tracking-tight text-ink sm:text-5xl">
          {weddingName}
        </h1>
        <p className="mt-6 font-serif text-xl italic text-ink/80">
          Share your memories
        </p>
        <p className="mt-3 font-sans text-base text-ink/60">
          Help us collect the moments from our wedding day.
        </p>

        <AnimatePresence mode="wait">
          {phase === "idle" && (
            <m.div
              key="idle"
              className="mt-10 space-y-4"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduced ? undefined : { opacity: 0 }}
              transition={{ duration: 0.28 }}
            >
              <label className="block">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/quicktime,.heic,.heif,.mov,.mp4"
                  multiple
                  className="hidden"
                  onChange={(event) => onSelect(event.target.files)}
                />
                <span className="flex h-14 w-full cursor-pointer items-center justify-center rounded-md bg-bloom px-4 text-base font-semibold text-white transition hover:bg-bloom/90">
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
            </m.div>
          )}

          {phase === "ready" && (
            <m.div
              key="ready"
              className="mt-10 space-y-6 text-left"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduced ? undefined : { opacity: 0 }}
              transition={{ duration: 0.28 }}
            >
              <p className="text-center font-sans text-lg text-ink">
                {selectedCount} {selectedCount === 1 ? "memory" : "memories"}{" "}
                selected
              </p>
              <PreviewGrid items={items} />
              <Button
                className="h-14 w-full bg-bloom text-base font-semibold text-white hover:bg-bloom/90"
                size="lg"
                onClick={() =>
                  runQueue(items.filter((i) => i.status !== "done"))
                }
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
            </m.div>
          )}

          {phase === "uploading" && (
            <m.div
              key="uploading"
              className="mt-10 space-y-6"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduced ? undefined : { opacity: 0 }}
              transition={{ duration: 0.28 }}
            >
              <p className="font-sans text-lg text-ink">
                Uploading your memories…
              </p>
              <PreviewGrid items={items} showProgress />
              <div>
                <p className="font-serif text-3xl text-ink">
                  {overallProgress}%
                </p>
                <p className="mt-1 font-sans text-sm text-muted-foreground">
                  {completedCount} of {selectedCount}{" "}
                  {selectedCount === 1 ? "file" : "files"} complete
                </p>
              </div>
              <Progress value={overallProgress} className={cn("h-2 w-full")} />
              <p className="font-sans text-sm text-muted-foreground">
                Please keep this page open
              </p>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StationaryShell({
  weddingName,
  children,
}: {
  weddingName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-24 text-center">
      <div className="chapter-rule mb-5 bg-bloom" />
      <h1 className="font-serif text-4xl tracking-tight text-ink sm:text-5xl">
        {weddingName}
      </h1>
      {children}
    </div>
  );
}

function PreviewGrid({
  items,
  showProgress = false,
}: {
  items: UploadItem[];
  showProgress?: boolean;
}) {
  return (
    <ul className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
      {items.map((item) => {
        const video = isVideo(item.file);
        const pct =
          item.file.size > 0
            ? Math.round((item.loaded / item.file.size) * 100)
            : 0;

        return (
          <li key={item.id} className="min-w-0">
            <div
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg border border-ink/10 bg-ink/5",
                item.status === "error" && "border-destructive/40",
              )}
            >
              {item.previewUrl && !video ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.previewUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : item.previewUrl && video ? (
                <video
                  src={item.previewUrl}
                  muted
                  playsInline
                  preload="metadata"
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-1 text-ink/35">
                  {video ? (
                    <Film className="size-5" strokeWidth={1.5} />
                  ) : (
                    <ImageIcon className="size-5" strokeWidth={1.5} />
                  )}
                </div>
              )}

              {video && item.previewUrl && (
                <div className="absolute top-1.5 left-1.5 rounded bg-ink/55 p-1 text-white">
                  <Film className="size-3" strokeWidth={2} />
                </div>
              )}

              {showProgress && item.status === "uploading" && (
                <div className="absolute inset-x-0 bottom-0 bg-ink/50 px-1.5 py-1">
                  <div className="h-1 overflow-hidden rounded-full bg-white/30">
                    <m.div
                      className="h-full rounded-full bg-white"
                      initial={false}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.15, ease: "linear" }}
                    />
                  </div>
                </div>
              )}

              {showProgress && item.status === "done" && (
                <div className="absolute inset-0 bg-bloom/35" />
              )}

              {item.status === "error" && (
                <div className="absolute inset-0 flex items-end bg-destructive/20 p-1.5">
                  <span className="line-clamp-2 font-sans text-[10px] leading-tight text-destructive">
                    {item.error ?? "Failed"}
                  </span>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
