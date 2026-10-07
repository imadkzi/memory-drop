"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Pause,
  Play,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  filename: string;
  mediaType: "PHOTO" | "VIDEO";
  mimeType: string;
  size: number;
  createdAt: string;
};

const SLIDESHOW_MS = 4000;

function previewSrc(id: string, size: "thumb" | "large" = "thumb") {
  return size === "large"
    ? `/api/media/${id}/preview?size=large`
    : `/api/media/${id}/preview`;
}

function fullSrc(id: string) {
  return `/api/media/${id}/download?view=1`;
}

const DISPLAYABLE_IMAGE = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function canShowOriginal(item: Item) {
  return item.mediaType === "PHOTO" && DISPLAYABLE_IMAGE.has(item.mimeType);
}

function prefetchVideoEdges(item: Item) {
  const url = fullSrc(item.id);
  void fetch(url, {
    headers: { Range: "bytes=0-2097151" },
  }).catch(() => undefined);
  if (item.size > 512 * 1024) {
    const tail = Math.max(0, item.size - 512 * 1024);
    void fetch(url, {
      headers: { Range: `bytes=${tail}-` },
    }).catch(() => undefined);
  }
}

function preloadImage(src: string) {
  return new Promise<void>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

function LightboxPhoto({
  item,
  readyIds,
  onReady,
}: {
  item: Item;
  readyIds: Set<string>;
  onReady: (id: string) => void;
}) {
  const preview = previewSrc(item.id, "large");
  const original = fullSrc(item.id);
  const showOriginalSource = canShowOriginal(item);
  const previewReady = readyIds.has(item.id);
  const originalReady = readyIds.has(`full:${item.id}`);
  const [localPreview, setLocalPreview] = useState(false);
  const [localOriginal, setLocalOriginal] = useState(false);
  const previewShown = previewReady || localPreview || originalReady || localOriginal;
  const sharp = showOriginalSource && (originalReady || localOriginal);

  useEffect(() => {
    let cancelled = false;
    if (!previewReady && !originalReady) {
      preloadImage(preview)
        .then(() => {
          if (cancelled) return;
          setLocalPreview(true);
          onReady(item.id);
        })
        .catch(() => undefined);
    }
    if (showOriginalSource && !originalReady) {
      preloadImage(original)
        .then(() => {
          if (cancelled) return;
          setLocalOriginal(true);
          onReady(`full:${item.id}`);
        })
        .catch(() => undefined);
    }
    return () => {
      cancelled = true;
    };
  }, [item.id, preview, original, previewReady, originalReady, showOriginalSource, onReady]);

  return (
    <div className="relative h-full w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={preview}
        alt=""
        aria-hidden
        className={cn(
          "absolute inset-0 h-full w-full object-contain transition-opacity duration-300",
          previewShown && !sharp ? "opacity-100" : "opacity-0",
        )}
      />
      {!previewShown && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-white/25 border-t-white/90" />
        </div>
      )}
      {showOriginalSource && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={original}
          alt={item.filename}
          className={cn(
            "h-full w-full object-contain transition-opacity duration-300",
            sharp ? "opacity-100" : "opacity-0",
          )}
        />
      )}
      {!showOriginalSource && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={preview}
          alt={item.filename}
          className={cn(
            "h-full w-full object-contain transition-opacity duration-300",
            previewShown ? "opacity-100" : "opacity-0",
          )}
        />
      )}
    </div>
  );
}

