import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// ─── Validation ───────────────────────────────────────────────────────────────

const registerSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  guestName: z.string().min(1).max(255).optional(),
  guestEmail: z.string().email().optional(),
});

const cancelSchema = z.object({
  registrationId: z.string().min(1, "Registration ID is required"),
});

// ─── GET /api/registrations ───────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const registrations = await prisma.registration.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            date: true,
            endDate: true,
            location: true,
            image: true,
            category: true,
            level: true,
          },
        },
      },
    });

    return NextResponse.json({ data: registrations });
  } catch (error) {
    console.error("[GET /api/registrations]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── POST /api/registrations ──────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { eventId, guestName, guestEmail } = parsed.data;
    const userId = session?.user?.id ?? null;

    // Guests must provide name and email
    if (!userId && (!guestName || !guestEmail)) {
      return NextResponse.json(
        { error: "Guest registrations require guestName and guestEmail" },
        { status: 400 }
      );
    }

    // Fetch event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: { select: { registrations: true } },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!event.isPublished) {
      return NextResponse.json({ error: "Event is not available for registration" }, { status: 400 });
    }

    if (event.maxParticipants !== null && event._count.registrations >= event.maxParticipants) {
      return NextResponse.json({ error: "Event is full" }, { status: 409 });
    }

    // Check duplicate (authenticated users only — guests can register multiple times)
    if (userId) {
      const existing = await prisma.registration.findUnique({
        where: { userId_eventId: { userId, eventId } },
        select: { id: true },
      });

      if (existing) {
        return NextResponse.json({ error: "Already registered for this event" }, { status: 409 });
      }
    }

    const registration = await prisma.registration.create({
      data: {
        eventId,
        userId: userId ?? undefined,
        guestName: userId ? undefined : guestName,
        guestEmail: userId ? undefined : guestEmail,
        status: "PENDING",
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            date: true,
            location: true,
          },
        },
      },
    });

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    console.error("[POST /api/registrations]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── DELETE /api/registrations ────────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = cancelSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { registrationId } = parsed.data;

    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      select: { id: true, userId: true },
    });

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    // Only the owner or an admin can cancel
    if (registration.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.registration.delete({ where: { id: registrationId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/registrations]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
