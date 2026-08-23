"use client";

interface FallbackImgProps {
  src: string;
  fallback: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: "lazy" | "eager";
}

export function FallbackImg({
  src,
  fallback,
  alt,
  width,
  height,
  className,
  loading = "lazy",
}: FallbackImgProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={loading}
      onError={(e) => {
        const img = e.currentTarget;
        img.onerror = null;
        img.src = fallback;
      }}
    />
  );
}

interface HideOnErrorImgProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: "lazy" | "eager";
}

/** Hides the image entirely on load error (no fallback src). */
export function HideOnErrorImg({
  src,
  alt,
  width,
  height,
  className,
  loading = "lazy",
}: HideOnErrorImgProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={loading}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
      }}
    />
  );
}
