import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-heliotrope-700 text-white mt-auto">
      <div className="section py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-full bg-moss-500 flex items-center justify-center text-white font-heading font-bold text-sm">
                K
              </span>
              <span className="font-heading font-bold text-lg">KAO Society</span>
            </div>
            <p className="text-heliotrope-200 text-sm leading-relaxed">
              La communauté des passionnés d&apos;activités outdoor — randonnée, escalade et bien plus.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-moss-300 mb-3">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/evenements", label: "Événements" },
                { href: "/activites", label: "Activités" },
                { href: "/communaute", label: "Communauté" },
                { href: "/a-propos", label: "À propos" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-heliotrope-200 hover:text-white no-underline transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-moss-300 mb-3">
              Légal
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/mentions-legales", label: "Mentions légales" },
                { href: "/confidentialite", label: "Confidentialité" },
                { href: "/cgu", label: "CGU" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-heliotrope-200 hover:text-white no-underline transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-heliotrope-600 pt-6 text-center text-sm text-heliotrope-300">
          © {year} KAO Society — Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
