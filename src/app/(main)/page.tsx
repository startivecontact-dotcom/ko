import Link from "next/link";
import { ArrowRight, Mountain, Anchor, TreePine, Dumbbell, UtensilsCrossed, Users, CalendarDays, BookOpen } from "lucide-react";
import prisma from "@/lib/prisma";
import EventCard from "@/components/events/EventCard";
import PostCard from "@/components/blog/PostCard";

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getRecentEvents() {
  try {
    return await prisma.event.findMany({
      where: { isPublished: true, date: { gte: new Date() } },
      orderBy: { date: "asc" },
      take: 3,
      include: {
        organizer: { select: { name: true, image: true } },
        _count: { select: { registrations: true } },
      },
    });
  } catch {
    return [];
  }
}

async function getRecentPosts() {
  try {
    return await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        author: { select: { name: true, image: true } },
        _count: { select: { comments: true } },
      },
    });
  } catch {
    return [];
  }
}

// ─── Activities config ────────────────────────────────────────────────────────

const ACTIVITIES = [
  {
    slug: "randonnee",
    label: "Randonnée",
    emoji: "🥾",
    Icon: Mountain,
    description: "Explorez sentiers et sommets en pleine nature",
    color: "from-green-400 to-moss-500",
    bg: "bg-green-50 hover:bg-green-100",
    iconColor: "text-green-700",
  },
  {
    slug: "escalade",
    label: "Escalade",
    emoji: "🧗",
    Icon: Anchor,
    description: "Grimpez en falaise ou en salle, tous niveaux",
    color: "from-heliotrope-400 to-heliotrope-600",
    bg: "bg-heliotrope-50 hover:bg-heliotrope-100",
    iconColor: "text-heliotrope-700",
  },
  {
    slug: "outdoor",
    label: "Outdoor",
    emoji: "🌿",
    Icon: TreePine,
    description: "Aventures en plein air, nature et grand air",
    color: "from-moss-400 to-moss-600",
    bg: "bg-moss-50 hover:bg-moss-100",
    iconColor: "text-moss-700",
  },
  {
    slug: "indoor",
    label: "Indoor",
    emoji: "🏋️",
    Icon: Dumbbell,
    description: "Sport et bien-être en salle toute l'année",
    color: "from-blue-400 to-blue-600",
    bg: "bg-blue-50 hover:bg-blue-100",
    iconColor: "text-blue-700",
  },
  {
    slug: "eat-and-meet",
    label: "Eat & Meet",
    emoji: "🍽️",
    Icon: UtensilsCrossed,
    description: "Partagez un repas et rencontrez la communauté",
    color: "from-orange-400 to-orange-600",
    bg: "bg-orange-50 hover:bg-orange-100",
    iconColor: "text-orange-700",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [events, posts] = await Promise.all([getRecentEvents(), getRecentPosts()]);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-hero">
        {/* Background decorative shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-heliotrope-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-moss-500/25 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-heliotrope-700/10 blur-3xl" />
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative section py-24 text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm text-white/90 mb-8">
            <span className="h-2 w-2 rounded-full bg-moss-300 animate-pulse" />
            Communauté outdoor active en France
          </div>

          {/* Main headline */}
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight text-balance">
            Explorez.{" "}
            <span className="text-moss-300">Grimpez.</span>{" "}
            Partagez.
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed">
            La communauté outdoor qui vous ressemble — randonnée, escalade, nature et bien plus encore.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/evenements"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-heading font-bold text-heliotrope-700 shadow-brand-lg transition-all duration-200 hover:bg-lavender-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <CalendarDays className="h-5 w-5" />
              Voir les événements
            </Link>
            <Link
              href="/auth/inscription"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/70 px-8 py-4 font-heading font-bold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:border-white hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Users className="h-5 w-5" />
              Rejoindre la communauté
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: "500+", label: "Membres" },
              { value: "120+", label: "Événements" },
              { value: "5", label: "Activités" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="font-heading text-3xl font-black text-white">{value}</div>
                <div className="text-sm text-white/60 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Activités ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="section">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-black text-heliotrope-600 mb-3">
              Nos activités
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Que vous soyez débutant ou confirmé, trouvez l'activité qui vous correspond.
            </p>
          </div>

          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide md:grid md:grid-cols-5 md:overflow-visible md:pb-0">
            {ACTIVITIES.map(({ slug, label, emoji, Icon, description, bg, iconColor }) => (
              <Link
                key={slug}
                href={`/activites/${slug}`}
                className={`group flex-shrink-0 w-56 md:w-auto rounded-2xl ${bg} border border-transparent hover:border-lavender-300 p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-heliotrope-500`}
              >
                <div className={`w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <div className="text-2xl mb-2">{emoji}</div>
                <h3 className={`font-heading font-bold text-base ${iconColor} mb-1`}>{label}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Événements à venir ─────────────────────────────────────────────── */}
      <section className="py-20 bg-lavender-200">
        <div className="section">
          <div className="flex items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-black text-heliotrope-600 mb-2">
                Événements à venir
              </h2>
              <p className="text-gray-500">Rejoignez-nous lors de nos prochaines sorties et rencontres.</p>
            </div>
            <Link
              href="/evenements"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-heliotrope-600 hover:text-moss-600 transition-colors shrink-0"
            >
              Tous les événements
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  slug={event.slug}
                  shortDesc={event.shortDesc}
                  date={event.date}
                  endDate={event.endDate}
                  location={event.location}
                  category={event.category}
                  level={event.level}
                  image={event.image}
                  maxParticipants={event.maxParticipants}
                  registrationCount={event._count.registrations}
                  price={event.price}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl bg-white/60">
              <CalendarDays className="h-12 w-12 mx-auto text-heliotrope-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">Aucun événement à venir pour le moment.</p>
              <p className="text-gray-400 text-sm mt-1">Revenez bientôt — de nouvelles sorties arrivent !</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Blog ──────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="section">
          <div className="flex items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-black text-heliotrope-600 mb-2">
                Le blog KAO
              </h2>
              <p className="text-gray-500">Récits d'aventure, conseils et inspirations de la communauté.</p>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-heliotrope-600 hover:text-moss-600 transition-colors shrink-0"
            >
              Lire le blog
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  slug={post.slug}
                  excerpt={post.excerpt}
                  image={post.image}
                  createdAt={post.createdAt}
                  author={post.author}
                  likes={post.likes}
                  commentCount={post._count.comments}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl bg-lavender-200/60">
              <BookOpen className="h-12 w-12 mx-auto text-heliotrope-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">Aucun article publié pour le moment.</p>
              <p className="text-gray-400 text-sm mt-1">La rédaction est en route — à très bientôt !</p>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Join ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-heliotrope-600 via-heliotrope-700 to-moss-600 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 h-64 w-64 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-moss-400/20 translate-x-1/3 translate-y-1/3 blur-2xl pointer-events-none" />

        <div className="section relative text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm text-white/90 mb-6">
              <Users className="h-4 w-4" />
              Rejoignez 500+ aventuriers
            </div>

            <h2 className="font-heading text-4xl md:text-5xl font-black text-white mb-5 leading-tight text-balance">
              Prêt·e à vivre l'aventure ?
            </h2>
            <p className="text-white/75 text-lg mb-10 leading-relaxed">
              Créez votre compte gratuitement, rejoignez des événements près de chez vous et connectez-vous avec des passionnés qui partagent votre amour du plein air.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/inscription"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-heading font-bold text-heliotrope-700 shadow-brand-lg transition-all duration-200 hover:bg-lavender-200 hover:scale-105"
              >
                Créer un compte gratuit
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/evenements"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/60 px-8 py-4 font-heading font-bold text-white transition-all duration-200 hover:bg-white/10 hover:border-white"
              >
                Découvrir les événements
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
