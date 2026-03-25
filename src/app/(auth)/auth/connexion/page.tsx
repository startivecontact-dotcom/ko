"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Metadata } from "next";

// ─── Error label map ──────────────────────────────────────────────────────────

const AUTH_ERRORS: Record<string, string> = {
  OAuthSignin: "Erreur lors de la connexion avec le fournisseur OAuth.",
  OAuthCallback: "Erreur lors du retour du fournisseur OAuth.",
  OAuthCreateAccount: "Impossible de créer le compte via OAuth.",
  EmailCreateAccount: "Impossible de créer le compte avec cet email.",
  Callback: "Erreur lors du traitement de la connexion.",
  OAuthAccountNotLinked:
    "Cet email est déjà associé à un autre mode de connexion.",
  EmailSignin: "L'email de connexion n'a pas pu être envoyé.",
  CredentialsSignin: "Email ou mot de passe incorrect.",
  SessionRequired: "Vous devez être connecté pour accéder à cette page.",
  Default: "Une erreur est survenue. Veuillez réessayer.",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ConnexionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    urlError ? (AUTH_ERRORS[urlError] ?? AUTH_ERRORS.Default) : null
  );

  // ── Submit handler ─────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (result?.error) {
        setError(AUTH_ERRORS[result.error] ?? AUTH_ERRORS.CredentialsSignin);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Une erreur inattendue est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  // ── Google sign-in ─────────────────────────────────────────────────────────

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError(null);
    try {
      await signIn("google", { callbackUrl });
    } catch {
      setError("Impossible de se connecter avec Google.");
      setGoogleLoading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="animate-slide-up">
      {/* Logo / brand */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3 no-underline group">
          <span className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white font-heading font-black text-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
            K
          </span>
          <span className="font-heading font-black text-2xl text-white tracking-tight">
            KAO Society
          </span>
        </Link>
        <p className="mt-3 text-heliotrope-200 text-sm">
          La communauté outdoor
        </p>
      </div>

      {/* Card */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-brand-lg p-8">
        <h1 className="font-heading font-bold text-2xl text-heliotrope-600 mb-1">
          Connexion
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Bon retour parmi nous !
        </p>

        {/* Error banner */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm animate-fade-in"
          >
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="label">
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.fr"
              required
              disabled={loading}
              className="input"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="label mb-0">
                Mot de passe
              </label>
              <Link
                href="/auth/mot-de-passe-oublie"
                className="text-xs text-heliotrope-500 hover:text-moss-500 no-underline transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              className="input"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="btn-primary w-full py-3 text-base"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Connexion en cours…
              </>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-lavender-300" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-gray-400 font-medium">ou</span>
          </div>
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading || googleLoading}
          className="btn w-full border border-lavender-300 bg-white text-gray-700 hover:bg-lavender-50 hover:border-lavender-400 py-3 text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Redirection…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continuer avec Google
            </>
          )}
        </button>

        {/* Link to inscription */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Pas encore membre ?{" "}
          <Link
            href="/auth/inscription"
            className="font-semibold text-heliotrope-600 hover:text-moss-500 no-underline transition-colors"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
