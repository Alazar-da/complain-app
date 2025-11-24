"use client";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useState, useEffect, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { departments, DepartmentKey } from "@/data/departments";
import { compressAndUploadMedia } from "@/utils/uploadImage";
import { 
  FaCloudUploadAlt, 
  FaImage, 
  FaSpinner, 
  FaTrash, 
  FaVideo,
  FaUser,
  FaFileAlt,
  FaArrowLeft,
  FaArrowRight,
  FaPhone,
  FaGraduationCap,
  FaSchool,
  FaMapMarkerAlt,
  FaCheck,
  FaExclamationTriangle,
  FaDownload,
  FaCopy,
  FaHome,
  FaFilePdf
} from "react-icons/fa";

type Department = keyof typeof departments;

type EducationCommunity = "student" | "student_family" | "teacher" | "supervisor" | "expert";
type Gender = "male" | "female";

interface SubmissionData {
  id: string;
  trackingNumber: string;
  status: string;
  title: string;
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<{
    // Step 1: Personal Information
    fullName: string;
    phoneNumber: string;
    gender: Gender | "";
    educationCommunity: EducationCommunity | "";
    schoolName: string;
    wereda: string;
    
    // Step 2: Complaint Information
    title: string;
    department: Department | "";
    subDepartment: string;
    status?: string;
    level: string;
    description: string;
    mediaUrl?: string;
    publicId?: string;
  }>({
    // Step 1
    fullName: "",
    phoneNumber: "",
    gender: "",
    educationCommunity: "",
    schoolName: "",
    wereda: "",
    
    // Step 2
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
  const [submissionData, setSubmissionData] = useState<SubmissionData | null>(null);
  const { t, i18n } = useTranslation();
  const language = i18n.language as "am" | "en" | "om";

  const level = [
    { key: "Low", label: t("level.Low") },
    { key: "Medium", label: t("level.Medium") },
    { key: "High", label: t("level.High") },
  ];

  const educationOptions = [
    { key: "student", label: t("education.student") },
    { key: "student_family", label: t("education.student_family") },
    { key: "teacher", label: t("education.teacher") },
    { key: "supervisor", label: t("education.supervisor") },
    { key: "expert", label: t("education.expert") },
  ];

  const genderOptions = [
    { key: "male", label: t("gender.male") },
    { key: "female", label: t("gender.female") },
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

    const MAX_SIZE_MB = 10;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

    if (file.size > MAX_SIZE_BYTES) {
      showMessage(t("messages.file.too_large"), "error");
      e.target.value = "";
      return;
    }

    try {
      setUploading(true);
      const uploaded = await compressAndUploadMedia(file, "complain_app/uploads");

      setForm(prev => ({
        ...prev,
        mediaUrl: uploaded.secure_url,
        publicId: uploaded.public_id,
      }));

      setPreview(uploaded.secure_url);
      showMessage(t("messages.file.success"), "success");

    } catch (error: any) {
      console.error("❌ Upload failed:", error.message);
      showMessage(t("messages.file.error"), "error");
    } finally {
      setUploading(false);
      e.target.value = "";
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

      setForm(prev => ({ ...prev, mediaUrl: "", publicId: "" }));
      setPreview(null);
      showMessage(t("messages.file.remove.success"), "success");
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
        setSubmissionData(data.complaint);
        setCurrentStep(3); // Move to success screen
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

  const nextStep = () => {
    if (currentStep === 1) {
      if (!form.fullName || !form.phoneNumber || !form.gender || !form.educationCommunity) {
        showMessage(t("messages.fill_required"), "error");
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const resetForm = () => {
    setForm({
      fullName: "",
      phoneNumber: "",
      gender: "",
      educationCommunity: "",
      schoolName: "",
      wereda: "",
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
    setSubmissionData(null);
    setCurrentStep(1);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showMessage(t("messages.copied_to_clipboard"), "success");
  };

  const downloadTrackingNumber = () => {
    if (!submissionData) return;

    const content = `
COMPLAINT SUBMISSION RECEIPT
============================

Tracking Number: ${submissionData.trackingNumber}
Complaint ID: ${submissionData.id}
Title: ${submissionData.title}
Status: ${submissionData.status}
Submission Date: ${new Date().toLocaleDateString()}
Submission Time: ${new Date().toLocaleTimeString()}

IMPORTANT: Keep this tracking number safe. You will need it to check the status of your complaint.

Thank you for submitting your complaint. We will review it and get back to you soon.
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complaint-${submissionData.trackingNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isStep1Valid = form.fullName && form.phoneNumber && form.gender && form.educationCommunity;

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 text-slate-800 py-8">
     <section className="fixed top-2 left-2 z-50">
  <button 
  onClick={() => window.location.href = '/TrackComplaint'}
  className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 hover:cursor-pointer group"
>
  <FaFileAlt className="w-5 h-5 transition-transform group-hover:scale-110" />
  <span>{t("view_complaints")}</span>
</button>
   </section>
      <section className="fixed top-2 right-2 z-50">
        <LanguageSwitcher />
      </section>
      
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-2xl mx-4 my-8 border border-gray-100 transform transition-all duration-300 hover:shadow-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaFileAlt className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("title")}</h1>
          <p className="text-gray-600">{t("subtitle")}</p>
        </div>

        {/* Progress Steps */}
        {currentStep < 3 && (
          <>
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center">
                {/* Step 1 */}
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  currentStep >= 1 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-300'
                } transition-all duration-300`}>
                  {currentStep > 1 ? <FaCheck className="text-sm" /> : <FaUser className="text-sm" />}
                </div>
                <div className={`w-20 h-1 ${
                  currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'
                } transition-all duration-300`}></div>
                
                {/* Step 2 */}
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  currentStep >= 2 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-300'
                } transition-all duration-300`}>
                  <FaFileAlt className="text-sm" />
                </div>
              </div>
            </div>

            {/* Step Labels */}
            <div className="flex justify-between mb-8 px-8">
              <div className={`text-sm font-medium text-center ${
                currentStep === 1 ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {t("personal_info.personal_info")}
              </div>
              <div className={`text-sm font-medium text-center ${
                currentStep === 2 ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {t("personal_info.complaint_details")}
              </div>
            </div>
          </>
        )}

        {/* Message Display */}
        {message.text && (
          <div className={getMessageStyles()}>
            <div className="flex items-center justify-center space-x-2">
              {message.type === "success" && <FaCheck className="w-5 h-5" />}
              {message.type === "error" && <FaExclamationTriangle className="w-5 h-5" />}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-6 animate-fade-in">
            {/* ... (Step 1 form content remains the same) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="md:col-span-2">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <FaUser className="mr-2 text-blue-500" />
                  {t("form.full_name")} *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder={t("form.enter_full_name")}
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <FaPhone className="mr-2 text-green-500" />
                  {t("form.phone_number")} *
                </label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  placeholder={t("form.enter_phone_number")}
                  required
                />
              </div>

              {/* Gender */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <FaUser className="mr-2 text-purple-500" />
                  {t("form.gender")} *
                </label>
                <select
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}
                  required
                >
                  <option value="" disabled>{t("form.select_gender")}</option>
                  {genderOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Education Community */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <FaGraduationCap className="mr-2 text-orange-500" />
                  {t("form.education_community")} *
                </label>
                <select
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={form.educationCommunity}
                  onChange={(e) => setForm({ ...form, educationCommunity: e.target.value as EducationCommunity })}
                  required
                >
                  <option value="" disabled>{t("form.select_education_community")}</option>
                  {educationOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* School Name */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <FaSchool className="mr-2 text-red-500" />
                  {t("form.school_name")}
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={form.schoolName}
                  onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                  placeholder={t("form.enter_school")}
                />
              </div>

              {/* Wereda */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <FaMapMarkerAlt className="mr-2 text-teal-500" />
                  {t("form.wereda")}
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={form.wereda}
                  onChange={(e) => setForm({ ...form, wereda: e.target.value })}
                  placeholder={t("form.enter_wereda")}
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={!isStep1Valid}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:cursor-pointer"
              >
                <span>{t("form.next")}</span>
                <FaArrowRight className="text-sm" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Complaint Details */}
        {currentStep === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            {/* ... (Step 2 form content remains the same) */}
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("form.title")} *
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={t("messages.enterTitle")}
                required
              />
            </div>

            {/* Department & Sub-department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("form.department")} *
                </label>
                <select
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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

              {form.department &&
                departments[form.department as DepartmentKey].subDepartments.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t("form.subDepartment")}
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
            </div>

            {/* Priority Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("form.priority")} *
              </label>
              <select
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("form.description")} *
              </label>
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
                  disabled={uploading || deleting || !!preview}
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

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center space-x-2 bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-200 hover:cursor-pointer"
              >
                <FaArrowLeft className="text-sm" />
                <span>{t("form.back")}</span>
              </button>

              <button
                type="submit"
                disabled={loading || uploading}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:cursor-pointer"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>{t("form.submitting")}</span>
                  </>
                ) : (
                  <>
                    <FaCheck className="text-sm" />
                    <span>{t("form.submit")}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Success Screen */}
        {currentStep === 3 && submissionData && (
          <div className="text-center space-y-6 animate-fade-in">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheck className="w-10 h-10 text-green-600" />
            </div>

            {/* Success Message */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t("success.title")}
              </h2>
              <p className="text-gray-600 mb-6">
                {t("success.description")}
              </p>
            </div>

            {/* Submission Details Card */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {t("success.submission_details")}
              </h3>
              
              <div className="space-y-3 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">{t("success.tracking_number")}:</span>
                  <div className="flex items-center space-x-2">
                    <code className="bg-white px-3 py-1 rounded-lg border font-mono text-blue-600">
                      {submissionData.trackingNumber}
                    </code>
                    <button
                      onClick={() => copyToClipboard(submissionData.trackingNumber)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors hover:cursor-pointer"
                      title={t("success.copy_tracking")}
                    >
                      <FaCopy className="text-sm" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">{t("success.complaint_id")}:</span>
                  <span className="text-gray-800 font-mono">{submissionData.id}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">{t("success.title")}:</span>
                  <span className="text-gray-800">{submissionData.title}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">{t("success.status")}:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    submissionData.status === 'Pending' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : submissionData.status === 'Completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {t("status." + submissionData.status)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">{t("success.submission_date")}:</span>
                  <span className="text-gray-800">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-start space-x-3">
                <FaExclamationTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm text-blue-800 font-medium">
                    {t("success.important_notice")}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {t("success.save_tracking")}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <button
                onClick={downloadTrackingNumber}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 hover:cursor-pointer"
              >
                <FaDownload className="text-sm" />
                <span>{t("success.download_receipt")}</span>
              </button>

              <button
                onClick={resetForm}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all duration-200 hover:cursor-pointer"
              >
                <FaHome className="text-sm" />
                <span>{t("success.submit_another")}</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer Note */}
        {currentStep < 3 && (
          <p className="text-center text-gray-500 text-sm mt-6">
            {t("form.note")}
          </p>
        )}
      </div>

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