import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bienvenue",
};

export default function BienvenuePage() {
  return (
    <div className="animate-scale-in">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3 no-underline group">
          <span className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white font-heading font-black text-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
            K
          </span>
          <span className="font-heading font-black text-2xl text-white tracking-tight">
            KAO Society
          </span>
        </Link>
      </div>

      {/* Card */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-brand-lg p-8 text-center">
        {/* Illustration */}
        <div className="relative mx-auto w-24 h-24 mb-6">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-heliotrope-100 to-moss-100 animate-pulse" />
          {/* Inner circle */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-heliotrope-500 to-moss-500 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3l14 9-14 9V3z"
              />
            </svg>
          </div>
        </div>

        <h1 className="font-heading font-black text-3xl text-heliotrope-600 mb-3">
          Bienvenue dans la communauté KAO !
        </h1>
        <p className="text-gray-500 leading-relaxed mb-2">
          Nous sommes ravis de vous accueillir parmi les passionnés d&apos;outdoor
          de la KAO Society.
        </p>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Explorez les événements, rejoignez des sorties et rencontrez d&apos;autres
          aventuriers près de chez vous.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary py-3 px-6 text-sm">
            Découvrir la communauté
          </Link>
          <Link href="/profil" className="btn-outline py-3 px-6 text-sm">
            Compléter mon profil
          </Link>
        </div>

        {/* Activity badges */}
        <div className="mt-8 pt-6 border-t border-lavender-200">
          <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">
            Activités disponibles
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { icon: "🥾", label: "Randonnée" },
              { icon: "🧗", label: "Escalade" },
              { icon: "🚵", label: "VTT" },
              { icon: "🏕️", label: "Camping" },
              { icon: "🏄", label: "Surf" },
              { icon: "🎿", label: "Ski" },
            ].map(({ icon, label }) => (
              <span key={label} className="badge-purple px-3 py-1 text-xs">
                {icon} {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
