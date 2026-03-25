import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// ─── GET /api/admin/members ───────────────────────────────────────────────────
//
// Returns a paginated list of all users.
// Requires an authenticated ADMIN session.

export async function GET(request: NextRequest) {
  try {
    // ── Auth check ─────────────────────────────────────────────────────────
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── Parse query params ─────────────────────────────────────────────────
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE), 10))
    );
    const skip = (page - 1) * pageSize;

    // Optional role filter
    const roleParam = searchParams.get("role");
    const roleFilter =
      roleParam === "ADMIN" || roleParam === "USER"
        ? { role: roleParam as "ADMIN" | "USER" }
        : {};

    // ── Fetch data ─────────────────────────────────────────────────────────
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: roleFilter,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              registrations: true,
              posts: true,
            },
          },
        },
      }),
      prisma.user.count({ where: roleFilter }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      data: users,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/members]", error);
    return NextResponse.json(
      {
        error: "Failed to fetch members",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
