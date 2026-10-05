export const mockWedding = {
  id: "wedding_demo",
  name: "Sarah & Ahmed",
  slug: "sarah-ahmed",
  uploadEnabled: true,
  driveConnected: true,
  photoCount: 247,
  videoCount: 18,
  totalUploads: 265,
  guestUploadUrl: "https://example.com/upload/7fK92mLxDemoToken",
  admins: [
    { id: "1", name: "Sarah Chen", email: "sarah@example.com", role: "OWNER" as const },
    { id: "2", name: "Layla Hassan", email: "layla@example.com", role: "ADMIN" as const },
  ],
};

export const mockMedia = Array.from({ length: 24 }).map((_, index) => {
  const isVideo = index % 7 === 0;
  return {
    id: `media_${index + 1}`,
    filename: isVideo ? `clip_${index + 1}.mov` : `IMG_${1000 + index}.jpg`,
    mediaType: isVideo ? ("VIDEO" as const) : ("PHOTO" as const),
    mimeType: isVideo ? "video/quicktime" : "image/jpeg",
    size: isVideo ? 84_000_000 : 3_200_000,
    status: "READY" as const,
    createdAt: new Date(Date.now() - index * 36_000_00).toISOString(),
    previewHue: 20 + ((index * 17) % 40),
  };
});
