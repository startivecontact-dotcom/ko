import { BookOpen } from "lucide-react";

import prisma from "@/lib/prisma";
import PostCard from "@/components/blog/PostCard";

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getPosts() {
  try {
    return await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true, image: true } },
        _count: { select: { comments: true } },
      },
    });
  } catch {
    return [];
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const metadata = {
  title: "Blog | KAO Society",
  description:
    "Récits d'aventure, conseils et inspirations de la communauté KAO — randonnée, escalade et plein air.",
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-br from-heliotrope-600 via-heliotrope-700 to-moss-600 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-moss-400/20 blur-3xl" />
        </div>
        <div className="section relative text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-black text-white mb-4">
            Le blog KAO
          </h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            Récits d&apos;aventure, conseils pratiques et inspirations partagés par la communauté.
          </p>
        </div>
      </section>

      {/* ── Posts grid ────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="section">
          {posts.length > 0 ? (
            <>
              <p className="text-sm text-gray-500 mb-8">
                {posts.length} article{posts.length !== 1 ? "s" : ""} publié{posts.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    id={post.id}
                    title={post.title}
                    slug={post.slug}
                    excerpt={post.excerpt}
                    image={post.image}
                    createdAt={post.createdAt}
                    author={post.author}
                    likes={post.likes}
                    commentCount={post._count.comments}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 rounded-2xl bg-lavender-200/40 text-center">
              <BookOpen className="h-14 w-14 text-heliotrope-300 mb-4" />
              <p className="font-heading font-bold text-heliotrope-600 text-xl mb-2">
                Aucun article publié
              </p>
              <p className="text-gray-500 text-sm max-w-xs">
                La rédaction est en route — revenez bientôt pour lire les premières aventures !
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
