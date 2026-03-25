import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// ─── Validation ───────────────────────────────────────────────────────────────

const createCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required").max(5000),
  authorName: z.string().min(1).max(255).optional(),
});

// ─── GET /api/posts/[slug]/comments ──────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug: params.slug },
      select: { id: true, published: true },
    });

    if (!post || !post.published) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comments = await prisma.comment.findMany({
      where: { postId: post.id },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json({ data: comments });
  } catch (error) {
    console.error("[GET /api/posts/[slug]/comments]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── POST /api/posts/[slug]/comments ─────────────────────────────────────────

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

    if (!post || !post.published) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = createCommentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { content, authorName } = parsed.data;
    const userId = session?.user?.id ?? null;

    // Guests must provide an authorName
    if (!userId && !authorName) {
      return NextResponse.json(
        { error: "authorName is required for guest comments" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId: post.id,
        userId: userId ?? undefined,
        authorName: userId ? undefined : authorName,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("[POST /api/posts/[slug]/comments]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
