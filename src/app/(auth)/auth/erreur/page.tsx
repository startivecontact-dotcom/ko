import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Erreur d'authentification",
};

// ─── Error definitions ────────────────────────────────────────────────────────

interface ErrorInfo {
  title: string;
  description: string;
  action: { label: string; href: string };
  icon: "lock" | "link" | "mail" | "alert" | "user";
}

const ERROR_MAP: Record<string, ErrorInfo> = {
  OAuthSignin: {
    title: "Connexion OAuth impossible",
    description:
      "Une erreur s'est produite lors du lancement de la connexion avec le fournisseur. Veuillez réessayer.",
    action: { label: "Réessayer la connexion", href: "/auth/connexion" },
    icon: "link",
  },
  OAuthCallback: {
    title: "Retour OAuth échoué",
    description:
      "Le fournisseur a renvoyé une erreur lors du traitement de votre connexion. Cela peut être temporaire.",
    action: { label: "Retour à la connexion", href: "/auth/connexion" },
    icon: "link",
  },
  OAuthCreateAccount: {
    title: "Création de compte impossible",
    description:
      "Votre compte n'a pas pu être créé via ce fournisseur. Essayez de vous inscrire manuellement.",
    action: { label: "Créer un compte", href: "/auth/inscription" },
    icon: "user",
  },
  EmailCreateAccount: {
    title: "Erreur de création de compte",
    description:
      "Impossible de créer un compte avec cet email. Il est peut-être déjà utilisé.",
    action: { label: "Se connecter", href: "/auth/connexion" },
    icon: "mail",
  },
  Callback: {
    title: "Erreur de traitement",
    description:
      "Une erreur est survenue lors du traitement de votre connexion. Veuillez réessayer.",
    action: { label: "Réessayer", href: "/auth/connexion" },
    icon: "alert",
  },
  OAuthAccountNotLinked: {
    title: "Compte déjà existant",
    description:
      "Cet email est déjà associé à un compte utilisant un autre mode de connexion. Connectez-vous avec la méthode d'origine (email/mot de passe ou autre fournisseur OAuth).",
    action: { label: "Se connecter", href: "/auth/connexion" },
    icon: "link",
  },
  EmailSignin: {
    title: "Email de connexion non envoyé",
    description:
      "L'email de connexion n'a pas pu être envoyé. Vérifiez votre adresse email et réessayez.",
    action: { label: "Retour à la connexion", href: "/auth/connexion" },
    icon: "mail",
  },
  CredentialsSignin: {
    title: "Identifiants incorrects",
    description:
      "L'email ou le mot de passe que vous avez saisi est incorrect. Vérifiez vos informations et réessayez.",
    action: { label: "Réessayer", href: "/auth/connexion" },
    icon: "lock",
  },
  SessionRequired: {
    title: "Connexion requise",
    description:
      "Vous devez être connecté pour accéder à cette page. Veuillez vous identifier.",
    action: { label: "Se connecter", href: "/auth/connexion" },
    icon: "lock",
  },
  Default: {
    title: "Erreur d'authentification",
    description:
      "Une erreur inattendue est survenue lors de l'authentification. Veuillez réessayer ou contacter le support si le problème persiste.",
    action: { label: "Retour à la connexion", href: "/auth/connexion" },
    icon: "alert",
  },
};

// ─── Icon components ──────────────────────────────────────────────────────────

function ErrorIcon({ type }: { type: ErrorInfo["icon"] }) {
  const icons: Record<ErrorInfo["icon"], React.ReactNode> = {
    lock: (
      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    link: (
      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    mail: (
      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    alert: (
      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    user: (
      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  };
  return <>{icons[type]}</>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface ErreurPageProps {
  searchParams: { error?: string };
}

export default function ErreurPage({ searchParams }: ErreurPageProps) {
  const errorKey = searchParams.error ?? "Default";
  const errorInfo = ERROR_MAP[errorKey] ?? ERROR_MAP.Default;

  return (
    <div className="animate-slide-up">
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
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-brand-lg p-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg">
            <ErrorIcon type={errorInfo.icon} />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h1 className="font-heading font-bold text-2xl text-heliotrope-600 mb-3">
            {errorInfo.title}
          </h1>
          <p className="text-gray-500 leading-relaxed text-sm">
            {errorInfo.description}
          </p>
        </div>

        {/* Error code badge (if not Default) */}
        {errorKey !== "Default" && (
          <div className="flex justify-center mb-6">
            <span className="badge bg-red-50 text-red-600 border border-red-200 px-3 py-1 text-xs font-mono">
              Code : {errorKey}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href={errorInfo.action.href}
            className="btn-primary py-3 text-sm text-center"
          >
            {errorInfo.action.label}
          </Link>
          <Link
            href="/"
            className="btn-ghost py-3 text-sm text-center"
          >
            Retour à l&apos;accueil
          </Link>
        </div>

        {/* Support hint */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Le problème persiste ?{" "}
          <a
            href="mailto:support@kaosociety.fr"
            className="text-heliotrope-500 hover:text-moss-500 no-underline transition-colors"
          >
            Contacter le support
          </a>
        </p>
      </div>
    </div>
  );
}
