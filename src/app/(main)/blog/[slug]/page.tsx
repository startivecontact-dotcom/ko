import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, MessageCircle, User, CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import prisma from "@/lib/prisma";

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getPost(slug: string) {
  try {
    return await prisma.post.findUnique({
      where: { slug },
      include: {
        author: { select: { name: true, image: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { name: true, image: true } },
          },
        },
        _count: { select: { comments: true } },
      },
    });
  } catch {
    return null;
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "Article introuvable | KAO Society" };
  return {
    title: `${post.title} | KAO Society`,
    description: post.excerpt ?? post.content.slice(0, 160),
    openGraph: post.image ? { images: [post.image] } : undefined,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  if (!post || !post.published) notFound();

  const authorName = post.author?.name ?? "KAO Society";
  const formattedDate = format(post.createdAt, "d MMMM yyyy", { locale: fr });

  return (
    <>
      {/* ── Back link ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-lavender-200">
        <div className="section py-3">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-heliotrope-600 hover:text-moss-600 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au blog
          </Link>
        </div>
      </div>

      {/* ── Cover image ───────────────────────────────────────────────────── */}
      <div className="relative h-64 md:h-96 w-full overflow-hidden bg-lavender-200">
        {post.image ? (
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-lavender-200 to-lavender-300">
            <span className="font-heading text-7xl font-black text-heliotrope-600 opacity-20 select-none">
              KAO
            </span>
          </div>
        )}
      </div>

      {/* ── Article content ───────────────────────────────────────────────── */}
      <section className="py-12 bg-white">
        <div className="section">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

            {/* ── Main column ─────────────────────────────────────────────── */}
            <article className="lg:col-span-3 space-y-8">
              {/* Title */}
              <h1 className="font-heading text-3xl md:text-4xl font-black text-heliotrope-600 leading-tight">
                {post.title}
              </h1>

              {/* Author + meta row */}
              <div className="flex items-center gap-3 border-b border-lavender-200 pb-6">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-lavender-300">
                  {post.author?.image ? (
                    <Image
                      src={post.author.image}
                      alt={authorName}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <User className="h-5 w-5 text-heliotrope-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-heliotrope-600 truncate">{authorName}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <time dateTime={post.createdAt.toISOString()}>{formattedDate}</time>
                  </div>
                </div>
                {/* Likes + comments */}
                <div className="flex items-center gap-4 text-sm text-gray-400 shrink-0">
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-heliotrope-400" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4 text-moss-500" />
                    {post._count.comments}
                  </span>
                </div>
              </div>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-lg text-gray-600 leading-relaxed border-l-4 border-heliotrope-300 pl-4 italic">
                  {post.excerpt}
                </p>
              )}

              {/* Content */}
              <div className="prose prose-gray prose-headings:font-heading prose-headings:text-heliotrope-600 prose-a:text-heliotrope-600 hover:prose-a:text-moss-600 max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                {post.content}
              </div>
            </article>

            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <aside className="space-y-6">
              {/* Author card */}
              <div className="rounded-2xl border border-lavender-200 bg-lavender-200/30 p-5 space-y-3">
                <h2 className="font-heading font-bold text-heliotrope-600 text-sm uppercase tracking-wider">
                  L&apos;auteur
                </h2>
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-lavender-300">
                    {post.author?.image ? (
                      <Image
                        src={post.author.image}
                        alt={authorName}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="h-6 w-6 text-heliotrope-600" />
                      </div>
                    )}
                  </div>
                  <p className="font-semibold text-heliotrope-600">{authorName}</p>
                </div>
              </div>

              {/* Stats card */}
              <div className="rounded-2xl border border-lavender-200 bg-lavender-200/30 p-5 space-y-3">
                <h2 className="font-heading font-bold text-heliotrope-600 text-sm uppercase tracking-wider">
                  Stats
                </h2>
                <div className="flex flex-col gap-2 text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-heliotrope-400" />
                    {post.likes} j&apos;aime
                  </span>
                  <span className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-moss-500" />
                    {post._count.comments} commentaire{post._count.comments !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Comments ──────────────────────────────────────────────────────── */}
      {post.comments.length > 0 && (
        <section className="py-12 bg-lavender-200">
          <div className="section">
            <div className="max-w-3xl">
              <h2 className="font-heading text-2xl font-black text-heliotrope-600 mb-8">
                Commentaires ({post.comments.length})
              </h2>
              <div className="space-y-4">
                {post.comments.map((comment) => {
                  const commenterName =
                    comment.user?.name ?? comment.authorName ?? "Anonyme";
                  const commentDate = format(comment.createdAt, "d MMM yyyy", { locale: fr });

                  return (
                    <div
                      key={comment.id}
                      className="rounded-2xl bg-white border border-lavender-200 p-5 space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-lavender-300">
                          {comment.user?.image ? (
                            <Image
                              src={comment.user.image}
                              alt={commenterName}
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
                        <div>
                          <p className="text-sm font-semibold text-heliotrope-600">{commenterName}</p>
                          <time
                            dateTime={comment.createdAt.toISOString()}
                            className="text-xs text-gray-400"
                          >
                            {commentDate}
                          </time>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
