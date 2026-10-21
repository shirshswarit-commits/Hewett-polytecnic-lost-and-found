import { useEffect, useState } from "react";
import { fetchProfile, updateProfile, uploadItemImages } from "../../../api";
import "./Profile.css";

const editableFields = [
  { name: "full_name", label: "Full name", required: true },
  { name: "phone", label: "Phone number" },
  { name: "roll_number", label: "Roll number" },
  { name: "branch", label: "Branch / department" },
];

const Profile = ({ auth, onProfileUpdated }) => {
  const [profile, setProfile] = useState(auth?.user || {});
  const [form, setForm] = useState({
    full_name: auth?.user?.full_name || "",
    phone: auth?.user?.phone || "",
    roll_number: auth?.user?.roll_number || "",
    branch: auth?.user?.branch || "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isActive = true;
    fetchProfile(auth.token)
      .then(({ user }) => {
        if (!isActive) return;
        setProfile(user);
        setForm({
          full_name: user.full_name || "",
          phone: user.phone || "",
          roll_number: user.roll_number || "",
          branch: user.branch || "",
        });
      })
      .catch((loadError) => {
        if (isActive) setError(`Could not load your profile: ${loadError.message}`);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [auth.token]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSaving(true);
    try {
      const { user } = await updateProfile(form, auth.token);
      setProfile(user);
      onProfileUpdated(user);
      setNotice("Your profile has been updated.");
    } catch (saveError) {
      setError(`Could not save your profile: ${saveError.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const uploadAvatar = async (event) => {
    const [file] = event.target.files || [];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Profile photos must be 5 MB or smaller.");
      return;
    }

    setError("");
    setNotice("");
    setIsUploading(true);
    try {
      const [avatarUrl] = await uploadItemImages([file], auth.token);
      const { user } = await updateProfile({ avatar_url: avatarUrl }, auth.token);
      setProfile(user);
      onProfileUpdated(user);
      setNotice("Your profile photo has been updated.");
    } catch (uploadError) {
      setError(`Could not update your profile photo: ${uploadError.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const initials = (profile.full_name || profile.email || "U")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <section className="profile-page" aria-labelledby="profile-title">
      <div className="profile-heading">
        <span className="eyebrow">YOUR ACCOUNT</span>
        <h1 id="profile-title">Profile settings</h1>
        <p>Manage the contact details shown with your campus reports.</p>
      </div>
      {error && <p className="profile-message is-error" role="alert">{error}</p>}
      {notice && <p className="profile-message is-success" role="status">{notice}</p>}
      {isLoading ? (
        <p className="profile-loading" role="status">Loading your profile…</p>
      ) : (
        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar" aria-label="Profile photo preview">
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt="Your profile" />
                : <span>{initials}</span>}
            </div>
            <div>
              <h2>Profile photo</h2>
              <p>JPG, PNG or WebP, up to 5 MB.</p>
              <label className="profile-upload-button">
                {isUploading ? "Uploading…" : "Choose photo"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={uploadAvatar}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>
          <form className="profile-form" onSubmit={saveProfile}>
            <label className="profile-field">
              <span>Email address</span>
              <input type="email" value={profile.email || auth.user?.email || ""} readOnly />
              <small>Email address cannot be changed here.</small>
            </label>
            {editableFields.map(({ name, label, required }) => (
              <label className="profile-field" key={name}>
                <span>{label}</span>
                <input
                  type="text"
                  name={name}
                  value={form[name]}
                  maxLength={name === "full_name" ? 100 : 120}
                  required={required}
                  onChange={(event) => setForm((current) => ({
                    ...current,
                    [name]: event.target.value,
                  }))}
                />
              </label>
            ))}
            <button className="profile-save-button" type="submit" disabled={isSaving}>
              {isSaving ? "Saving…" : "Save changes"}
            </button>
          </form>
        </div>
      )}
    </section>
  );
};

export default Profile;
