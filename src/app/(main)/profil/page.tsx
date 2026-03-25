import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import ProfileForm from "./ProfileForm";
import { User, Mail, Phone, CalendarDays, ShieldCheck, Hash } from "lucide-react";
import Image from "next/image";

// ─── Page ─────────────────────────────────────────────────────────────────────

export const metadata = { title: "Mon profil" };

export default async function ProfilPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/connexion");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          registrations: true,
          posts: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/auth/connexion");
  }

  const roleLabel = user.role === "ADMIN" ? "Administrateur" : "Membre";
  const roleClasses =
    user.role === "ADMIN"
      ? "badge bg-heliotrope-100 text-heliotrope-700"
      : "badge bg-moss-100 text-moss-700";

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── Header card ── */}
        <div className="card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

            {/* Avatar */}
            <div className="relative shrink-0">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? "Avatar"}
                  width={96}
                  height={96}
                  className="rounded-full object-cover ring-4 ring-lavender-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-heliotrope-600 to-moss-500 flex items-center justify-center ring-4 ring-lavender-200">
                  <span className="text-3xl font-heading font-bold text-white select-none">
                    {(user.name ?? user.email)[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Name / email / role */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-heliotrope-600">
                {user.name ?? "Sans nom"}
              </h1>
              <p className="text-gray-500 mt-0.5">{user.email}</p>
              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className={roleClasses}>
                  <ShieldCheck className="w-3 h-3" />
                  {roleLabel}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex sm:flex-col gap-6 sm:gap-4 text-center">
              <div>
                <p className="text-2xl font-heading font-bold text-heliotrope-600">
                  {user._count.registrations}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Inscriptions</p>
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-moss-500">
                  {user._count.posts}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Articles</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="mt-6 text-gray-700 leading-relaxed border-t border-lavender-200 pt-5">
              {user.bio}
            </p>
          )}

          {/* Read-only info row */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-lavender-200 pt-5">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-heliotrope-400 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-heliotrope-400 shrink-0" />
                <span>{user.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <CalendarDays className="w-4 h-4 text-heliotrope-400 shrink-0" />
              <span>Membre depuis {formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* ── Edit form card ── */}
        <div className="card p-6 sm:p-8">
          <h2 className="text-xl font-heading font-bold text-heliotrope-600 mb-6">
            Modifier mon profil
          </h2>

          {/* Read-only fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 rounded-xl bg-lavender-50 border border-lavender-200">
            <div>
              <label className="label">Adresse e-mail</label>
              <div className="input bg-gray-50 text-gray-500 cursor-not-allowed flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                {user.email}
              </div>
              <p className="text-xs text-gray-400 mt-1">L'e-mail ne peut pas être modifié.</p>
            </div>
            <div>
              <label className="label">Rôle</label>
              <div className="input bg-gray-50 text-gray-500 cursor-not-allowed flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                {roleLabel}
              </div>
              <p className="text-xs text-gray-400 mt-1">Le rôle est géré par les administrateurs.</p>
            </div>
          </div>

          <ProfileForm
            initialName={user.name ?? ""}
            initialBio={user.bio ?? ""}
            initialPhone={user.phone ?? ""}
          />
        </div>
      </div>
    </div>
  );
}
