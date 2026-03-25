import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function uniqueSlug(base: string, excludeId: string): Promise<string> {
  let slug = base;
  let counter = 1;
  while (true) {
    const existing = await prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) break;
    slug = `${base}-${counter}`;
    counter++;
  }
  return slug;
}

// ─── Validation ───────────────────────────────────────────────────────────────

const updatePostSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(1000).optional().nullable(),
  image: z.string().url().optional().nullable(),
  published: z.boolean().optional(),
});

// ─── GET /api/posts/[slug] ────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    const post = await prisma.post.findUnique({
      where: { slug: params.slug },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
        },
        _count: {
          select: { postLikes: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Non-admins can only view published posts
    if (!post.published && session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("[GET /api/posts/[slug]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── PUT /api/posts/[slug] ────────────────────────────────────────────────────

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await prisma.post.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updatePostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
      updateData.slug = await uniqueSlug(generateSlug(data.title), existing.id);
    }
    if (data.content !== undefined) updateData.content = data.content;
    if ("excerpt" in data) updateData.excerpt = data.excerpt;
    if ("image" in data) updateData.image = data.image;
    if (data.published !== undefined) updateData.published = data.published;

    const post = await prisma.post.update({
      where: { id: existing.id },
      data: updateData,
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
        _count: {
          select: { comments: true, postLikes: true },
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("[PUT /api/posts/[slug]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── DELETE /api/posts/[slug] ─────────────────────────────────────────────────

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await prisma.post.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma.post.delete({ where: { id: existing.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/posts/[slug]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
