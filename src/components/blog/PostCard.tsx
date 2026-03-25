import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle, User } from "lucide-react";

import { formatDate, formatRelativeDate, truncate } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PostAuthor {
  name?: string | null;
  image?: string | null;
}

interface PostCardProps {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  image?: string | null;
  createdAt: Date | string;
  author?: PostAuthor | null;
  likes?: number;
  commentCount?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PostCard({
  id,
  title,
  slug,
  excerpt,
  image,
  createdAt,
  author,
  likes = 0,
  commentCount = 0,
}: PostCardProps) {
  const authorName = author?.name ?? "KAO Society";
  const formattedDate = formatDate(createdAt, "d MMM yyyy");
  const relativeDate = formatRelativeDate(createdAt);

  return (
    <Link
      href={`/blog/${slug}`}
      className="group block rounded-2xl bg-white shadow-brand overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-brand-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-heliotrope-500 focus-visible:ring-offset-2"
      aria-label={`Lire l'article : ${title}`}
    >
      {/* ── Cover image ──────────────────────────────────────────────────── */}
      <div className="relative h-48 w-full overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-lavender-200 to-lavender-300">
            <span className="font-heading text-4xl font-black text-heliotrope-600 opacity-30 select-none">
              KAO
            </span>
          </div>
        )}
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 p-4">
        {/* Author + date row */}
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-lavender-300">
            {author?.image ? (
              <Image
                src={author.image}
                alt={authorName}
                fill
                sizes="32px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-4 w-4 text-heliotrope-600" />
              </div>
            )}
          </div>

          {/* Author name + date */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-heliotrope-600">
              {authorName}
            </p>
            <time
              dateTime={
                typeof createdAt === "string" ? createdAt : createdAt.toISOString()
              }
              title={formattedDate}
              className="text-xs text-gray-400"
            >
              {relativeDate}
            </time>
          </div>
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 font-heading text-base font-bold leading-snug text-heliotrope-600 transition-colors group-hover:text-heliotrope-500">
          {title}
        </h3>

        {/* Excerpt */}
        {excerpt && (
          <p className="line-clamp-3 text-sm leading-relaxed text-gray-500">
            {truncate(excerpt, 160)}
          </p>
        )}

        {/* Footer: likes + comments */}
        <div className="flex items-center gap-4 border-t border-lavender-200 pt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5 text-heliotrope-400" />
            <span>{likes}</span>
            <span className="sr-only">j&apos;aime</span>
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5 text-moss-500" />
            <span>{commentCount}</span>
            <span className="sr-only">commentaire{commentCount !== 1 ? "s" : ""}</span>
          </span>
          <span className="ml-auto">{formattedDate}</span>
        </div>
      </div>
    </Link>
  );
}
