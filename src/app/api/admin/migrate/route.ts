import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ─── POST /api/admin/migrate ──────────────────────────────────────────────────
//
// NOTE: This endpoint does NOT run DDL migrations. Schema migrations should be
// managed via `prisma migrate deploy` (CI/CD) or `prisma migrate dev` (local).
//
// This endpoint verifies the database connection is alive and is protected by
// the INIT_SECRET header to prevent abuse.

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get("x-init-secret");
    const expectedSecret = process.env.INIT_SECRET;

    if (!expectedSecret) {
      return NextResponse.json(
        { error: "INIT_SECRET environment variable is not configured" },
        { status: 500 }
      );
    }

    if (!secret || secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      success: true,
      message:
        "Database connection is healthy. Run schema migrations via `prisma migrate deploy`.",
    });
  } catch (error) {
    console.error("[POST /api/admin/migrate]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Database connection failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
