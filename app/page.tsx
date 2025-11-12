"use client";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useState, useEffect, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { departments, DepartmentKey } from "@/data/departments";
import { compressAndUploadMedia } from "@/utils/uploadImage";
import { FaCloudUploadAlt, FaImage, FaSpinner, FaTimes, FaTrash, FaVideo } from "react-icons/fa";

type Department = keyof typeof departments;

export default function Home() {
   const [form, setForm] = useState<{
    title: string;
    department: Department | "";
    subDepartment: string;
    status?: string;
    level: string;
    description: string;
    mediaUrl?: string;
    publicId?: string; // store Cloudinary public_id
  }>({
    title: "",
    department: "",
    subDepartment: "",
    status: "Pending",
    level: "",
    description: "",
    mediaUrl: "",
    publicId: "",
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [countdown, setCountdown] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const { t, i18n } = useTranslation();
  const language = i18n.language as "am" | "en" | "om";

  const level = [
    { key: "Low", label: t("level.Low") },
    { key: "Medium", label: t("level.Medium") },
    { key: "High", label: t("level.High") },
  ];

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const showMessage = (text: string, type = "info") => {
    setMessage({ text, type });
    if (type === "success") setCountdown(3);
  };

  // Upload image/video
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      // Compress and upload media
      const uploaded = await compressAndUploadMedia(file, "complain_app/uploads");

      setForm(prev => ({
        ...prev,
        mediaUrl: uploaded.secure_url,
        publicId: uploaded.public_id, // store public_id for deletion
      }));

      setPreview(uploaded.secure_url);
           showMessage(t("messages.file.success"), "success");
      console.log("✅ Uploaded successfully:", uploaded);
    } catch (error: any) {
      console.error("❌ Upload failed:", error.message);
      showMessage(t("messages.file.error"), "error");
    } finally {
      setUploading(false);
      e.target.value = ""; // reset input
    }
  };

  // Delete from Cloudinary
  const deleteFromCloudinary = async () => {
    if (!form.mediaUrl || !form.publicId) return;

    try {
      setDeleting(true);
      const isVideo = /\.(mp4|mov|avi)$/i.test(form.mediaUrl);

      const res = await fetch("/api/delete-cloudinary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_id: form.publicId,
          resource_type: isVideo ? "video" : "image",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete file");

      // Remove from state
      setForm(prev => ({ ...prev, mediaUrl: "", publicId: "" }));
      setPreview(null);
      showMessage(t("messages.file.remove.success"), "success");
      console.log("✅ File deleted:", form.publicId);
    } catch (error: any) {
      console.error("❌ Delete failed:", error.message);
      showMessage(t("messages.file.remove.error"), "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        showMessage(t("messages.success"), "success");
        setForm({
          title: "",
          department: "",
          subDepartment: "",
          status: "Pending",
          level: "",
          description: "",
          mediaUrl: "",
          publicId: "",
        });
        setPreview(null);
        setTimeout(() => window.location.reload(), 3500);
      } else {
        showMessage("Error: " + data.error, "error");
      }
    } catch (err) {
      showMessage(t("messages.error"), "error");
    } finally {
      setLoading(false);
    }
  };

  const getMessageStyles = () => {
    const base = "my-4 p-4 rounded-lg border text-center font-medium animate-fade-in";
    switch (message.type) {
      case "success": return `${base} bg-green-50 text-green-800 border-green-200`;
      case "error": return `${base} bg-red-50 text-red-800 border-red-200`;
      default: return `${base} bg-blue-50 text-blue-800 border-blue-200`;
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 text-slate-800 py-8">
      <section className="fixed top-2 right-2">
        <LanguageSwitcher />
      </section>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-lg mx-4 my-8 border border-gray-100 transform transition-all duration-300 hover:shadow-3xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2"> {t("title")}</h1>
          <p className="text-gray-600">{t("subtitle")}</p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={getMessageStyles()}>
            <div className="flex items-center justify-center space-x-2">
              {message.type === "success" && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {message.type === "error" && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span>{message.text}</span>
            </div>
            {message.type === "success" && countdown > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
              </div>
            )}
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t("form.title")}</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={t("messages.enterTitle")}
              required
            />
          </div>

          {/* Department Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t("form.department")}</label>
            <select
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white"
              value={form.department}
              onChange={(e) =>
                setForm({
                  ...form,
                  department: e.target.value as DepartmentKey,
                  subDepartment: "",
                })
              }
              required
            >
              <option value="" disabled>{t("messages.selectDepartment")}</option>
              {Object.entries(departments).map(([key, dept]) => (
                <option key={key} value={key}>
                  {dept[language] || dept.en}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-department Dropdown */}
          {form.department &&
            departments[form.department as DepartmentKey].subDepartments.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("form.subDepartment")}
                </label>
                <select
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white"
                  value={form.subDepartment}
                  onChange={(e) =>
                    setForm({ ...form, subDepartment: e.target.value })
                  }
                >
                  <option value="" disabled>{t("messages.selectSubDepartment")}</option>
                  {departments[form.department as DepartmentKey].subDepartments.map(
                    (sub, index) => (
                      <option key={index} value={sub.en}>
                        {sub[language] || sub.en}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t("form.priority")}</label>
            <select
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              required
            >
              <option value="" disabled>{t("messages.selectLevel")}</option>
              {level.map((lvl) => (
                <option key={lvl.key} value={lvl.key}>
                  {lvl.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t("form.description")}</label>
            <textarea
              className="w-full border border-gray-300 rounded-xl p-3 h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={t("messages.enterDescription")}
              required
            />
          </div>

           {/* File Upload Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t("form.file_optional")}
            </label>
            
            <div className="relative">
              <input
                type="file"
                onChange={handleFileUpload}
                accept="image/*,video/*"
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-all duration-200 cursor-pointer opacity-0 absolute inset-0 z-10"
                disabled={uploading || deleting || (preview ? true : false)}
              />
              
              {/* Custom styled file input */}
              <div className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 text-center">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <FaCloudUploadAlt className="text-3xl text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 font-medium">
                    {t("form.click_to_upload")}
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, MP4, MOV ({t("form.max_size")})
                  </p>
                </div>
              </div>
            </div>

            {uploading && (
              <div className="flex items-center justify-center mt-4 p-3 bg-blue-50 rounded-lg">
                <FaSpinner className="animate-spin text-blue-500 mr-2" />
                <p className="text-sm text-blue-700">{t("form.uploading")}</p>
              </div>
            )}

            {preview && (
              <div className="mt-4 relative bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {preview.includes("image") ? (
                      <FaImage className="text-green-500" />
                    ) : (
                      <FaVideo className="text-blue-500" />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {preview.includes("image") ? t("form.image") : t("form.video")} {t("form.uploaded")}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={deleteFromCloudinary}
                    disabled={deleting}
                    className="flex items-center space-x-2 px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:cursor-pointer"
                  >
                    {deleting ? (
                      <>
                        <FaSpinner className="animate-spin text-sm" />
                        <span className="text-sm">{t("form.removing")}</span>
                      </>
                    ) : (
                      <>
                        <FaTrash className="text-sm" />
                        <span className="text-sm">{t("form.remove")}</span>
                      </>
                    )}
                  </button>
                </div>
                
                {preview.includes("image") ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full rounded-lg shadow-sm max-h-64 object-cover"
                  />
                ) : (
                  <video
                    src={preview}
                    controls
                    className="w-full rounded-lg shadow-sm max-h-64 object-cover"
                  />
                )}
              </div>
            )}
          </div>
       

</div>


        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold mt-8 hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] hover:cursor-pointer"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{t("form.submitting")}</span>
            </div>
          ) : (
            t("form.submit")
          )}
        </button>

        {/* Footer Note */}
        <p className="text-center text-gray-500 text-sm mt-6">
          {t("form.note")}
        </p>
      </form>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </main>
  );
}