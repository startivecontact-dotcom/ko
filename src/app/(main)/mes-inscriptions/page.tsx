import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import CategoryBadge from "@/components/ui/CategoryBadge";
import RegistrationsList from "./RegistrationsList";

// ─── Page ─────────────────────────────────────────────────────────────────────

export const metadata = { title: "Mes inscriptions" };

export default async function MesInscriptionsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/connexion");
  }

  const now = new Date();

  const registrations = await prisma.registration.findMany({
    where: { userId: session.user.id },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          slug: true,
          date: true,
          endDate: true,
          location: true,
          category: true,
          level: true,
          image: true,
        },
      },
    },
    orderBy: { event: { date: "asc" } },
  });

  // Split into tabs
  const upcoming = registrations.filter(
    (r) => r.status !== "CANCELLED" && r.event.date >= now
  );
  const past = registrations.filter(
    (r) => r.status !== "CANCELLED" && r.event.date < now
  );
  const cancelled = registrations.filter((r) => r.status === "CANCELLED");

  // Serialise dates for client
  type SerializedReg = {
    id: string;
    status: string;
    createdAt: string;
    event: {
      id: string;
      title: string;
      slug: string;
      date: string;
      endDate: string | null;
      location: string;
      category: string;
      level: string;
      image: string | null;
    };
  };

  function serialize(reg: typeof registrations[number]): SerializedReg {
    return {
      id: reg.id,
      status: reg.status,
      createdAt: reg.createdAt.toISOString(),
      event: {
        id: reg.event.id,
        title: reg.event.title,
        slug: reg.event.slug,
        date: reg.event.date.toISOString(),
        endDate: reg.event.endDate?.toISOString() ?? null,
        location: reg.event.location,
        category: reg.event.category,
        level: reg.event.level,
        image: reg.event.image,
      },
    };
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        <div className="mb-8">
          <h1 className="page-title">Mes inscriptions</h1>
          <p className="text-gray-600">
            Retrouvez l'ensemble de vos inscriptions aux événements KAO Society.
          </p>
        </div>

        <RegistrationsList
          upcoming={upcoming.map(serialize)}
          past={past.map(serialize)}
          cancelled={cancelled.map(serialize)}
        />
      </div>
    </div>
  );
}
