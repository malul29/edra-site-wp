'use client';

import { ReactLenis } from 'lenis/react';
import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import { resolveMediaUrl } from '@/lib/mediaUrl';

type ProjectLike = {
  id?: string | number;
  title?: string;
  slug?: string;
  image?: unknown;
  imageFull?: unknown;
  gallery?: unknown;
  createdAt?: string;
};

type StickyScrollProps = {
  projects?: ProjectLike[];
  maxItems?: number;
};

type GalleryItem = {
  key: string;
  src: string;
  title: string;
  href: string;
};

export default function StickyScroll({ projects = [], maxItems = 13 }: StickyScrollProps) {
  const galleryItems = useMemo<GalleryItem[]>(() => {
    const items: GalleryItem[] = [];
    const sortedProjects = [...projects].sort((a, b) => {
      const at = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bt = b.createdAt ? Date.parse(b.createdAt) : 0;
      return bt - at;
    });

    sortedProjects.forEach((project, projectIndex) => {
      const src = resolveMediaUrl(project.imageFull || project.image);
      if (!src || src === '/edra-logo.png') return;

      const href = `/project/${project.slug || project.id || ''}`;
      const title = project.title || `Project ${projectIndex + 1}`;
      items.push({
        key: `${project.id || projectIndex}`,
        src,
        title,
        href,
      });
    });

    const trimmed = items.slice(0, maxItems);

    // Keep exactly maxItems using project covers only.
    if (trimmed.length > 0) {
      let loopIndex = 0;
      while (trimmed.length < maxItems) {
        const looped = trimmed[loopIndex % trimmed.length];
        trimmed.push({
          ...looped,
          key: `${looped.key}-loop-${trimmed.length}`,
        });
        loopIndex += 1;
      }
    }

    return trimmed;
  }, [projects, maxItems]);

  const leftCol = galleryItems.slice(0, 5);
  const middleCol = galleryItems.slice(5, 8);
  const rightCol = galleryItems.slice(8, 13);

  return (
    <ReactLenis root>
      <section className="text-white w-full bg-black px-2 md:px-6 lg:px-8 py-4 md:py-8">
        <div className="grid grid-cols-3 md:grid-cols-12 gap-2 md:gap-3">
          <div className="grid gap-2 md:gap-3 col-span-1 md:col-span-4">
            {leftCol.map((item, idx) => (
              <GalleryCard key={item.key} item={item} priority={idx === 0} className="h-56 sm:h-72 md:h-80" />
            ))}
          </div>

          <div className="col-span-1 md:col-span-4">
            <div className="grid gap-2 md:gap-3 sticky top-24 md:top-6 grid-rows-3">
              {middleCol.map((item, idx) => (
                <GalleryCard key={item.key} item={item} priority={idx === 0} sticky className="h-56 sm:h-72 md:h-80" />
              ))}
            </div>
          </div>

          <div className="grid gap-2 md:gap-3 col-span-1 md:col-span-4">
            {rightCol.map((item, idx) => (
              <GalleryCard key={item.key} item={item} priority={idx === 0} className="h-56 sm:h-72 md:h-80" />
            ))}
          </div>
        </div>
      </section>
    </ReactLenis>
  );
}

function GalleryCard({
  item,
  priority,
  sticky = false,
  className,
}: {
  item: GalleryItem;
  priority?: boolean;
  sticky?: boolean;
  className?: string;
}) {
  return (
    <Link href={item.href} className={sticky ? `w-full block group ${className || ''}` : `w-full block group ${className || ''}`}>
      <figure className={sticky ? 'relative w-full h-full overflow-hidden rounded-md' : 'relative w-full h-full overflow-hidden rounded-md'}>
        <SafeImage
          src={item.src}
          fallbackSrc="/edra-logo.png"
          alt={item.title}
          unoptimized={true}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="transition-transform duration-500 ease-out object-cover group-hover:scale-[1.03]"
          loading={priority ? 'eager' : 'lazy'}
          quality={100}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-90 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute left-2 right-2 bottom-2 md:left-3 md:right-3 md:bottom-4 flex items-end justify-between gap-1 md:gap-3 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-300">
          <span className="text-[10px] leading-tight sm:text-xs md:text-sm font-medium tracking-wide uppercase break-words">{item.title}</span>
          <span className="hidden sm:flex shrink-0 rounded-full border border-white/40 bg-black/35 p-1.5 md:p-2">
            <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4" />
          </span>
        </div>
      </figure>
    </Link>
  );
}
