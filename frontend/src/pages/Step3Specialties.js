import { useState } from "react";

const mainFoods = [
  "Pizza", "Pasta", "Kottu", "Fried Rice", "Burger", "Sushi", "Noodles", "Curry",
  "BBQ", "Seafood", "Sandwich", "Salad", "Soup", "Steak", "Tacos", "Dosa",
  "Biryani", "Ramen", "Dim Sum", "Falafel"
];

const desserts = [
  "Brownies", "Ice Cream", "Cakes", "Pastries", "Pudding", "Cheesecake", "Donuts",
  "Mousse", "Tiramisu", "Gulab Jamun"
];

const vibes = [
  "Cozy Cafe", "Family Friendly", "Romantic", "Fine Dining", "Street Food", "Casual",
  "Trendy", "Quiet", "Lively", "Outdoor", "Rooftop", "Budget Friendly", "Luxury",
  "Fast Food", "Healthy"
];

export default function Step3Specialties({ formData, setFormData, next, back }) {
  const [warning, setWarning] = useState("");

  const toggle = (type, item, max, label) => {
    let list = formData[type] || [];

    if (list.includes(item)) {
      list = list.filter((i) => i !== item);
      setWarning("");
    } else {
      if (max && list.length >= max) {
        setWarning(`You can select a maximum of ${max} ${label}.`);
        return;
      }
      list = [...list, item];
      setWarning("");
    }

    setFormData({ ...formData, [type]: list });
  };

  const canContinue =
    (formData.specialties?.length || 0) >= 1 &&
    (formData.tags?.length || 0) === 3;

  const Tag = ({ item, type, max, label, activeClass }) => {
    const selected = formData[type]?.includes(item);
    const reachedLimit = !selected && max && (formData[type]?.length || 0) >= max;

    return (
      <button
        type="button"
        onClick={() => toggle(type, item, max, label)}
        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
          selected
            ? activeClass
            : reachedLimit
              ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
              : "border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50"
        }`}
      >
        {item}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-gradient-to-r from-orange-50 via-pink-50 to-rose-100 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-500">Step 3</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Specialties & Vibe Tags</h2>
        <p className="mt-2 text-sm text-slate-500">
          Choose the dishes and mood that define your restaurant best.
        </p>
      </div>

      {warning && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {warning}
        </div>
      )}

      <div className="rounded-3xl border border-orange-100 bg-orange-50/60 p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="font-semibold text-slate-800">Main Specialties</p>
          <span className="rounded-full bg-white px-3 py-1 text-sm text-slate-500">
            {(formData.specialties?.length || 0)}/10 selected
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {mainFoods.map((item) => (
            <Tag
              key={item}
              item={item}
              type="specialties"
              max={10}
              label="specialties"
              activeClass="border-orange-500 bg-orange-500 text-white"
            />
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-pink-100 bg-pink-50/60 p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="font-semibold text-slate-800">Desserts</p>
          <span className="rounded-full bg-white px-3 py-1 text-sm text-slate-500">
            {(formData.desserts?.length || 0)}/5 selected
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {desserts.map((item) => (
            <Tag
              key={item}
              item={item}
              type="desserts"
              max={5}
              label="desserts"
              activeClass="border-pink-500 bg-pink-500 text-white"
            />
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-violet-100 bg-violet-50/60 p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-800">Vibe Tags</p>
            <p className="text-sm text-slate-500">Maximum 3 vibe tags allowed.</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-sm text-slate-500">
            {(formData.tags?.length || 0)}/3 selected
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {vibes.map((item) => (
            <Tag
              key={item}
              item={item}
              type="tags"
              max={3}
              label="vibe tags"
              activeClass="border-violet-500 bg-violet-500 text-white"
            />
          ))}
        </div>
      </div>

      {!canContinue && (
        <p className="text-sm text-rose-500">
          Select at least 1 main specialty and exactly 3 vibe tags before continuing.
        </p>
      )}

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={back}
          className="rounded-2xl border border-slate-300 px-6 py-3 font-semibold text-slate-700"
        >
          Previous
        </button>

        <button
          type="button"
          onClick={next}
          disabled={!canContinue}
          className="rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue To Review
        </button>
      </div>
    </div>
  );
}
