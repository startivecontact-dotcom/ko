"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProfileFormProps {
  initialName: string;
  initialBio: string;
  initialPhone: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProfileForm({
  initialName,
  initialBio,
  initialPhone,
}: ProfileFormProps) {
  const { update } = useSession();

  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [phone, setPhone] = useState(initialPhone);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), bio: bio.trim(), phone: phone.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Une erreur est survenue.");
      }

      // Refresh the JWT so the updated name is reflected in the session
      await update({ name: name.trim() });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nom */}
      <div>
        <label htmlFor="name" className="label">
          Nom complet
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Votre nom"
          maxLength={100}
          className="input"
        />
      </div>

      {/* Téléphone */}
      <div>
        <label htmlFor="phone" className="label">
          Téléphone
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+33 6 00 00 00 00"
          maxLength={30}
          className="input"
        />
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="label">
          Biographie
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder="Parlez-nous de vous..."
          className="input resize-none"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{bio.length}/500</p>
      </div>

      {/* Feedback */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-moss-700 bg-moss-50 border border-moss-200 rounded-lg px-4 py-2">
          Profil mis à jour avec succès.
        </p>
      )}

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary"
        >
          {saving ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  );
}
