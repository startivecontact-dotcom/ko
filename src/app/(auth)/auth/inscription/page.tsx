"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim()) {
    errors.name = "Le prénom / nom est requis.";
  } else if (values.name.trim().length < 2) {
    errors.name = "Le nom doit contenir au moins 2 caractères.";
  }

  if (!values.email.trim()) {
    errors.email = "L'adresse email est requise.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "L'adresse email n'est pas valide.";
  }

  if (!values.password) {
    errors.password = "Le mot de passe est requis.";
  } else if (values.password.length < 8) {
    errors.password = "Le mot de passe doit contenir au moins 8 caractères.";
  } else if (!/[A-Z]/.test(values.password)) {
    errors.password = "Le mot de passe doit contenir au moins une majuscule.";
  } else if (!/[0-9]/.test(values.password)) {
    errors.password = "Le mot de passe doit contenir au moins un chiffre.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Veuillez confirmer votre mot de passe.";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Les mots de passe ne correspondent pas.";
  }

  return errors;
}

// ─── Password strength indicator ─────────────────────────────────────────────

function passwordStrength(password: string): { label: string; width: string; color: string } {
  if (password.length === 0) return { label: "", width: "w-0", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: "Très faible", width: "w-1/5", color: "bg-red-500" };
  if (score === 2) return { label: "Faible", width: "w-2/5", color: "bg-orange-400" };
  if (score === 3) return { label: "Moyen", width: "w-3/5", color: "bg-yellow-400" };
  if (score === 4) return { label: "Fort", width: "w-4/5", color: "bg-moss-500" };
  return { label: "Très fort", width: "w-full", color: "bg-moss-600" };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InscriptionPage() {
  const router = useRouter();

  const [values, setValues] = useState<FormValues>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const strength = passwordStrength(values.password);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);

    const errors = validate(values);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setServerError(
          data?.message ??
            data?.error ??
            "Une erreur est survenue lors de l'inscription."
        );
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/connexion?registered=1");
      }, 2000);
    } catch {
      setServerError(
        "Impossible de contacter le serveur. Vérifiez votre connexion et réessayez."
      );
    } finally {
      setLoading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 no-underline group">
            <span className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white font-heading font-black text-xl backdrop-blur-sm">
              K
            </span>
            <span className="font-heading font-black text-2xl text-white tracking-tight">
              KAO Society
            </span>
          </Link>
        </div>
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-brand-lg p-8 text-center">
          <div className="w-16 h-16 bg-moss-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-moss-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-heading font-bold text-2xl text-heliotrope-600 mb-2">
            Compte créé !
          </h2>
          <p className="text-gray-500 text-sm">
            Votre compte a été créé avec succès. Redirection vers la page de
            connexion…
          </p>
        </div>
      </div>
    );
  }

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
          Créer un compte
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Rejoignez des milliers de passionnés outdoor.
        </p>

        {/* Server error */}
        {serverError && (
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
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className="label">
              Prénom et nom
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={handleChange}
              placeholder="Marie Dupont"
              required
              disabled={loading}
              className={`input ${fieldErrors.name ? "input-error" : ""}`}
            />
            {fieldErrors.name && (
              <p className="error-msg">{fieldErrors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="label">
              Adresse email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={handleChange}
              placeholder="vous@exemple.fr"
              required
              disabled={loading}
              className={`input ${fieldErrors.email ? "input-error" : ""}`}
            />
            {fieldErrors.email && (
              <p className="error-msg">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="label">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={values.password}
              onChange={handleChange}
              placeholder="Minimum 8 caractères"
              required
              disabled={loading}
              className={`input ${fieldErrors.password ? "input-error" : ""}`}
            />
            {/* Strength bar */}
            {values.password.length > 0 && (
              <div className="mt-2">
                <div className="h-1.5 bg-lavender-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strength.width} ${strength.color}`}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Force : <span className="font-medium text-gray-600">{strength.label}</span>
                </p>
              </div>
            )}
            {fieldErrors.password && (
              <p className="error-msg">{fieldErrors.password}</p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label htmlFor="confirmPassword" className="label">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={values.confirmPassword}
              onChange={handleChange}
              placeholder="Répétez votre mot de passe"
              required
              disabled={loading}
              className={`input ${fieldErrors.confirmPassword ? "input-error" : ""}`}
            />
            {fieldErrors.confirmPassword && (
              <p className="error-msg">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* Terms notice */}
          <p className="text-xs text-gray-400 leading-relaxed">
            En créant un compte, vous acceptez nos{" "}
            <Link href="/cgu" className="text-heliotrope-500 hover:text-moss-500 no-underline transition-colors">
              Conditions d&apos;utilisation
            </Link>{" "}
            et notre{" "}
            <Link href="/confidentialite" className="text-heliotrope-500 hover:text-moss-500 no-underline transition-colors">
              Politique de confidentialité
            </Link>
            .
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Création du compte…
              </>
            ) : (
              "Créer mon compte"
            )}
          </button>
        </form>

        {/* Link to connexion */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Déjà membre ?{" "}
          <Link
            href="/auth/connexion"
            className="font-semibold text-heliotrope-600 hover:text-moss-500 no-underline transition-colors"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
