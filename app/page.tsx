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
  FaFilePdf,
  FaStar,
  FaRocket,
  FaPaperPlane,
  FaCalendarAlt,
  FaIdCard
} from "react-icons/fa";
import { FiAward, FiShield, FiTrendingUp } from "react-icons/fi";

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
  const [isHovered, setIsHovered] = useState<string | null>(null);
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
    const base = "my-4 p-4 rounded-xl border-2 text-center font-medium animate-fade-in transform transition-all duration-300";
    switch (message.type) {
      case "success": return `${base} bg-linear-to-r from-green-50 to-emerald-50 text-green-800 border-green-300 shadow-lg shadow-green-100/50`;
      case "error": return `${base} bg-linear-to-r from-red-50 to-rose-50 text-red-800 border-red-300 shadow-lg shadow-red-100/50`;
      default: return `${base} bg-linear-to-r from-blue-50 to-cyan-50 text-blue-800 border-blue-300 shadow-lg shadow-blue-100/50`;
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
${t('receipt.title')}
============================

${t('receipt.tracking_number')} ${submissionData.trackingNumber}
${t('receipt.complaint_id')} ${submissionData.id}
${t('receipt.complaint_title')} ${submissionData.title}
${t('receipt.status')} ${t("status." + submissionData.status)}
${t('receipt.submission_date')} ${new Date().toLocaleDateString()}
${t('receipt.submission_time')} ${new Date().toLocaleTimeString()}
${t('receipt.important_note')}
${t('receipt.thank_you')}
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
    <main className="relative min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-100 text-slate-800 py-8 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Floating Action Buttons */}
      <section className="fixed top-6 left-6 z-50">
        <button 
          onClick={() => window.location.href = '/TrackComplaint'}
          onMouseEnter={() => setIsHovered('track')}
          onMouseLeave={() => setIsHovered(null)}
          className="group relative flex items-center space-x-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 active:scale-95 hover:cursor-pointer overflow-hidden"
        >
          <div className="absolute inset-0 bg-linear-to-r from-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <FaFileAlt className="w-5 h-5 relative z-10 transition-transform group-hover:scale-110 group-hover:rotate-12" />
          <span className="relative z-10">{t("view_complaints")}</span>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
      
        </button>
      </section>

      <section className="fixed top-6 right-6 z-50">
        <LanguageSwitcher />
      </section>
      
      {/* Main Form Container */}
      <div className="relative bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl sm:p-8 p-6 w-full max-w-2xl mx-4 my-12 border border-white/20 transform transition-all duration-500 hover:shadow-3xl">
        {/* Header with Enhanced Design */}
        {!submissionData &&
        <div className="text-center mb-8 relative">
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <FaFileAlt className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <FaStar className="w-3 h-3 text-yellow-800" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            {t("title")}
          </h1>
          <p className="text-gray-600 text-lg">{t("subtitle")}</p>
        </div>
        }

        {/* Enhanced Progress Steps */}
        {currentStep < 3 && (
          <>
            <div className="flex items-center justify-center mb-8 relative">
              <div className="flex items-center">
                {/* Step 1 */}
                <div className={`relative flex items-center justify-center w-14 h-14 rounded-2xl border-2 transition-all duration-500 transform ${
                  currentStep >= 1 
                    ? 'bg-linear-to-br from-blue-500 to-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/25 scale-110' 
                    : 'border-gray-300 text-gray-300 bg-white'
                }`}>
                  {currentStep > 1 ? <FaCheck className="text-sm" /> : <FaUser className="text-sm" />}
                  {/* <div className="absolute -bottom-6 text-xs font-medium text-gray-600">
                    {t("personal_info.personal_info")}
                  </div> */}
                </div>
                
                {/* Connection Line */}
                <div className={`w-24 h-2 rounded-full transition-all duration-500 ${
                  currentStep >= 2 
                    ? 'bg-linear-to-r from-blue-500 to-blue-600' 
                    : 'bg-gray-200'
                }`}></div>
                
                {/* Step 2 */}
                <div className={`relative flex items-center justify-center w-14 h-14 rounded-2xl border-2 transition-all duration-500 transform ${
                  currentStep >= 2 
                    ? 'bg-linear-to-br from-green-500 to-green-600 border-green-600 text-white shadow-lg shadow-green-500/25 scale-110' 
                    : 'border-gray-300 text-gray-300 bg-white'
                }`}>
                  <FaFileAlt className="text-sm" />
                  {/* <div className="absolute -bottom-6 text-xs font-medium text-gray-600">
                    {t("personal_info.complaint_details")}
                  </div> */}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Enhanced Message Display */}
        {message.text && (
          <div className={getMessageStyles()}>
            <div className="flex items-center justify-center space-x-3">
              {message.type === "success" && <FaCheck className="w-5 h-5 text-green-600" />}
              {message.type === "error" && <FaExclamationTriangle className="w-5 h-5 text-red-600" />}
              <span className="font-semibold">{message.text}</span>
            </div>
          </div>
        )}

        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="md:col-span-2">
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <FaUser className="text-blue-600" />
                  </div>
                  {t("form.full_name")} *
                </label>
                <input
                  type="text"
                  className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm shadow-inner"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder={t("form.enter_full_name")}
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <FaPhone className="text-green-600" />
                  </div>
                  {t("form.phone_number")} *
                </label>
                <input
                  type="tel"
                  className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 bg-white/50 backdrop-blur-sm shadow-inner"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  placeholder={t("form.enter_phone_number")}
                  required
                />
              </div>

              {/* Gender */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <FaUser className="text-purple-600" />
                  </div>
                  {t("form.gender")} *
                </label>
                <select
                  className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white/50 backdrop-blur-sm shadow-inner cursor-pointer"
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
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <FaGraduationCap className="text-orange-600" />
                  </div>
                  {t("form.education_community")} *
                </label>
                <select
                  className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all duration-300 bg-white/50 backdrop-blur-sm shadow-inner cursor-pointer"
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
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <FaSchool className="text-red-600" />
                  </div>
                  {t("form.school_name")}
                </label>
                <input
                  type="text"
                  className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-4 focus:ring-red-200 focus:border-red-500 transition-all duration-300 bg-white/50 backdrop-blur-sm shadow-inner"
                  value={form.schoolName}
                  onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                  placeholder={t("form.enter_school")}
                />
              </div>

              {/* Wereda */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                    <FaMapMarkerAlt className="text-teal-600" />
                  </div>
                  {t("form.wereda")}
                </label>
                <input
                  type="text"
                  className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-4 focus:ring-teal-200 focus:border-teal-500 transition-all duration-300 bg-white/50 backdrop-blur-sm shadow-inner"
                  value={form.wereda}
                  onChange={(e) => setForm({ ...form, wereda: e.target.value })}
                  placeholder={t("form.enter_wereda")}
                />
              </div>
            </div>

            {/* Enhanced Navigation Button */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={!isStep1Valid}
                className="group relative flex items-center space-x-3 bg-linear-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 hover:scale-105 hover:shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative z-10">{t("form.next")}</span>
                <FaArrowRight className="text-sm relative z-10 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Complaint Details */}
        {currentStep === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            {/* Title */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <FaFileAlt className="text-indigo-600" />
                </div>
                {t("form.title")} *
              </label>
              <input
                type="text"
                className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-300 bg-white/50 backdrop-blur-sm shadow-inner"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={t("messages.enterTitle")}
                required
              />
            </div>

            {/* Department & Sub-department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {t("form.department")} *
                </label>
                <select
                  className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm shadow-inner cursor-pointer"
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
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      {t("form.subDepartment")}
                    </label>
                    <select
                      className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all duration-300 bg-white/50 backdrop-blur-sm shadow-inner cursor-pointer"
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
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                  <FiTrendingUp className="text-yellow-600" />
                </div>
                {t("form.priority")} *
              </label>
              <select
                className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-4 focus:ring-yellow-200 focus:border-yellow-500 transition-all duration-300 bg-white/50 backdrop-blur-sm shadow-inner cursor-pointer"
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
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <FaFileAlt className="text-purple-600" />
                </div>
                {t("form.description")} *
              </label>
              <textarea
                className="w-full border-2 border-gray-200 rounded-xl p-4 h-32 focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white/50 backdrop-blur-sm shadow-inner resize-none"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={t("messages.enterDescription")}
                required
              />
            </div>

            {/* Enhanced File Upload Section */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center mr-3">
                  <FaCloudUploadAlt className="text-cyan-600" />
                </div>
                {t("form.file_optional")}
              </label>
              
              <div className="relative group">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept="image/*,video/*"
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-2xl focus:ring-4 focus:ring-cyan-200 focus:border-cyan-500 hover:border-cyan-400 transition-all duration-300 cursor-pointer opacity-0 absolute inset-0 z-10"
                  disabled={uploading || deleting || !!preview}
                />
                
                {/* Custom styled file input */}
                <div className="w-full p-8 border-2 border-dashed border-gray-300 rounded-2xl bg-linear-to-br from-gray-50 to-white hover:from-cyan-50 hover:to-blue-50 hover:border-cyan-400 transition-all duration-300 text-center group-hover:scale-105 group-hover:shadow-lg">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <FaCloudUploadAlt className="text-4xl text-gray-400 mb-2 group-hover:text-cyan-500 transition-colors duration-300" />
                    <p className="text-sm text-gray-600 font-medium group-hover:text-cyan-700">
                      {t("form.click_to_upload")}
                    </p>
                    <p className="text-xs text-gray-500 group-hover:text-cyan-600">
                      PNG, JPG, MP4, MOV ({t("form.max_size")})
                    </p>
                  </div>
                </div>
              </div>

              {uploading && (
                <div className="flex items-center justify-center mt-4 p-4 bg-linear-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <FaSpinner className="animate-spin text-blue-500 mr-3" />
                  <p className="text-sm text-blue-700 font-medium">{t("form.uploading")}</p>
                </div>
              )}

              {preview && (
                <div className="mt-6 relative bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {preview.includes("image") ? (
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <FaImage className="text-green-600" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FaVideo className="text-blue-600" />
                        </div>
                      )}
                      <span className="text-sm font-semibold text-gray-700">
                        {preview.includes("image") ? t("form.image") : t("form.video")} {t("form.uploaded")}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={deleteFromCloudinary}
                      disabled={deleting}
                      className="flex items-center space-x-2 px-4 py-2 bg-linear-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-lg"
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
                      className="w-full rounded-xl shadow-sm max-h-64 object-cover border-2 border-gray-100"
                    />
                  ) : (
                    <video
                      src={preview}
                      controls
                      className="w-full rounded-xl shadow-sm max-h-64 object-cover border-2 border-gray-100"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Enhanced Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-between pt-8">
              <button
                type="button"
                onClick={prevStep}
                className="group flex items-center space-x-3 bg-linear-to-r from-gray-500 to-gray-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-500 hover:scale-105 hover:shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <FaArrowLeft className="text-sm relative z-10 transition-transform group-hover:-translate-x-1" />
                <span className="relative z-10">{t("form.back")}</span>
              </button>

              <button
                type="submit"
                disabled={loading || uploading}
                className="group relative flex items-center space-x-3 bg-linear-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-700 focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 hover:scale-105 hover:shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin relative z-10" />
                    <span className="relative z-10">{t("form.submitting")}</span>
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="text-sm relative z-10 transition-transform group-hover:scale-110" />
                    <span className="relative z-10">{t("form.submit")}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Enhanced Success Screen */}
        {currentStep === 3 && submissionData && (
          <div className="text-center space-y-8 animate-fade-in">
            {/* Success Animation */}
            <div className="relative">
              <div className="w-24 h-24 bg-linear-to-br from-green-400 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl animate-bounce-slow">
                <FaCheck className="w-10 h-10 text-white" />
              </div>
              <div className="absolute inset-0 bg-green-400 rounded-3xl blur-xl opacity-30 animate-ping"></div>
            </div>

            {/* Success Message */}
            <div>
              <h2 className="text-3xl font-bold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                {t("success.title")}
              </h2>
              <p className="text-gray-600 text-lg">
                {t("success.description")}
              </p>
            </div>

            {/* Enhanced Submission Details Card */}
            <div className="bg-linear-to-br from-gray-50 to-white rounded-3xl sm:p-8 p-6 border-2 border-gray-100 shadow-2xl">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-center space-x-2">
                <FaIdCard className="text-blue-600" />
                <span>{t("success.submission_details")}</span>
              </h3>
              
              <div className="space-y-4 text-left">
                <div className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300">
                  <span className="text-gray-600 font-semibold">{t("success.tracking_number")}:</span>
                  <div className="flex items-center space-x-3">
                    <code className="bg-linear-to-r from-blue-50 to-cyan-50 px-4 py-2 rounded-xl border-2 border-blue-100 font-mono text-blue-600 font-bold">
                      {submissionData.trackingNumber}
                    </code>
                    <button
                      onClick={() => copyToClipboard(submissionData.trackingNumber)}
                      className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 hover:scale-110 transition-all duration-300 hover:cursor-pointer"
                      title={t("success.copy_tracking")}
                    >
                      <FaCopy className="text-sm" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-green-200 transition-all duration-300">
                    <span className="text-gray-600 font-semibold">{t("success.complaint_id")}:</span>
                    <p className="text-gray-800 font-mono mt-1">{submissionData.id}</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-purple-200 transition-all duration-300">
                    <span className="text-gray-600 font-semibold">{t("success.complaint_title")}:</span>
                    <p className="text-gray-800 mt-1 truncate">{submissionData.title}</p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-yellow-200 transition-all duration-300">
                    <span className="text-gray-600 font-semibold pr-2">{t("success.status")}:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold mt-1 inline-block ${
                      submissionData.status === 'Pending' 
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        : submissionData.status === 'Completed'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      {t("status." + submissionData.status)}
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-red-200 transition-all duration-300">
                    <span className="text-gray-600 font-semibold">{t("success.submission_date")}:</span>
                    <p className="text-gray-800 mt-1 flex items-center space-x-2">
                      <FaCalendarAlt className="text-gray-400" />
                      <span>{new Date().toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Important Notice */}
            <div className="bg-linear-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink">
                  <FiShield className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-blue-800 font-bold text-lg mb-2">
                    {t("success.important_notice")}
                  </p>
                  <p className="text-blue-600">
                    {t("success.save_tracking")}
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <button
                onClick={downloadTrackingNumber}
                className="group relative flex items-center space-x-3 bg-linear-to-r from-blue-500 to-cyan-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all duration-500 hover:scale-105 hover:shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <FaDownload className="text-sm relative z-10 transition-transform group-hover:scale-110" />
                <span className="relative z-10">{t("success.download_receipt")}</span>
              </button>

              <button
                onClick={resetForm}
                className="group relative flex items-center space-x-3 bg-linear-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-500 hover:scale-105 hover:shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <FaRocket className="text-sm relative z-10 transition-transform group-hover:scale-110" />
                <span className="relative z-10">{t("success.submit_another")}</span>
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Footer Note */}
        {currentStep < 3 && (
          <div className="text-center pt-8">
            <div className="inline-flex items-center space-x-2 bg-linear-to-r from-purple-50 to-pink-50 px-6 py-3 rounded-2xl border-2 border-purple-100">
              <FiAward className="text-purple-600" />
              <p className="text-purple-700 text-sm font-medium">
                {t("form.note")}
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .shadow-3xl {
          box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </main>
  );
}