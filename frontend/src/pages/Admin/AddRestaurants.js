import { useMemo, useState } from "react";
import AdminLayout from "../../components/layout/admin/AdminLayout"; 
// If this import gives an error, use:
// import AdminLayout from "../../components/layout/admin/AdminLayout";

/*
  Budget options mapped to backend enum values.
  Keep these values exactly as your backend expects.
*/
const BUDGET_OPTIONS = [
  { label: "LKR 0 - 1000", value: "ZERO_TO_1000" },
  { label: "LKR 1000 - 2000", value: "ONE_TO_2000" },
  { label: "LKR 2000 - 5000", value: "TWO_TO_5000" },
  { label: "LKR 5000+", value: "FIVE_THOUSAND_PLUS" },
];

export default function AddRestaurant() {
  /*
    Main form state.
    image stores the actual uploaded file object.
  */
  const [form, setForm] = useState({
    restaurantName: "",
    address: "",
    restaurantPhone: "",
    budgetRange: "ONE_TO_2000",
    description: "",
    image: null,
    location: "",
  });

  /* Validation errors for each field */
  const [errors, setErrors] = useState({});

  /* Small toast message shown after submit / clear / error */
  const [toast, setToast] = useState("");

  /*
    Live preview data.
    If user uploads an image, show it.
    Otherwise show a default placeholder image.
  */
  const preview = useMemo(() => {
    return {
      ...form,
      imagePreview: form.image
        ? URL.createObjectURL(form.image)
        : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    };
  }, [form]);

  /* Reusable helper to update a single field */
  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /*
    Validate all fields before sending to backend.
    Phone must contain only numbers and be exactly 10 digits.
  */
  const validate = () => {
    const next = {};

    if (!form.restaurantName.trim()) {
      next.restaurantName = "Restaurant name is required";
    }

    if (!form.address.trim()) {
      next.address = "Address is required";
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

  /* Show toast for a short time */
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  /* Reset form fields */
  const clearForm = () => {
    setForm({
      restaurantName: "",
      address: "",
      restaurantPhone: "",
      budgetRange: "ONE_TO_2000",
      description: "",
      image: null,
      location: "",
    });
    setErrors({});
  };

  /*
    Submit form to backend.
    Because image is a file, we must use FormData.
    Do NOT use JSON here.
  */
  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const formData = new FormData();

      /*
        These field names must match your backend parameter names.
        Example backend names:
        name, address, phone, budgetRange, description, locationLink, image
      */
      formData.append("name", form.restaurantName);
      formData.append("address", form.address);
      formData.append("phone", form.restaurantPhone);
      formData.append("budgetRange", form.budgetRange);
      formData.append("description", form.description);
      formData.append("locationLink", form.location);

      if (form.image) {
        formData.append("image", form.image);
      }

      const response = await fetch("http://localhost:8080/api/restaurants", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to add restaurant");
      }

      await response.json();

      showToast("✅ Restaurant added successfully!");
      clearForm();
    } catch (err) {
      console.error("Error adding restaurant:", err);
      showToast(`❌ Error: ${err.message}`);
    }
  };

  return (
    <AdminLayout>
      {/* Page Header */}
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

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        {/* Left side - form */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900">Restaurant Details</h2>
          <p className="text-sm text-gray-500 mt-1">
            Fill in the information below.
          </p>

          <form onSubmit={onSubmit} className="mt-5 grid gap-4">
            {/* Restaurant Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Restaurant Name *
              </label>
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                value={form.restaurantName}
                onChange={(e) => setField("restaurantName", e.target.value)}
                placeholder="e.g. Cafe Aroma"
              />
              {errors.restaurantName && (
                <p className="text-red-600 text-sm mt-2">
                  {errors.restaurantName}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address *
              </label>
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
                placeholder="e.g. Colombo 07"
              />
              {errors.address && (
                <p className="text-red-600 text-sm mt-2">{errors.address}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Restaurant Phone *
              </label>
              <input
                type="text"
                maxLength={10}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                value={form.restaurantPhone}
                onChange={(e) => {
                  /*
                    Keep only digits.
                    This removes letters, spaces, and symbols automatically.
                  */
                  const value = e.target.value.replace(/\D/g, "");
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

            {/* Budget Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Budget Range *
              </label>
              <select
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                value={form.budgetRange}
                onChange={(e) => setField("budgetRange", e.target.value)}
              >
                {BUDGET_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                rows={4}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Write a short description about the restaurant"
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-2">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Restaurant Photo *
              </label>
              <input
                type="file"
                accept="image/*"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setField("image", file || null);
                }}
              />
              {errors.image && (
                <p className="text-red-600 text-sm mt-2">{errors.image}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location *
              </label>
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                value={form.location}
                onChange={(e) => setField("location", e.target.value)}
                placeholder="Google Maps link or location text"
              />
              {errors.location && (
                <p className="text-red-600 text-sm mt-2">{errors.location}</p>
              )}
            </div>

            {/* Action Buttons */}
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
                  showToast("🧹 Cleared form");
                }}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Right side - live preview */}
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
                {BUDGET_OPTIONS.find(
                  (item) => item.value === preview.budgetRange
                )?.label || "Budget Range"}
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

      {/* Toast Message */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg text-sm">
          {toast}
        </div>
      )}
    </AdminLayout>
  );
}