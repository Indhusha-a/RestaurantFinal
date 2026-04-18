import { useMemo, useState } from "react";
import AdminLayout from "../../components/layout/admin/AdminLayout";

const BUDGET_OPTIONS = [
  { label: "LKR 0 - 1000", value: "ZERO_TO_1000" },
  { label: "LKR 1000 - 2000", value: "ONE_TO_2000" },
  { label: "LKR 2000 - 5000", value: "TWO_TO_5000" },
  { label: "LKR 5000+", value: "FIVE_THOUSAND_PLUS" },
];

export default function AddRestaurant() {
  const [form, setForm] = useState({
    restaurantName: "",
    email: "",
    password: "",
    address: "",
    restaurantPhone: "",
    budgetRange: "ONE_TO_2000",
    description: "",
    image: null,
    location: "",
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState("");

  const preview = useMemo(
    () => ({
      ...form,
      imagePreview: form.image
        ? URL.createObjectURL(form.image)
        : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    }),
    [form]
  );

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validate = () => {
    const next = {};

    if (!form.restaurantName.trim()) {
      next.restaurantName = "Restaurant name is required";
    }

    if (!form.address.trim()) {
      next.address = "Address is required";
    }

    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (!form.email.includes("@")) {
      next.email = "Email must contain @";
    }

    if (!form.password.trim()) {
      next.password = "Password is required";
    } else if (!/[A-Z]/.test(form.password)) {
      next.password = "Password must contain at least one capital letter";
    } else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(form.password)) {
      next.password = "Password must contain at least one special character";
    }

    if (!form.restaurantPhone.trim()) {
      next.restaurantPhone = "Phone number is required";
    } else if (!/^\d{10}$/.test(form.restaurantPhone)) {
      next.restaurantPhone = "Phone number must be exactly 10 digits";
    }

    if (!form.description.trim()) {
      next.description = "Description is required";
    }

    if (!form.location.trim()) {
      next.location = "Location is required";
    }

    if (!form.image) {
      next.image = "Restaurant image is required";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  };

  const clearForm = () => {
    setForm({
      restaurantName: "",
      email: "",
      password: "",
      address: "",
      restaurantPhone: "",
      budgetRange: "ONE_TO_2000",
      description: "",
      image: null,
      location: "",
    });
    setErrors({});
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", form.restaurantName);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("address", form.address);
      formData.append("phone", form.restaurantPhone);
      formData.append("budgetRange", form.budgetRange);
      formData.append("description", form.description);
      formData.append("locationLink", form.location);

      if (form.image) {
        formData.append("image", form.image);
      }

      const response = await fetch("http://localhost:8080/api/admin/restaurants", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || "Failed to add restaurant");
      }

      showToast("Restaurant added successfully.");
      clearForm();
    } catch (error) {
      console.error("Error adding restaurant:", error);
      showToast(`Error: ${error.message}`);
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
          Add Restaurant{" "}
          <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            Listing
          </span>
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Create a restaurant profile for the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900">Restaurant Details</h2>
          <p className="text-sm text-gray-500 mt-1">
            Fill in the information below.
          </p>

          <form onSubmit={onSubmit} className="mt-5 grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Restaurant Name *
              </label>
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                value={form.restaurantName}
                onChange={(event) => setField("restaurantName", event.target.value)}
                placeholder="e.g. Cafe Aroma"
              />
              {errors.restaurantName && (
                <p className="text-red-600 text-sm mt-2">
                  {errors.restaurantName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address *
              </label>
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                value={form.address}
                onChange={(event) => setField("address", event.target.value)}
                placeholder="e.g. Colombo 07"
              />
              {errors.address && (
                <p className="text-red-600 text-sm mt-2">{errors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Restaurant Email *
              </label>
              <input
                type="email"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                value={form.email}
                onChange={(event) => setField("email", event.target.value)}
                placeholder="e.g. cafeibson@iamhungry.com"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-2">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Restaurant Password *
              </label>
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                value={form.password}
                onChange={(event) => setField("password", event.target.value)}
                placeholder="e.g. Cafe@123"
              />
              {errors.password && (
                <p className="text-red-600 text-sm mt-2">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Restaurant Phone *
              </label>
              <input
                type="text"
                maxLength={10}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                value={form.restaurantPhone}
                onChange={(event) => {
                  const value = event.target.value.replace(/\D/g, "");
                  setField("restaurantPhone", value);
                }}
                placeholder="0771234567"
              />
              {errors.restaurantPhone && (
                <p className="text-red-600 text-sm mt-2">
                  {errors.restaurantPhone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Budget Range *
              </label>
              <select
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                value={form.budgetRange}
                onChange={(event) => setField("budgetRange", event.target.value)}
              >
                {BUDGET_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                rows={4}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                value={form.description}
                onChange={(event) => setField("description", event.target.value)}
                placeholder="Write a short description about the restaurant"
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-2">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Restaurant Photo *
              </label>
              <input
                type="file"
                accept="image/*"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                onChange={(event) => {
                  const file = event.target.files[0];
                  setField("image", file || null);
                }}
              />
              {errors.image && (
                <p className="text-red-600 text-sm mt-2">{errors.image}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location *
              </label>
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                value={form.location}
                onChange={(event) => setField("location", event.target.value)}
                placeholder="Google Maps link or location text"
              />
              {errors.location && (
                <p className="text-red-600 text-sm mt-2">{errors.location}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800"
              >
                Add Restaurant
              </button>

              <button
                type="button"
                className="px-5 py-3 rounded-xl border border-gray-200 text-sm hover:bg-gray-50"
                onClick={() => {
                  clearForm();
                  showToast("Form cleared.");
                }}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900">Live Preview</h2>
          <p className="text-sm text-gray-500">
            This is how users may see it.
          </p>

          <div className="mt-5 border border-gray-100 rounded-2xl overflow-hidden">
            <div className="p-5">
              <img
                src={preview.imagePreview}
                alt="Restaurant Preview"
                className="w-full h-48 object-cover rounded-2xl mb-4"
              />

              <h3 className="text-lg font-bold">
                {preview.restaurantName || "Restaurant Name"}
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                {preview.address || "Address"}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {BUDGET_OPTIONS.find((item) => item.value === preview.budgetRange)
                  ?.label || "Budget Range"}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {preview.restaurantPhone || "Restaurant Phone"}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {preview.location || "Location"}
              </p>

              <p className="text-sm text-gray-500 mt-3">
                {preview.description ||
                  "Add a short description to make it attractive for users."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg text-sm">
          {toast}
        </div>
      )}
    </AdminLayout>
  );
}
