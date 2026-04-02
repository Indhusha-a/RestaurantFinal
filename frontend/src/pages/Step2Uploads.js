import { FileText, ImagePlus, Link2, MapPinned } from "lucide-react";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_TOTAL_SIZE = 50 * 1024 * 1024;

const formatFileSize = (bytes) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export default function Step2Uploads({ formData, setFormData, next, back }) {
  const totalUploadSize =
    (formData.menu?.size || 0) +
    (formData.image1?.size || 0) +
    (formData.image2?.size || 0);
  const imageTooLarge =
    (formData.image1 && formData.image1.size > MAX_FILE_SIZE) ||
    (formData.image2 && formData.image2.size > MAX_FILE_SIZE);
  const menuTooLarge = formData.menu && formData.menu.size > MAX_FILE_SIZE;
  const totalTooLarge = totalUploadSize > MAX_TOTAL_SIZE;
  const locationValid =
    !formData.locationLink ||
    /^https?:\/\/(www\.)?(google\.[^/]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(formData.locationLink);
  const canContinue =
    Boolean(formData.image1) &&
    locationValid &&
    !imageTooLarge &&
    !menuTooLarge &&
    !totalTooLarge;

  const updateFile = (key, file) => {
    setFormData({ ...formData, [key]: file || null });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-gradient-to-r from-amber-100 via-orange-50 to-rose-100 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">Step 2</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Uploads & Location</h2>
        <p className="mt-2 text-sm text-slate-500">
          Add your menu, showcase your venue, and attach a valid Google Maps link.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-orange-100 p-3 text-orange-500">
              <FileText size={20} />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Menu Upload</p>
              <p className="text-sm text-slate-500">PDF or image under 25MB</p>
            </div>
          </div>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => updateFile("menu", e.target.files?.[0])}
            className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-orange-500 file:px-4 file:py-2 file:font-semibold file:text-white"
          />
          {formData.menu && (
            <p className="mt-3 text-sm text-slate-600">
              {formData.menu.name} · {formatFileSize(formData.menu.size)}
            </p>
          )}
          {menuTooLarge && (
            <p className="mt-2 text-sm text-rose-500">Menu file must stay under 25MB.</p>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-rose-100 p-3 text-rose-500">
              <MapPinned size={20} />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Google Maps Link</p>
              <p className="text-sm text-slate-500">Paste your public map URL</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Link2 size={16} className="text-slate-400" />
            <input
              value={formData.locationLink || ""}
              placeholder="https://maps.google.com/..."
              className="w-full bg-transparent outline-none"
              onChange={(e) =>
                setFormData({ ...formData, locationLink: e.target.value })
              }
            />
          </div>
          {!locationValid && (
            <p className="mt-2 text-sm text-rose-500">
              Use a valid Google Maps link.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-dashed border-orange-200 bg-orange-50/70 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-white p-3 text-orange-500">
              <ImagePlus size={20} />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Cover Image</p>
              <p className="text-sm text-slate-500">Required for the restaurant card</p>
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => updateFile("image1", e.target.files?.[0])}
            className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-orange-500 file:px-4 file:py-2 file:font-semibold file:text-white"
          />
          {formData.image1 && (
            <p className="mt-3 text-sm text-slate-600">
              {formData.image1.name} · {formatFileSize(formData.image1.size)}
            </p>
          )}
          {!formData.image1 && (
            <p className="mt-2 text-sm text-rose-500">Please upload at least one main image.</p>
          )}
        </div>

        <div className="rounded-3xl border border-dashed border-pink-200 bg-pink-50/70 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-white p-3 text-pink-500">
              <ImagePlus size={20} />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Second Image</p>
              <p className="text-sm text-slate-500">Optional extra restaurant photo</p>
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => updateFile("image2", e.target.files?.[0])}
            className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-pink-500 file:px-4 file:py-2 file:font-semibold file:text-white"
          />
          {formData.image2 && (
            <p className="mt-3 text-sm text-slate-600">
              {formData.image2.name} · {formatFileSize(formData.image2.size)}
            </p>
          )}
        </div>
      </div>

      {imageTooLarge && (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
          Each uploaded image must stay under 25MB.
        </p>
      )}

      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Total upload size: {formatFileSize(totalUploadSize)} / {formatFileSize(MAX_TOTAL_SIZE)}
      </div>

      {totalTooLarge && (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
          Your combined uploads are too large. Keep the total under 50MB.
        </p>
      )}

      <div className="flex justify-between pt-2">
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
          Continue To Preferences
        </button>
      </div>
    </div>
  );
}
