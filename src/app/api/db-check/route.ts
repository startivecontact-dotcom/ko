import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ─── GET /api/db-check ────────────────────────────────────────────────────────
// Public diagnostic endpoint that tests the database connection.
// Returns: { status: "ok" | "error", tables: string[], userCount: number }

export async function GET(request: NextRequest) {
  try {
    // Test connection
    await prisma.$queryRaw`SELECT 1`;

    // Query existing table names from information_schema
    const tableRows = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    const tables = tableRows.map((r) => r.table_name);

    const userCount = await prisma.user.count();

    return NextResponse.json({
      status: "ok",
      tables,
      userCount,
    });
  } catch (error) {
    console.error("[GET /api/db-check]", error);
    return NextResponse.json(
      {
        status: "error",
        tables: [],
        userCount: 0,
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
