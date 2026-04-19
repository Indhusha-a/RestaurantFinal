import { AlertCircle, CheckCircle2, Lock, Mail, MapPin, Phone, Store } from "lucide-react";

const budgetOptions = [
  { value: "0-1000", label: "LKR 0 - 1000", tone: "from-amber-100 to-orange-100" },
  { value: "1000-2000", label: "LKR 1000 - 2000", tone: "from-rose-100 to-orange-100" },
  { value: "2000-5000", label: "LKR 2000 - 5000", tone: "from-pink-100 to-rose-100" },
  { value: "5000+", label: "LKR 5000+", tone: "from-fuchsia-100 to-pink-100" },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export default function Step1Basic({ formData, setFormData, next }) {
  const validation = {
    name: formData.name.trim().length >= 3,
    description: formData.description.trim().length >= 20,
    email: emailPattern.test(formData.email.trim()),
    password: passwordPattern.test(formData.password || ""),
    phone: /^\d{10}$/.test(formData.phone || ""),
    address: formData.address.trim().length >= 10,
    budgetRange: Boolean(formData.budgetRange),
  };

  const allValid = Object.values(validation).every(Boolean);

  const hintClass = "mt-2 flex items-center gap-2 text-xs";

  const FieldStatus = ({ valid, text }) => (
    <div className={`${hintClass} ${valid ? "text-emerald-600" : "text-rose-500"}`}>
      {valid ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 p-[1px]">
        <div className="rounded-[2rem] bg-white px-6 py-5">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
            Step 1
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Basic Information</h2>
          <p className="mt-2 text-sm text-slate-500">
            Fill in the essentials first. We will only let you continue once the details are solid.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-orange-100 bg-orange-50/70 p-5 md:col-span-2">
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Store size={16} className="text-orange-500" />
            Restaurant Name
          </label>
          <input
            value={formData.name}
            placeholder="Enter your restaurant name"
            className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 outline-none transition focus:border-orange-400"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <FieldStatus valid={validation.name} text="Use at least 3 characters." />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Restaurant Description
          </label>
          <textarea
            value={formData.description}
            placeholder="Tell customers what makes your place special"
            rows={4}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-rose-400"
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <FieldStatus
            valid={validation.description}
            text={`Add at least 20 characters. ${Math.max(0, 20 - formData.description.trim().length)} more to go.`}
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Mail size={16} className="text-rose-500" />
            Contact Email
          </label>
          <input
            value={formData.email}
            type="email"
            placeholder="restaurant@email.com"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-rose-400"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <FieldStatus valid={validation.email} text="Enter a valid email address." />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Phone size={16} className="text-orange-500" />
            Phone Number
          </label>
          <input
            value={formData.phone}
            inputMode="numeric"
            maxLength={10}
            placeholder="10 digit phone number"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-orange-400"
            onChange={(e) =>
              setFormData({
                ...formData,
                phone: e.target.value.replace(/\D/g, "").slice(0, 10),
              })
            }
          />
          <FieldStatus valid={validation.phone} text="Phone number must contain exactly 10 digits." />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Lock size={16} className="text-pink-500" />
            Password
          </label>
          <input
            value={formData.password}
            type="password"
            placeholder="Create a strong password"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-pink-400"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <FieldStatus
            valid={validation.password}
            text="Use 8+ characters with upper, lower, number, and symbol."
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <MapPin size={16} className="text-emerald-500" />
            Address
          </label>
          <input
            value={formData.address}
            placeholder="Street, city, or landmark"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-400"
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <FieldStatus valid={validation.address} text="Add at least 10 characters for the address." />
        </div>
      </div>

      <div className="rounded-3xl border border-rose-100 bg-rose-50/60 p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-500">Budget Range</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {budgetOptions.map((option) => {
            const selected = formData.budgetRange === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, budgetRange: option.value })}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  selected
                    ? "border-rose-500 bg-white shadow-md"
                    : "border-transparent bg-gradient-to-br text-slate-700 hover:border-rose-200"
                } ${option.tone}`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Budget
                </p>
                <p className="mt-1 text-base font-semibold">{option.label}</p>
              </button>
            );
          })}
        </div>
        <FieldStatus valid={validation.budgetRange} text="Choose the price range that best matches your restaurant." />
      </div>

      <button
        type="button"
        onClick={next}
        disabled={!allValid}
        className="w-full rounded-2xl bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 py-4 text-base font-semibold text-white shadow-lg shadow-orange-200 transition disabled:cursor-not-allowed disabled:opacity-50"
      >
        Continue To Uploads
      </button>
    </div>
  );
}
