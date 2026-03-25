import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { EventCategory, EventLevel } from "@prisma/client";

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
    const existing = await prisma.event.findUnique({
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

const updateEventSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  shortDesc: z.string().max(500).optional().nullable(),
  date: z.string().datetime().optional(),
  endDate: z.string().datetime().optional().nullable(),
  location: z.string().min(1).optional(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  maxParticipants: z.number().int().positive().optional().nullable(),
  category: z.nativeEnum(EventCategory).optional(),
  level: z.nativeEnum(EventLevel).optional(),
  image: z.string().url().optional().nullable(),
  price: z.number().min(0).optional(),
  isPublished: z.boolean().optional(),
});

// ─── GET /api/events/[id] ─────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        organizer: {
          select: { id: true, name: true, email: true, image: true },
        },
        _count: { select: { registrations: true } },
        ...(userId
          ? {
              registrations: {
                where: { userId },
                select: {
                  id: true,
                  status: true,
                  createdAt: true,
                },
              },
            }
          : {}),
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Non-admins can only view published events
    if (!event.isPublished && session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("[GET /api/events/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── PUT /api/events/[id] ─────────────────────────────────────────────────────

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await prisma.event.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateEventSchema.safeParse(body);

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
      updateData.slug = await uniqueSlug(generateSlug(data.title), params.id);
    }
    if (data.description !== undefined) updateData.description = data.description;
    if ("shortDesc" in data) updateData.shortDesc = data.shortDesc;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if ("endDate" in data) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.location !== undefined) updateData.location = data.location;
    if ("lat" in data) updateData.lat = data.lat;
    if ("lng" in data) updateData.lng = data.lng;
    if ("maxParticipants" in data) updateData.maxParticipants = data.maxParticipants;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.level !== undefined) updateData.level = data.level;
    if ("image" in data) updateData.image = data.image;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

    const event = await prisma.event.update({
      where: { id: params.id },
      data: updateData,
      include: {
        organizer: {
          select: { id: true, name: true, email: true, image: true },
        },
        _count: { select: { registrations: true } },
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("[PUT /api/events/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── DELETE /api/events/[id] ──────────────────────────────────────────────────

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await prisma.event.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await prisma.event.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/events/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