function LightboxVideo({ item }: { item: Item }) {
  const [ready, setReady] = useState(false);
  const poster = previewSrc(item.id, "large");

  return (
    <div className="relative h-full w-full">
      {!ready && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={poster}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-contain"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-2 border-white/25 border-t-white/90" />
          </div>
        </>
      )}
      <video
        key={item.id}
        controls
        autoPlay
        playsInline
        preload="auto"
        poster={poster}
        onCanPlay={() => setReady(true)}
        className={cn(
          "h-full w-full object-contain transition-opacity duration-300",
          ready ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        src={fullSrc(item.id)}
      />
    </div>
  );
}

export function MediaGallery({
  weddingId,
  items,
  nextCursor,
  type,
}: {
  weddingId: string;
  items: Item[];
  nextCursor: string | null;
  type?: "PHOTO" | "VIDEO";
  listView?: boolean;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [visibleItems, setVisibleItems] = useState(items);
  const [loadCursor, setLoadCursor] = useState(nextCursor);
  const [readyIds, setReadyIds] = useState<Set<string>>(() => new Set());
  const prefetchedVideos = useRef(new Set<string>());
  const markReady = useCallback((id: string) => {
    setReadyIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  async function loadMore() {
    if (!loadCursor || loadingMore) return;
    setLoadingMore(true);
    setMessage(null);
    try {
      const params = new URLSearchParams({ cursor: loadCursor });
      if (type) params.set("type", type);
      const res = await fetch(`/api/weddings/${weddingId}/media?${params}`);
      const json = (await res.json()) as {
        items?: Item[];
        nextCursor?: string | null;
        error?: string;
      };
      if (!res.ok) {
        setMessage(json.error ?? "We couldn't load more memories.");
        return;
      }
      const incoming = json.items ?? [];
      setVisibleItems((prev) => {
        const seen = new Set(prev.map((item) => item.id));
        return [...prev, ...incoming.filter((item) => !seen.has(item.id))];
      });
      setLoadCursor(json.nextCursor ?? null);
    } catch {
      setMessage("We couldn't load more memories.");
    } finally {
      setLoadingMore(false);
    }
  }

  const checkedItems = useMemo(
    () => visibleItems.filter((item) => checked.has(item.id)),
    [visibleItems, checked],
  );

  const selected =
    lightboxIndex !== null ? (visibleItems[lightboxIndex] ?? null) : null;

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (checked.size === visibleItems.length) {
      setChecked(new Set());
      return;
    }
    setChecked(new Set(visibleItems.map((item) => item.id)));
  }

  function openLightbox(index: number) {
    setSelectMode(false);
    setLightboxIndex(index);
    setPlaying(false);
  }

  function closeLightbox() {
    setLightboxIndex(null);
    setPlaying(false);
  }

  function goPrev() {
    setLightboxIndex((current) => {
      if (current === null || !visibleItems.length) return current;
      return (current - 1 + visibleItems.length) % visibleItems.length;
    });
  }

  function goNext() {
    setLightboxIndex((current) => {
      if (current === null || !visibleItems.length) return current;
      return (current + 1) % visibleItems.length;
    });
  }

  useEffect(() => {
    if (lightboxIndex === null) return;
    const activeIndex = lightboxIndex;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLightboxIndex(null);
        setPlaying(false);
      }
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
      if (event.key === " ") {
        const current = visibleItems[activeIndex];
        if (current?.mediaType === "PHOTO") {
          event.preventDefault();
          setPlaying((v) => !v);
        }
      }
    }

    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxIndex, visibleItems]);

  useEffect(() => {
    if (!playing || lightboxIndex === null) return;
    const current = visibleItems[lightboxIndex];
    if (!current || current.mediaType === "VIDEO") return;
    const timer = window.setInterval(() => {
      setLightboxIndex((index) => {
        if (index === null || !visibleItems.length) return index;
        return (index + 1) % visibleItems.length;
      });
    }, SLIDESHOW_MS);
    return () => window.clearInterval(timer);
  }, [playing, lightboxIndex, visibleItems]);

  // Warm the current frame and its neighbors. Videos prefetch the file
  // head and tail so playback can start before the whole file arrives.
  useEffect(() => {
    if (lightboxIndex === null || !visibleItems.length) return;
    const indexes = [
      lightboxIndex,
      (lightboxIndex + 1) % visibleItems.length,
      (lightboxIndex - 1 + visibleItems.length) % visibleItems.length,
    ];
    const unique = [...new Set(indexes)];
    for (const index of unique) {
      const item = visibleItems[index];
      if (!item) continue;
      if (item.mediaType === "PHOTO") {
        if (!readyIds.has(item.id)) {
          void preloadImage(previewSrc(item.id, "large"))
            .then(() => markReady(item.id))
            .catch(() => undefined);
        }
        if (index === lightboxIndex && canShowOriginal(item) && !readyIds.has(`full:${item.id}`)) {
          void preloadImage(fullSrc(item.id))
            .then(() => markReady(`full:${item.id}`))
            .catch(() => undefined);
        }
        continue;
      }
      if (index !== lightboxIndex && !prefetchedVideos.current.has(item.id)) {
        prefetchedVideos.current.add(item.id);
        prefetchVideoEdges(item);
      }
    }
  }, [lightboxIndex, visibleItems, readyIds, markReady]);

  async function download(item: Item) {
    window.open(
      `/api/media/${item.id}/download`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function downloadMany(targets: Item[]) {
    if (!targets.length) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/weddings/${weddingId}/media/zip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: targets.map((item) => item.id) }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setMessage(json.error ?? "We couldn't create the zip download.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `memory-drop-${weddingId.slice(0, 8)}.zip`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setMessage("We couldn't create the zip download.");
    } finally {
      setBusy(false);
    }
  }

  async function removeOne(item: Item) {
    setBusy(true);
    setMessage(null);
    const res = await fetch(`/api/media/${item.id}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMessage(json.error ?? "We couldn't delete this memory.");
      return;
    }

    const nextItems = visibleItems.filter((entry) => entry.id !== item.id);
    setVisibleItems(nextItems);
    setChecked((prev) => {
      const next = new Set(prev);
      next.delete(item.id);
      return next;
    });

    if (!nextItems.length) {
      closeLightbox();
      return;
    }
    if (lightboxIndex !== null) {
      setLightboxIndex(Math.min(lightboxIndex, nextItems.length - 1));
    }
  }

  async function removeSelected() {
    if (!checkedItems.length) return;
    const count = checkedItems.length;
    if (
      !window.confirm(
        count === 1
          ? "Delete this memory? This cannot be undone."
          : `Delete ${count} memories? This cannot be undone.`,
      )
    ) {
      return;
    }

    setBusy(true);
    setMessage(null);
    const ids = checkedItems.map((item) => item.id);
    const res = await fetch(`/api/weddings/${weddingId}/media/bulk-delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMessage(json.error ?? "We couldn't delete the selected memories.");
      return;
    }

    const idSet = new Set(ids);
    setVisibleItems((prev) => prev.filter((item) => !idSet.has(item.id)));
    setChecked(new Set());
    setSelectMode(false);
    setMessage(count === 1 ? "Memory deleted" : `${count} memories deleted`);
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 border-ink/15 bg-white/80 text-ink hover:bg-ink/5"
            onClick={() => {
              setSelectMode((v) => !v);
              setChecked(new Set());
              setMessage(null);
            }}
          >
            {selectMode ? "Cancel" : "Select"}
          </Button>
          {selectMode && (
            <>
              <Button
                type="button"
                variant="outline"
                className="h-10 border-ink/15 bg-white/80 text-ink hover:bg-ink/5"
                onClick={toggleAll}
              >
                {checked.size === visibleItems.length ? "Clear all" : "Select all"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 border-destructive/30 bg-white/80 text-destructive hover:bg-destructive/10"
                disabled={!checkedItems.length || busy}
                onClick={removeSelected}
              >
                <Trash2 className="size-4" />
                Delete {checkedItems.length || ""}
              </Button>
            </>
          )}
        </div>
        <Button
          type="button"
          className="h-11 bg-bloom px-5 font-semibold text-white hover:bg-bloom/90"
          disabled={
            busy ||
            !visibleItems.length ||
            (selectMode && checkedItems.length === 0)
          }
          onClick={() =>
            downloadMany(
              selectMode && checkedItems.length ? checkedItems : visibleItems,
            )
          }
        >
          <Download className="size-4" />
          {busy
            ? "Preparing zip…"
            : selectMode && checkedItems.length
              ? `Zip ${checkedItems.length}`
              : "Download zip"}
        </Button>
      </div>

      {message && (
        <p
          className={cn(
            "mb-4 font-sans text-sm",
            message.includes("deleted") ? "text-bloom" : "text-destructive",
          )}
        >
          {message}
        </p>
      )}

      {!visibleItems.length ? (
        <div className="rounded-2xl border border-dashed border-ink/15 bg-white/50 px-6 py-20 text-center">
          <p className="font-serif text-2xl text-ink">No memories yet</p>
          <p className="mt-2 font-sans text-muted-foreground">
            Guest uploads will appear here privately.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {visibleItems.map((item, index) => {
            const isChecked = checked.has(item.id);
            return (
              <div key={item.id} className="group relative">
                <button
                  type="button"
                  onClick={() => {
                    if (selectMode) toggle(item.id);
                    else openLightbox(index);
                  }}
                  className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted text-left shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/media/${item.id}/preview`}
                    alt={item.filename}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                    decoding="async"
                  />
                  {item.mediaType === "VIDEO" && (
                    <span className="absolute right-2 bottom-2 rounded bg-background/85 px-2 py-0.5 font-sans text-[10px]">
                      Video
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  aria-label={isChecked ? "Deselect" : "Select"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectMode(true);
                    toggle(item.id);
                  }}
                  className={cn(
                    "absolute top-2 left-2 flex size-5 items-center justify-center rounded border transition",
                    isChecked
                      ? "border-bloom bg-bloom text-white"
                      : "border-white/90 bg-black/25 text-transparent hover:bg-black/40",
                  )}
                >
                  {isChecked ? "✓" : ""}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {loadCursor && (
        <div className="mt-8 text-center">
          <Button
            type="button"
            variant="outline"
            disabled={loadingMore}
            onClick={() => void loadMore()}
            className="h-11 border-ink/20 bg-transparent text-ink hover:bg-ink/5"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}

      {selected && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selected.filename}
          className="fixed inset-0 z-50 flex flex-col bg-[#1a1210]/94 text-white backdrop-blur-sm"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="min-w-0">
              <p className="truncate font-serif text-lg tracking-tight sm:text-xl">
                {selected.filename}
              </p>
              <p className="font-sans text-xs text-white/55">
                {lightboxIndex + 1} / {visibleItems.length}
                {" · "}
                {new Date(selected.createdAt).toLocaleString()}
                {" · "}
                {Math.round(selected.size / 1024)} KB
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              {selected.mediaType === "PHOTO" && (
                <button
                  type="button"
                  onClick={() => setPlaying((v) => !v)}
                  className="inline-flex h-10 items-center gap-2 rounded-full px-3 font-sans text-sm text-white/85 transition hover:bg-white/10"
                  aria-label={playing ? "Pause slideshow" : "Play slideshow"}
                >
                  {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
                  <span className="hidden sm:inline">
                    {playing ? "Pause" : "Slideshow"}
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={() => download(selected)}
                className="inline-flex size-10 items-center justify-center rounded-full text-white/85 transition hover:bg-white/10"
                aria-label="Download"
              >
                <Download className="size-4" />
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (
                    window.confirm("Delete this memory? This cannot be undone.")
                  ) {
                    void removeOne(selected);
                  }
                }}
                className="inline-flex size-10 items-center justify-center rounded-full text-white/85 transition hover:bg-white/10 hover:text-red-300 disabled:opacity-50"
                aria-label="Delete"
              >
                <Trash2 className="size-4" />
              </button>
              <button
                type="button"
                onClick={closeLightbox}
                className="inline-flex size-10 items-center justify-center rounded-full text-white/85 transition hover:bg-white/10"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          <div className="relative min-h-0 flex-1">
            {visibleItems.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute top-1/2 left-2 z-10 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white transition hover:bg-black/55 sm:left-4"
                  aria-label="Previous"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute top-1/2 right-2 z-10 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white transition hover:bg-black/55 sm:right-4"
                  aria-label="Next"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}

            <div className="absolute inset-0">
              {selected.mediaType === "VIDEO" ? (
                <LightboxVideo key={selected.id} item={selected} />
              ) : (
                <LightboxPhoto
                  key={selected.id}
                  item={selected}
                  readyIds={readyIds}
                  onReady={markReady}
                />
              )}
            </div>
          </div>

          {visibleItems.length > 1 && (
            <div className="flex gap-2 overflow-x-auto px-4 pb-4 sm:justify-center sm:px-6">
              {visibleItems.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setLightboxIndex(index);
                    if (item.mediaType === "VIDEO") setPlaying(false);
                  }}
                  className={cn(
                    "relative h-14 w-14 shrink-0 overflow-hidden rounded-md ring-offset-2 ring-offset-[#1a1210] transition",
                    index === lightboxIndex
                      ? "ring-2 ring-white"
                      : "opacity-55 hover:opacity-100",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/media/${item.id}/preview`}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
