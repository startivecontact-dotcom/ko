import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

// ─── POST /api/admin/init ─────────────────────────────────────────────────────
//
// Seeds the first ADMIN user if none exists.
// Protected by an x-init-secret header that must match NEXTAUTH_SECRET
// (or the INIT_SECRET env var if set).
//
// FOR DEVELOPMENT USE ONLY — disable or remove in production.

export async function POST(request: NextRequest) {
  try {
    // ── Guard: check secret header ─────────────────────────────────────────
    const providedSecret = request.headers.get("x-init-secret");
    const expectedSecret = process.env.INIT_SECRET ?? process.env.NEXTAUTH_SECRET;

    if (!expectedSecret) {
      return NextResponse.json(
        { error: "Server misconfiguration: no secret configured" },
        { status: 500 }
      );
    }

    if (!providedSecret || providedSecret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Guard: bail out if an ADMIN already exists ─────────────────────────
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "An ADMIN user already exists. Init aborted." },
        { status: 409 }
      );
    }

    // ── Parse optional body (email / name / password) ──────────────────────
    let body: {
      email?: string;
      name?: string;
      password?: string;
    } = {};

    try {
      body = await request.json();
    } catch {
      // Body is optional — use defaults if absent
    }

    const email = (body.email ?? "admin@kaosociety.fr").toLowerCase().trim();
    const name = body.name ?? "Admin KAO";
    const rawPassword = body.password ?? "KAOadmin2024!";

    // ── Hash password ──────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(rawPassword, 12);

    // ── Create admin user ──────────────────────────────────────────────────
    const admin = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "ADMIN",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Admin user created successfully.",
        user: admin,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/admin/init]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create admin user",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
