"use client";

type TrailerPlayerProps = {
  url: string;
  title: string;
};

function getIframeSrc(value: string) {
  const match = value.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? value;
}

function getTrailerEmbedUrl(value: string) {
  const url = getIframeSrc(value.trim());
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const videoId = parsed.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      if (parsed.pathname.startsWith("/embed/")) return url;
      if (parsed.pathname.startsWith("/shorts/")) {
        const videoId = parsed.pathname.split("/").filter(Boolean)[1];
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if (host === "youtu.be") {
      const videoId = parsed.pathname.split("/").filter(Boolean)[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    if (host === "vimeo.com") {
      const videoId = parsed.pathname.split("/").filter(Boolean)[0];
      if (videoId) return `https://player.vimeo.com/video/${videoId}`;
    }

    if (host === "player.vimeo.com" || host === "abyssplayer.com" || host === "abyss.to") {
      return url;
    }
  } catch {
    return null;
  }

  return null;
}

function isDirectVideo(value: string) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(getIframeSrc(value.trim()));
}

export function TrailerPlayer({ url, title }: TrailerPlayerProps) {
  const source = getIframeSrc(url.trim());
  const embedUrl = getTrailerEmbedUrl(source);

  if (embedUrl) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg border border-zinc-800 bg-black">
        <iframe
          src={embedUrl}
          title={`${title} trailer`}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    );
  }

  if (isDirectVideo(source)) {
    return (
      <video
        className="aspect-video w-full rounded-lg border border-zinc-800 bg-black"
        src={source}
        controls
        preload="metadata"
      />
    );
  }

  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 px-6 text-center">
      <a
        href={source}
        target="_blank"
        rel="noreferrer"
        className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:border-[var(--sv-orange)] hover:text-[var(--sv-orange)]"
      >
        Open trailer
      </a>
    </div>
  );
}
