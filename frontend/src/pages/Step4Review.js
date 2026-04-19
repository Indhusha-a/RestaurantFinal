import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { restaurantAPI } from "../services/api";

const MAX_TOTAL_SIZE = 50 * 1024 * 1024;
const formatFileSize = (bytes) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
const uploadFileToCloudinary = async (file, folder) => {
  if (!file) {
    return { url: null, publicId: null };
  }

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary is not configured. Set REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET in the frontend environment."
    );
  }

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  body.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
    {
      method: "POST",
      body,
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "Cloudinary upload failed");
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
  };
};

export default function Step4Review({ formData, back }) {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [image1Preview, setImage1Preview] = useState("");
  const [image2Preview, setImage2Preview] = useState("");
  const totalUploadSize =
    (formData.menu?.size || 0) +
    (formData.image1?.size || 0) +
    (formData.image2?.size || 0);
  const totalTooLarge = totalUploadSize > MAX_TOTAL_SIZE;

  useEffect(() => {
    if (!formData.image1) {
      setImage1Preview("");
      return undefined;
    }

    const nextUrl = URL.createObjectURL(formData.image1);
    setImage1Preview(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [formData.image1]);

  useEffect(() => {
    if (!formData.image2) {
      setImage2Preview("");
      return undefined;
    }

    const nextUrl = URL.createObjectURL(formData.image2);
    setImage2Preview(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [formData.image2]);

  const handleSubmit = async () => {
    if (totalTooLarge) {
      alert(
        `Submission failed: combined uploads are ${formatFileSize(totalUploadSize)}. Keep the total under ${formatFileSize(MAX_TOTAL_SIZE)}.`
      );
      return;
    }

    setSubmitting(true);

    try {
      const [menuUpload, image1Upload, image2Upload] = await Promise.all([
        uploadFileToCloudinary(formData.menu, "iamhungry/restaurants/menu"),
        uploadFileToCloudinary(formData.image1, "iamhungry/restaurants/images"),
        uploadFileToCloudinary(formData.image2, "iamhungry/restaurants/images"),
      ]);

      const payload = {
        name: formData.name || "",
        description: formData.description || "",
        email: formData.email || "",
        password: formData.password || "",
        phone: formData.phone || "",
        address: formData.address || "",
        locationLink: formData.locationLink || "",
        budgetRange: formData.budgetRange || "",
        menuPdfPath: menuUpload.url,
        image1Path: image1Upload.url,
        image2Path: image2Upload.url,
        menuBase64: null,
        menuFileName: formData.menu?.name || null,
        image1Base64: null,
        image1FileName: formData.image1?.name || null,
        image2Base64: null,
        image2FileName: formData.image2?.name || null,
        specialties: formData.specialties || [],
        desserts: formData.desserts || [],
        tags: formData.tags || [],
      };

      const response = await restaurantAPI.addRestaurant(payload);
      alert(response.message || "Restaurant registration submitted for admin approval.");
      navigate("/restaurant-login");
    } catch (err) {
      console.error("FULL ERROR:", err);
      alert("Submission failed: " + (err.message || String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Review & Submit</h2>

      <div className="space-y-4">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-900">
          {image1Preview ? (
            <div className="relative">
              <img
                src={image1Preview}
                alt="Restaurant cover preview"
                className="h-64 w-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/60 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-xs uppercase tracking-[0.3em] text-orange-200">Submission Preview</p>
                <h3 className="mt-2 text-3xl font-bold">{formData.name || "Your restaurant"}</h3>
                <p className="mt-2 max-w-2xl text-sm text-slate-200">
                  This is the cover image that will be uploaded to Cloudinary and saved with your restaurant application.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 text-white">
              <p className="text-sm text-slate-300">No cover image selected yet.</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
          <p className="text-sm text-orange-500">Upload Size</p>
          <p className="font-medium text-slate-700">
            {formatFileSize(totalUploadSize)} / {formatFileSize(MAX_TOTAL_SIZE)}
          </p>
          {totalTooLarge && (
            <p className="mt-2 text-sm text-rose-500">
              Total upload size is too large. Please reduce your files before submitting.
            </p>
          )}
        </div>

        <div className="p-4 bg-gray-100 rounded-xl">
          <p className="text-sm text-gray-500">Email</p>
          <p>{formData.email}</p>
        </div>

        <div className="p-4 bg-gray-100 rounded-xl">
          <p className="text-sm text-gray-500">Phone</p>
          <p>{formData.phone}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 bg-gray-100 rounded-xl">
            <p className="text-sm text-gray-500">Restaurant Name</p>
            <p>{formData.name || "Not provided"}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-xl">
            <p className="text-sm text-gray-500">Location Link</p>
            {formData.locationLink ? (
              <a
                href={formData.locationLink}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-orange-600 hover:underline"
              >
                Open Google Maps Link
              </a>
            ) : (
              <p>Not provided</p>
            )}
          </div>
        </div>

        <div className="p-4 bg-gray-100 rounded-xl">
          <p className="text-sm text-gray-500">Main Specialties</p>
          <div className="flex flex-wrap gap-2">
            {formData.specialties?.map((i, idx) => (
              <span key={idx} className="bg-orange-200 px-3 py-1 rounded-full">
                {i}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 bg-gray-100 rounded-xl">
          <p className="text-sm text-gray-500">Desserts</p>
          <div className="flex flex-wrap gap-2">
            {formData.desserts?.map((i, idx) => (
              <span key={idx} className="bg-pink-200 px-3 py-1 rounded-full">
                {i}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 bg-gray-100 rounded-xl">
          <p className="text-sm text-gray-500">Vibe Tags</p>
          <div className="flex flex-wrap gap-2">
            {formData.tags?.map((i, idx) => (
              <span key={idx} className="bg-purple-200 px-3 py-1 rounded-full">
                {i}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 bg-gray-100 rounded-xl">
          <p className="text-sm text-gray-500 mb-3">Uploaded Assets</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-3 border border-slate-200">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Cover Image</p>
              {image1Preview ? (
                <>
                  <img
                    src={image1Preview}
                    alt="Restaurant cover preview"
                    className="h-40 w-full rounded-xl object-cover"
                  />
                  <p className="mt-2 text-sm text-slate-600">{formData.image1.name}</p>
                  <p className="text-xs text-slate-400">{formatFileSize(formData.image1.size)}</p>
                </>
              ) : (
                <p className="text-sm text-slate-500">No cover image selected</p>
              )}
            </div>

            <div className="rounded-2xl bg-white p-3 border border-slate-200">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Second Image</p>
              {image2Preview ? (
                <>
                  <img
                    src={image2Preview}
                    alt="Restaurant second preview"
                    className="h-40 w-full rounded-xl object-cover"
                  />
                  <p className="mt-2 text-sm text-slate-600">{formData.image2.name}</p>
                  <p className="text-xs text-slate-400">{formatFileSize(formData.image2.size)}</p>
                </>
              ) : (
                <p className="text-sm text-slate-500">No second image selected</p>
                )}
          </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white p-3 border border-slate-200">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Menu File</p>
            {formData.menu ? (
              <>
                <p className="text-sm text-slate-700">{formData.menu.name}</p>
                <p className="mt-1 text-xs text-slate-400">{formatFileSize(formData.menu.size)}</p>
              </>
            ) : (
              <p className="text-sm text-slate-500">No menu uploaded</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={back}
          disabled={submitting}
          className="px-6 py-3 border rounded-xl disabled:opacity-60"
        >
          Previous
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || totalTooLarge}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit for Approval"}
        </button>
      </div>
    </div>
  );
}
