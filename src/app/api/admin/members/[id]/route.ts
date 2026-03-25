import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized", status: 401 } as const;
  if (session.user?.role !== "ADMIN") return { error: "Forbidden", status: 403 } as const;
  return { session };
}

// ─── PATCH /api/admin/members/[id] ───────────────────────────────────────────
//
// Updates a member's role (USER | ADMIN).
// Requires an authenticated ADMIN session.

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = params;

    // ── Parse body ─────────────────────────────────────────────────────────
    let body: { role?: string } = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body.role || !["USER", "ADMIN"].includes(body.role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "USER" or "ADMIN".' },
        { status: 400 }
      );
    }

    // ── Guard: prevent admin from demoting themselves ──────────────────────
    if (auth.session.user?.id === id && body.role === "USER") {
      return NextResponse.json(
        { error: "You cannot remove your own ADMIN role." },
        { status: 400 }
      );
    }

    // ── Check target user exists ───────────────────────────────────────────
    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ── Update ─────────────────────────────────────────────────────────────
    const updated = await prisma.user.update({
      where: { id },
      data: { role: body.role as "USER" | "ADMIN" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("[PATCH /api/admin/members/[id]]", error);
    return NextResponse.json(
      {
        error: "Failed to update member",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/admin/members/[id] ──────────────────────────────────────────
//
// Permanently deletes a member account and all cascade-deleted relations.
// Requires an authenticated ADMIN session.

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = params;

    // ── Guard: prevent admin from deleting themselves ──────────────────────
    if (auth.session.user?.id === id) {
      return NextResponse.json(
        { error: "You cannot delete your own account via this endpoint." },
        { status: 400 }
      );
    }

    // ── Check user exists ──────────────────────────────────────────────────
    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ── Delete ─────────────────────────────────────────────────────────────
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `User ${existing.email} deleted successfully.`,
    });
  } catch (error) {
    console.error("[DELETE /api/admin/members/[id]]", error);
    return NextResponse.json(
      {
        error: "Failed to delete member",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
