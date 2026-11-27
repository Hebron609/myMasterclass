"use client";
import { useEffect, useState } from "react";
import { User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAuthStore } from "@/store/useAuthStore";
import { useApiResource } from "@/hooks/useApiResource";
import { fetchCurrentUser, sessionUser } from "@/lib/services/auth";
import { updateProfile } from "@/lib/services/users";
import { errorMessage } from "@/lib/api";
import { record, records } from "@/components/shared/ApiDataDisplay";
import {
  ApiState,
  Field,
  FormError,
  Notice,
  inputClass,
  buttonClass,
  secondaryClass,
  cardClass,
  safeWebUrl,
} from "@/components/shared/ApiUI";
export default function ProfilePageContent() {
  const { token } = useAuth();
  const resource = useApiResource("my-profile", fetchCurrentUser);
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const me = resource.data?.data;
  const profile = record(me?.profile);
  useEffect(() => {
    if (!resource.data) return;
    const profile = record(resource.data.data.profile);
    setBio(typeof profile.bio === "string" ? profile.bio : "");
    setAvatar(typeof profile.avatar_url === "string" ? profile.avatar_url : "");
  }, [resource.data]);
  const discard = () => {
    setBio(typeof profile.bio === "string" ? profile.bio : "");
    setAvatar(typeof profile.avatar_url === "string" ? profile.avatar_url : "");
    setError(null);
    setSaved(false);
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !me || busy) return;
    if (avatar && !safeWebUrl(avatar)) {
      setError("Use a complete http or https photo URL.");
      return;
    }
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await updateProfile(token, me.user.id, {
        bio: bio.trim(),
        avatar_url: avatar.trim(),
      });
      const updated = await fetchCurrentUser(token);
      useAuthStore.getState().login(sessionUser(updated.data), token);
      setSaved(true);
      resource.reload();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-6 pb-10">
      <ApiState {...resource} onRetry={resource.reload} />
      <FormError message={error} />
      {saved && (
        <p
          role="status"
          className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
        >
          Profile saved.
        </p>
      )}
      {me && (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <section
              className={`${cardClass} flex flex-col items-center text-center`}
            >
              {safeWebUrl(avatar) ? (
                <img
                  src={safeWebUrl(avatar)!}
                  alt="Your profile"
                  className="mb-5 h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="mb-5 h-24 w-24 rounded-full bg-gray-100 p-6 text-gray-400" />
              )}
              <h2 className="mb-2 text-xl font-medium">
                {me.user.name ||
                  `${me.user.first_name || ""} ${me.user.last_name || ""}`.trim()}
              </h2>
              <p className="text-sm text-gray-500">{me.user.email}</p>
              <p className="mt-3 text-sm capitalize text-gray-500">
                {String(me.role || profile.role || me.user.role || "")}
              </p>
            </section>
            <section className={`${cardClass} lg:col-span-2`}>
              <h2 className="mb-6 text-lg font-medium">Profile Information</h2>
              <form onSubmit={save} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Name">
                    <input
                      readOnly
                      className={inputClass}
                      value={
                        me.user.name ||
                        `${me.user.first_name || ""} ${me.user.last_name || ""}`.trim()
                      }
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      readOnly
                      className={inputClass}
                      value={me.user.email || ""}
                    />
                  </Field>
                </div>
                <Field label="Short bio">
                  <textarea
                    rows={5}
                    className={inputClass}
                    value={bio}
                    onChange={(e) => {
                      setBio(e.target.value);
                      setSaved(false);
                    }}
                  />
                </Field>
                <Field label="Photo URL (optional)">
                  <input
                    type="url"
                    className={inputClass}
                    value={avatar}
                    onChange={(e) => {
                      setAvatar(e.target.value);
                      setSaved(false);
                    }}
                  />
                </Field>
                <p className="text-sm text-gray-500">
                  Contact your administrator to update your name, email, or
                  journey year. Photo uploads and additional profile details
                  will be available in a future release.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    disabled={busy}
                    className={secondaryClass}
                    onClick={discard}
                  >
                    Discard
                  </button>
                  <button disabled={busy} className={buttonClass}>
                    {busy ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </form>
            </section>
          </div>
          <section className={cardClass}>
            <h2 className="mb-5 text-lg font-medium">Journey Information</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-[#F8F7F5] p-5">
                <p className="mb-2 text-xs text-gray-500">Current year</p>
                <p>
                  {profile.journey_year === undefined
                    ? "—"
                    : `Year ${String(profile.journey_year)}`}
                </p>
              </div>
              <div className="rounded-xl bg-[#F8F7F5] p-5">
                <p className="mb-2 text-xs text-gray-500">Cohorts</p>
                <p>
                  {records(me.cohorts)
                    .map((cohort) => String(cohort.name || ""))
                    .filter(Boolean)
                    .join(", ") || "No cohort assigned"}
                </p>
              </div>
              <div className="rounded-xl bg-[#F8F7F5] p-5">
                <p className="mb-2 text-xs text-gray-500">Mentor</p>
                <p>{me.mentor?.name || "—"}</p>
              </div>
            </div>
          </section>
          <Notice>
            Password changes will be available once account setup is completed.
            Contact your administrator for help.
          </Notice>
        </>
      )}
    </div>
  );
}
