import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// ─── POST /api/posts/[slug]/likes ─────────────────────────────────────────────
// Toggles a like on the post. Authenticated users are identified by userId;
// unauthenticated visitors are identified by their IP address.

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    const post = await prisma.post.findUnique({
      where: { slug: params.slug },
      select: { id: true, published: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (!post.published && session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const userId = session?.user?.id ?? null;

    // Resolve IP for guest likes
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    let liked: boolean;

    if (userId) {
      // Authenticated: toggle by userId
      const existing = await prisma.like.findUnique({
        where: { postId_userId: { postId: post.id, userId } },
        select: { id: true },
      });

      if (existing) {
        await prisma.like.delete({ where: { id: existing.id } });
        liked = false;
      } else {
        await prisma.like.create({
          data: { postId: post.id, userId },
        });
        liked = true;
      }
    } else {
      // Guest: toggle by IP (best-effort, not unique constrained)
      const existing = await prisma.like.findFirst({
        where: { postId: post.id, ipAddress: ip, userId: null },
        select: { id: true },
      });

      if (existing) {
        await prisma.like.delete({ where: { id: existing.id } });
        liked = false;
      } else {
        await prisma.like.create({
          data: { postId: post.id, ipAddress: ip },
        });
        liked = true;
      }
    }

    const count = await prisma.like.count({ where: { postId: post.id } });

    return NextResponse.json({ liked, count });
  } catch (error) {
    console.error("[POST /api/posts/[slug]/likes]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
