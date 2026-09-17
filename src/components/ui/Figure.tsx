"use client";

import Image from "next/image";

import { cn } from "@/lib/cn";
import { media } from "@/lib/media.generated";
import { Parallax } from "@/components/ui/Reveal";

type MediaId = keyof typeof media.size;

const source = (id: MediaId) =>
  id in media.film.cuts || ["arrival", "arrival-sm", "land", "plan", "structure"].includes(id)
    ? `/media/film/${id}.webp`
    : `/media/img/${id}.webp`;

interface FigureProps {
  id: MediaId;
  alt: string;
  /** CSS aspect ratio, e.g. "4 / 5". Omit to use the asset's own proportions. */
  ratio?: string;
  sizes: string;
  priority?: boolean;
  parallax?: number;
  caption?: string;
  className?: string;
  imageClassName?: string;
  /** Vertical crop anchor, for art-directing a tall image into a short frame. */
  position?: string;
}

/**
 * Every image on the page goes through here, so cropping, placeholders and
 * caption treatment stay consistent. Intrinsic dimensions come from the media
 * manifest rather than being typed in by hand, which is what keeps the layout
 * from shifting as pictures arrive.
 */
export function Figure({
  id,
  alt,
  ratio,
  sizes,
  priority = false,
  parallax,
  caption,
  className,
  imageClassName,
  position = "center",
}: FigureProps) {
  const dims = media.size[id];
  const image = (
    <Image
      src={source(id)}
      alt={alt}
      width={dims.width}
      height={dims.height}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      placeholder="blur"
      blurDataURL={media.blur[id as keyof typeof media.blur]}
      className={cn("h-full w-full object-cover", imageClassName)}
      style={{ objectPosition: position }}
    />
  );

  return (
    <figure className={cn("relative", className)}>
      <div
        className="relative overflow-hidden rounded-(--radius-frame) bg-stone"
        style={ratio ? { aspectRatio: ratio } : undefined}
      >
        {parallax ? (
          // The scaled wrapper keeps the drifting image covering its frame at
          // both extremes of travel, so no edge of bare surface is ever exposed.
          <div className="absolute inset-0 scale-[1.12]">
            <Parallax distance={parallax}>{image}</Parallax>
          </div>
        ) : (
          image
        )}
      </div>
      {caption && (
        <figcaption className="mark mt-4 text-slate/80">{caption}</figcaption>
      )}
    </figure>
  );
}
