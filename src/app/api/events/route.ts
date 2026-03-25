import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { EventCategory, EventLevel, Prisma } from "@prisma/client";

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

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let counter = 1;
  while (await prisma.event.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${counter}`;
    counter++;
  }
  return slug;
}

// ─── Validation ───────────────────────────────────────────────────────────────

const createEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(1, "Description is required"),
  shortDesc: z.string().max(500).optional(),
  date: z.string().datetime("Invalid date"),
  endDate: z.string().datetime().optional(),
  location: z.string().min(1, "Location is required"),
  lat: z.number().optional(),
  lng: z.number().optional(),
  maxParticipants: z.number().int().positive().optional(),
  category: z.nativeEnum(EventCategory).optional(),
  level: z.nativeEnum(EventLevel).optional(),
  image: z.string().url().optional(),
  price: z.number().min(0).optional(),
  isPublished: z.boolean().optional(),
});

// ─── GET /api/events ──────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category") as EventCategory | null;
    const level = searchParams.get("level") as EventLevel | null;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "12", 10)));
    const search = searchParams.get("search");
    const upcoming = searchParams.get("upcoming");

    const where: Prisma.EventWhereInput = {
      isPublished: true,
    };

    if (category && Object.values(EventCategory).includes(category)) {
      where.category = category;
    }

    if (level && Object.values(EventLevel).includes(level)) {
      where.level = level;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    if (upcoming === "true") {
      where.date = { gte: new Date() };
    }

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "asc" },
        include: {
          _count: { select: { registrations: true } },
        },
      }),
      prisma.event.count({ where }),
    ]);

    return NextResponse.json({
      data: events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/events]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── POST /api/events ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const slug = await uniqueSlug(generateSlug(data.title));

    const event = await prisma.event.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        shortDesc: data.shortDesc,
        date: new Date(data.date),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        location: data.location,
        lat: data.lat,
        lng: data.lng,
        maxParticipants: data.maxParticipants,
        category: data.category ?? "OUTDOOR",
        level: data.level ?? "MOYEN",
        image: data.image,
        price: data.price ?? 0,
        isPublished: data.isPublished ?? false,
        organizerId: session.user.id,
      },
      include: {
        _count: { select: { registrations: true } },
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("[POST /api/events]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
