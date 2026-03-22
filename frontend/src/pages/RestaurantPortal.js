import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { restaurantAPI } from "../services/api";

const tabs = [
  { id: "profile", label: "View / Update Profile" },
  { id: "activities", label: "Activities" },
  { id: "points", label: "Points & Boosts" },
  { id: "notifications", label: "Notifications" },
];

const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

const formatDate = (value) => {
  if (!value) return "Just now";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Just now" : date.toLocaleString();
};

const uploadFileToCloudinary = async (file, folder) => {
  if (!file) return { url: null };
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary is not configured for restaurant uploads.");
  }

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  body.append("folder", folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, {
    method: "POST",
    body,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Cloudinary upload failed");
  return { url: data.secure_url };
};

const getProgressWidth = (count, maxCount) => {
  if (!maxCount) return "8%";
  return `${Math.max(8, Math.round((Number(count) / maxCount) * 100))}%`;
};

export default function RestaurantPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [activities, setActivities] = useState({ individualRequests: [], groupRequests: [] });
  const [notifications, setNotifications] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [boosting, setBoosting] = useState(false);
  const [confirmingVisitId, setConfirmingVisitId] = useState(null);
  const [menuFile, setMenuFile] = useState(null);
  const [menuUploadSummary, setMenuUploadSummary] = useState("");
  const [profileForm, setProfileForm] = useState({
    name: "",
    description: "",
    phone: "",
    locationLink: "",
  });

  const loadAll = async () => {
    const [profileData, activitiesData, notificationsData, performanceData] = await Promise.all([
      restaurantAPI.getProfile(),
      restaurantAPI.getActivities(),
      restaurantAPI.getNotifications(),
      restaurantAPI.getPerformance(),
    ]);
    setProfile(profileData);
    setActivities(activitiesData);
    setNotifications(notificationsData);
    setPerformance(performanceData);
    setProfileForm({
      name: profileData.name || "",
      description: profileData.description || "",
      phone: profileData.phone || "",
      locationLink: profileData.locationLink || "",
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("restaurantToken");
    if (!token) {
      navigate("/restaurant-login");
      return;
    }
    loadAll().catch((err) => setError(err.message || "Failed to load restaurant dashboard"));
  }, [navigate]);

  const maxMonthlyCount = useMemo(() => {
    const values = Object.values(performance?.monthlyVisits || {}).map((value) => Number(value));
    return values.length ? Math.max(...values) : 0;
  }, [performance]);

  const totalActivityCount =
    (activities.individualRequests || []).length + (activities.groupRequests || []).length;
  const approvedStatus = profile?.approvalStatus || "PENDING";
  const isPending = approvedStatus !== "APPROVED";
  const canRequestBoost = (performance?.points ?? profile?.points ?? 0) >= 50 && !profile?.boostRequested;
  const points = performance?.points ?? profile?.points ?? 0;
  const averageRating = Number(performance?.averageRating || 0);
  const totalVisits = Number(performance?.totalVisits || 0);
  const currentPosition = performance?.currentPosition;
  const featuredInTopTen = Boolean(performance?.featuredInTopTen);
  const pendingIndividualCount = (activities.individualRequests || []).filter((item) => !item.confirmedByRestaurant).length;
  const pendingGroupCount = (activities.groupRequests || []).filter((item) => !item.confirmedByRestaurant).length;

  const logout = () => {
    localStorage.removeItem("restaurantToken");
    localStorage.removeItem("restaurantUser");
    navigate("/restaurant-login");
  };

  const handleFieldChange = (field, value) => {
    setProfileForm((current) => ({ ...current, [field]: value }));
  };

  const validateProfileForm = () => {
    if (!profileForm.name.trim()) return "Restaurant name is required";
    if (!profileForm.description.trim()) return "Description is required";
    if (!/^\d{10}$/.test(profileForm.phone)) return "Phone number must be exactly 10 digits";
    if (
      profileForm.locationLink.trim() &&
      !/^https?:\/\/(www\.)?(google\.[^/]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google\.[^/]+)/i.test(profileForm.locationLink.trim())
    ) {
      return "Please enter a valid Google Maps link";
    }
    return "";
  };

  const saveProfile = async () => {
    const validationMessage = validateProfileForm();
    if (validationMessage) {
      setSuccessMessage("");
      setError(validationMessage);
      return;
    }

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      let menuPdfPath = profile?.menuPdfPath || null;
      if (menuFile) {
        const menuUpload = await uploadFileToCloudinary(menuFile, "iamhungry/restaurants/menu");
        menuPdfPath = menuUpload.url;
      }

      const updated = await restaurantAPI.updateProfile({ ...profileForm, menuPdfPath });
      setProfile(updated);
      setProfileForm({
        name: updated.name || "",
        description: updated.description || "",
        phone: updated.phone || "",
        locationLink: updated.locationLink || "",
      });
      setMenuUploadSummary(menuFile ? `Menu updated: ${menuFile.name}` : "Profile updated successfully");
      setMenuFile(null);
      setSuccessMessage("Profile changes saved successfully.");
    } catch (err) {
      setSuccessMessage("");
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmVisit = async (visitId) => {
    setConfirmingVisitId(visitId);
    setError("");
    setSuccessMessage("");
    try {
      await restaurantAPI.confirmVisit(visitId);
      await loadAll();
      setSuccessMessage("Visit confirmed successfully.");
    } catch (err) {
      setError(err.message || "Failed to confirm visit");
    } finally {
      setConfirmingVisitId(null);
    }
  };

  const handleBoostRequest = async () => {
    setBoosting(true);
    setError("");
    setSuccessMessage("");
    try {
      const response = await restaurantAPI.requestBoost();
      await loadAll();
      setSuccessMessage(response.message || "Boost requested successfully.");
    } catch (err) {
      setError(err.message || "Failed to request boost");
    } finally {
      setBoosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {profile?.image1Path && (
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-900 shadow-xl">
            <img src={profile.image1Path} alt={`${profile?.name || "Restaurant"} cover`} className="h-72 w-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/75 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-white">
              <p className="text-xs uppercase tracking-[0.35em] text-orange-200">Restaurant Showcase</p>
              <h1 className="mt-3 text-4xl font-bold">{profile?.name || "Restaurant Portal"}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200">
                Everything here is scoped to your restaurant-owner dashboard, including the Cloudinary assets and current approval progress.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">Restaurant Dashboard</p>
            <h1 className="text-4xl font-bold text-slate-900">{profile?.name || "Restaurant Portal"}</h1>
            <p className="mt-2 text-slate-500">
              Demo approved account: <span className="font-semibold">demo.restaurant@iamhungry.com</span> / <span className="font-semibold">Demo@123</span>
            </p>
          </div>
          <button type="button" onClick={logout} className="rounded-2xl border border-slate-300 px-5 py-3 font-semibold text-slate-700">
            Logout
          </button>
        </div>

        {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
        {successMessage && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">{successMessage}</div>}

        {isPending && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800">
            <p className="font-semibold">Still pending approval</p>
            <p className="mt-1 text-sm">Your dashboard is available, but the restaurant is still waiting for admin approval before it becomes fully approved in the wider system.</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Status</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">{approvedStatus}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total Visits</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">{totalVisits}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Average Rating</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">{averageRating.toFixed(1)}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Open Tasks</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">{pendingIndividualCount + pendingGroupCount}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-2xl px-4 py-3 text-left font-semibold transition ${
                activeTab === tab.id ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg" : "border border-slate-200 bg-white text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "profile" && profile && (
          <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">View / Update Profile</h2>
              <p className="mt-2 text-sm text-slate-500">Editable: restaurant name, description, phone number, menu, and location link. Specialties and vibe tags remain locked.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Keep this section up to date before your demo. The information shown here is what teammates and reviewers will treat as the restaurant’s current profile state.
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-5"><p className="text-xs uppercase tracking-[0.2em] text-orange-400">Approval</p><p className="mt-3 text-2xl font-bold text-slate-900">{approvedStatus}</p></div>
              <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-5"><p className="text-xs uppercase tracking-[0.2em] text-amber-400">Points</p><p className="mt-3 text-2xl font-bold text-slate-900">{profile.points ?? 0}</p></div>
              <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-5"><p className="text-xs uppercase tracking-[0.2em] text-sky-400">Main & Dessert Picks</p><p className="mt-3 text-2xl font-bold text-slate-900">{(profile.specialties || []).length}</p></div>
              <div className="rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-white p-5"><p className="text-xs uppercase tracking-[0.2em] text-pink-400">Vibe Tags</p><p className="mt-3 text-2xl font-bold text-slate-900">{(profile.tags || []).length}</p></div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Restaurant Name</label>
                <input value={profileForm.name} onChange={(e) => handleFieldChange("name", e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Phone Number</label>
                <input value={profileForm.phone} maxLength={10} onChange={(e) => handleFieldChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-600">Description</label>
                <textarea rows={4} value={profileForm.description} onChange={(e) => handleFieldChange("description", e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-600">Location Link</label>
                <input value={profileForm.locationLink} onChange={(e) => handleFieldChange("locationLink", e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Menu Management</p>
                    <p className="mt-1 text-sm text-slate-500">Upload a replacement menu file without changing other restaurant data.</p>
                  </div>
                  {profile.menuPdfPath && <a href={profile.menuPdfPath} target="_blank" rel="noreferrer" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-orange-600">Open Current Menu</a>}
                </div>
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-4">
                  <label className="block cursor-pointer">
                    <span className="text-sm font-medium text-slate-700">Choose new menu file</span>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      className="mt-3 block w-full text-sm text-slate-600"
                      onChange={(e) => {
                        const nextFile = e.target.files?.[0] || null;
                        setMenuFile(nextFile);
                        setMenuUploadSummary(nextFile ? `Ready to upload: ${nextFile.name}` : "");
                      }}
                    />
                  </label>
                  {menuUploadSummary && <p className="mt-3 text-sm text-emerald-600">{menuUploadSummary}</p>}
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-700">Locked Identity Details</p>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="rounded-2xl bg-white p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</p><p className="mt-2 font-medium text-slate-800">{profile.email}</p></div>
                  <div className="rounded-2xl bg-white p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-400">Budget Range</p><p className="mt-2 font-medium text-slate-800">{profile.budgetRange || "Not set"}</p></div>
                  <div className="rounded-2xl bg-white p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-400">Address</p><p className="mt-2 font-medium text-slate-800">{profile.address || "Not set"}</p></div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Specialties</p>
                <div className="mt-3 flex flex-wrap gap-2">{(profile.specialties || []).length > 0 ? (profile.specialties || []).map((item) => <span key={item} className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">{item}</span>) : <p className="text-sm text-slate-500">None</p>}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Vibe Tags</p>
                <div className="mt-3 flex flex-wrap gap-2">{(profile.tags || []).length > 0 ? (profile.tags || []).map((item) => <span key={item} className="rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-700">{item}</span>) : <p className="text-sm text-slate-500">None</p>}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Location</p>
                {profile.locationLink ? <a href={profile.locationLink} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-orange-500 hover:underline">Open Google Maps Link</a> : <p className="mt-1 text-sm text-slate-500">No location link added</p>}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 p-4">{profile.image1Path ? <><p className="mb-3 text-sm text-slate-500">Cover Image</p><img src={profile.image1Path} alt="Restaurant cover" className="h-44 w-full rounded-2xl object-cover" /><a href={profile.image1Path} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-orange-500 hover:underline">Open Cloudinary Image</a><p className="mt-2 break-all text-xs text-slate-400">{profile.image1Path}</p></> : <p className="text-sm text-slate-500">No cover image uploaded</p>}</div>
              <div className="rounded-2xl border border-slate-200 p-4">{profile.image2Path ? <><p className="mb-3 text-sm text-slate-500">Second Image</p><img src={profile.image2Path} alt="Restaurant second" className="h-44 w-full rounded-2xl object-cover" /><a href={profile.image2Path} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-orange-500 hover:underline">Open Cloudinary Image</a><p className="mt-2 break-all text-xs text-slate-400">{profile.image2Path}</p></> : <p className="text-sm text-slate-500">No second image uploaded</p>}</div>
              <div className="rounded-2xl border border-slate-200 p-4">{profile.menuPdfPath ? <><p className="mb-3 text-sm text-slate-500">Menu File</p><a href={profile.menuPdfPath} target="_blank" rel="noreferrer" className="inline-block rounded-xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-600 hover:bg-orange-100">Open Menu File</a><p className="mt-3 break-all text-xs text-slate-400">{profile.menuPdfPath}</p></> : <p className="text-sm text-slate-500">No menu uploaded</p>}</div>
            </div>

            <button type="button" onClick={saveProfile} disabled={saving} className="rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 font-semibold text-white disabled:opacity-50">
              {saving ? "Saving..." : "Save Profile Changes"}
            </button>
          </div>
        )}

        {activeTab === "activities" && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-6 shadow-sm"><p className="text-xs uppercase tracking-[0.2em] text-orange-400">Total Requests</p><p className="mt-3 text-4xl font-bold text-slate-900">{totalActivityCount}</p><p className="mt-2 text-sm text-slate-500">All individual and group requests recorded for this restaurant.</p></div>
              <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm"><p className="text-xs uppercase tracking-[0.2em] text-amber-400">Individual Requests</p><p className="mt-3 text-4xl font-bold text-slate-900">{(activities.individualRequests || []).length}</p><p className="mt-2 text-sm text-slate-500">Shows the username and first and last name of the visiting user.</p></div>
              <div className="rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 to-white p-6 shadow-sm"><p className="text-xs uppercase tracking-[0.2em] text-pink-400">Group Requests</p><p className="mt-3 text-4xl font-bold text-slate-900">{(activities.groupRequests || []).length}</p><p className="mt-2 text-sm text-slate-500">Confirm whether a group that selected your restaurant actually visited.</p></div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Individual Requests</h2>
                    <p className="mt-1 text-sm text-slate-500">Notifications about individual visits are shown here.</p>
                  </div>
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">{pendingIndividualCount} pending</span>
                </div>
                <div className="mt-6 space-y-4">
                  {(activities.individualRequests || []).length === 0 && <p className="text-slate-500">No individual requests yet.</p>}
                  {(activities.individualRequests || []).map((item) => (
                    <div key={item.visitId} className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-orange-50/60 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div><p className="font-semibold text-slate-900">@{item.username}</p><p className="text-sm text-slate-500">{item.firstName} {item.lastName}</p></div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.confirmedByRestaurant ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{item.confirmedByRestaurant ? "Confirmed" : "Awaiting confirmation"}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-500">Visit recorded: {formatDate(item.visitDate)}</p>
                      {!item.confirmedByRestaurant && <button type="button" onClick={() => handleConfirmVisit(item.visitId)} disabled={confirmingVisitId === item.visitId} className="mt-4 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{confirmingVisitId === item.visitId ? "Confirming..." : "Confirm Visit"}</button>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Group Requests</h2>
                    <p className="mt-1 text-sm text-slate-500">Confirm visitation for restaurants selected in group mode.</p>
                  </div>
                  <span className="rounded-full bg-pink-100 px-3 py-1 text-sm font-semibold text-pink-700">{pendingGroupCount} pending</span>
                </div>
                <div className="mt-6 space-y-4">
                  {(activities.groupRequests || []).length === 0 && <p className="text-slate-500">No group requests yet.</p>}
                  {(activities.groupRequests || []).map((item) => (
                    <div key={item.visitId} className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-pink-50/60 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div><p className="font-semibold text-slate-900">@{item.username}</p><p className="text-sm text-slate-500">{item.firstName} {item.lastName}</p></div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.confirmedByRestaurant ? "bg-emerald-100 text-emerald-700" : "bg-pink-100 text-pink-700"}`}>{item.confirmedByRestaurant ? "Confirmed" : "Need group confirmation"}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-500">Visit recorded: {formatDate(item.visitDate)}</p>
                      {!item.confirmedByRestaurant && <button type="button" onClick={() => handleConfirmVisit(item.visitId)} disabled={confirmingVisitId === item.visitId} className="mt-4 rounded-xl bg-pink-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{confirmingVisitId === item.visitId ? "Confirming..." : "Confirm Group Visit"}</button>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "points" && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-orange-400">Current Points</p>
                <p className="mt-3 text-4xl font-bold text-slate-900">{points}</p>
                <p className="mt-2 text-sm text-slate-500">These points can be spent to request a visibility boost.</p>
              </div>
              <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-sky-400">Current Position</p>
                <p className="mt-3 text-4xl font-bold text-slate-900">{currentPosition ? `#${currentPosition}` : "Unranked"}</p>
                <p className="mt-2 text-sm text-slate-500">{approvedStatus === "APPROVED" ? "Your place among approved restaurants based on current points." : "Position becomes active after approval."}</p>
              </div>
              <div className="rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 to-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-pink-400">Featured In Top 10</p>
                <p className="mt-3 text-4xl font-bold text-slate-900">{featuredInTopTen ? "Yes" : "No"}</p>
                <p className="mt-2 text-sm text-slate-500">Shows whether your restaurant is currently featured in the top 10.</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900">Points & Boosts</h2>
                <p className="mt-4 text-5xl font-bold text-orange-500">{points}</p>
                <p className="mt-2 text-slate-500">Current points available</p>
                <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Boost Status</p>
                  <p className="mt-2 font-semibold text-slate-900">{profile?.boostRequested ? "Boost already requested" : "No active boost request"}</p>
                  <p className="mt-2 text-sm text-slate-500">Spending 50 points helps your restaurant compete for the weekly Hot 10 list.</p>
                </div>
                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Top 10 Visibility</p>
                  <p className="mt-2 font-semibold text-slate-900">{featuredInTopTen ? `Featured in the Top ${performance?.topTenCutoff || 10}` : `Not currently in the Top ${performance?.topTenCutoff || 10}`}</p>
                  <p className="mt-2 text-sm text-slate-500">{currentPosition ? `Current system position: #${currentPosition}` : "This restaurant is not yet ranked in the approved restaurant pool."}</p>
                </div>
                <button type="button" onClick={handleBoostRequest} disabled={!canRequestBoost || boosting} className="mt-6 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-3 font-semibold text-white disabled:opacity-50">
                  {boosting ? "Requesting..." : "Request Boost"}
                </button>
                {!canRequestBoost && <p className="mt-3 text-sm text-slate-500">{profile?.boostRequested ? "A boost request has already been made." : "You need at least 50 points to request a boost."}</p>}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900">Performance Snapshot</h2>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Total Visits</p><p className="text-2xl font-bold">{performance?.totalVisits ?? 0}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Average Rating</p><p className="text-2xl font-bold">{performance?.averageRating ?? 0}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Individual Visits</p><p className="text-2xl font-bold">{performance?.individualVisits ?? 0}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Group Visits</p><p className="text-2xl font-bold">{performance?.groupVisits ?? 0}</p></div>
                </div>
                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between text-sm text-slate-600"><span>Ratings received</span><span>{performance?.totalRatings ?? 0}</span></div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${Math.min(100, (Number(performance?.averageRating || 0) / 5) * 100)}%` }} /></div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">Monthly Performance</h2>
              <p className="mt-1 text-sm text-slate-500">A simple bar view of recorded visits so you can demo restaurant progress clearly.</p>
              <div className="mt-6 space-y-4">
                {Object.keys(performance?.monthlyVisits || {}).length === 0 && <p className="text-slate-500">No monthly performance data yet.</p>}
                {Object.entries(performance?.monthlyVisits || {}).map(([month, count]) => (
                  <div key={month}>
                    <div className="mb-2 flex justify-between text-sm text-slate-600"><span>{month}</span><span>{count} visits</span></div>
                    <div className="h-4 overflow-hidden rounded-full bg-slate-100"><div className="h-4 rounded-full bg-gradient-to-r from-orange-500 to-pink-500" style={{ width: getProgressWidth(count, maxMonthlyCount) }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>
            <div className="mt-6 space-y-4">
              {notifications.length === 0 && <p className="text-slate-500">No notifications yet.</p>}
              {notifications.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-medium text-slate-800">{item.message}</p>
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-slate-400"><span>{item.type}</span><span>{formatDate(item.createdAt)}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
