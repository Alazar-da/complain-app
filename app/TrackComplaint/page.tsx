"use client";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useState, FormEvent, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  FaSearch, 
  FaSpinner, 
  FaUser, 
  FaPhone, 
  FaSchool, 
  FaMapMarkerAlt,
  FaFileAlt,
  FaExclamationTriangle,
  FaCalendar,
  FaDownload,
  FaPrint,
  FaCopy,
  FaCheckCircle,
  FaClock,
  FaSync,
  FaTimesCircle,
  FaComment,
  FaCheck
} from "react-icons/fa";
import { departments, DepartmentKey } from "@/data/departments";
import { FiCheckCircle, FiClock, FiInfo, FiMinus, FiPauseCircle, FiPlayCircle, FiTrendingDown, FiTrendingUp } from "react-icons/fi";
import { FaRightLeft } from "react-icons/fa6";

interface ComplaintData {
  _id: string;
  trackingNumber: string;
  fullName: string;
  phoneNumber: string;
  gender: "male" | "female";
  educationCommunity: "student" | "student_family" | "teacher" | "supervisor" | "expert";
  schoolName: string;
  wereda: string;
  title: string;
  department: string;
  subDepartment?: string;
  level: "Low" | "Medium" | "High";
  description: string;
  mediaUrl?: string;
  publicId?: string;
  status: "Pending" | "Canceled" | "In Progress" | "Completed";
  reason?: string; // New field from model
  resolvedAt?: string; // New field from model
  date: string;
  createdAt: string;
  updatedAt: string;
}


export default function TrackComplaint() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [complaint, setComplaint] = useState<ComplaintData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "en" | "am" | "om";

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

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError("");
    setComplaint(null);

    try {
      const res = await fetch(`/api/complaints/track?trackingNumber=${trackingNumber.trim()}`);
      const data = await res.json();

      if (data.success) {
        setComplaint(data.complaint);
      } else {
        setError(data.message || t("tracking.errors.not_found", "Complaint not found"));
      }
    } catch (err) {
      setError(t("tracking.errors.fetch_failed", "Failed to fetch complaint details"));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadDetails = () => {
    if (!complaint) return;

    const content = `
${t("tracking.download.title", "COMPLAINT DETAILS")} - ${t("tracking.download.tracking_number", "TRACKING NUMBER")}: ${complaint.trackingNumber}
${t("tracking.download.separator", "==============================================================")}

${t("tracking.download.personal_info_section", "PERSONAL INFORMATION:")}
${t("tracking.download.section_separator", "---------------------")}
${t("form.full_name", "Full Name")}: ${complaint.fullName}
${t("form.phone_number", "Phone Number")}: ${complaint.phoneNumber}
${t("form.gender", "Gender")}: ${complaint.gender}
${t("form.education_community", "Education Community")}: ${complaint.educationCommunity}
${t("form.school_name", "School Name")}: ${complaint.schoolName}
${t("form.wereda", "Wereda")}: ${complaint.wereda}

${t("tracking.download.complaint_section", "COMPLAINT DETAILS:")}
${t("tracking.download.section_separator", "---------------------")}
${t("form.title", "Title")}: ${complaint.title}
${t("form.department", "Department")}: ${complaint.department}
${complaint.subDepartment ? `${t("form.subDepartment", "Sub-Department")}: ${complaint.subDepartment}` : ''}
${t("tracking.priority", "Priority Level")}: ${complaint.level}
${t("tracking.status", "Status")}: ${complaint.status}
${t("tracking.download.submission_date", "Submission Date")}: ${new Date(complaint.createdAt).toLocaleDateString()}

${t("tracking.download.description_section", "DESCRIPTION:")}
${t("tracking.download.section_separator", "---------------------")}
${complaint.description}

${complaint.reason ? `
${t("tracking.download.reason_section", "RESOLUTION REASON:")}
${t("tracking.download.section_separator", "---------------------")}
${complaint.reason}
` : ''}

${t("tracking.download.tracking_section", "TRACKING INFORMATION:")}
${t("tracking.download.section_separator", "---------------------")}
${t("tracking.download.complaint_id", "Complaint ID")}: ${complaint._id}
${t("tracking.download.tracking_number", "Tracking Number")}: ${complaint.trackingNumber}
${t("tracking.download.created_at", "Created At")}: ${new Date(complaint.createdAt).toLocaleString()}
${t("tracking.download.updated_at", "Last Updated")}: ${new Date(complaint.updatedAt).toLocaleString()}
${complaint.resolvedAt ? `${t("tracking.download.resolved_at", "Resolved At")}: ${new Date(complaint.resolvedAt).toLocaleString()}` : ''}

${t("tracking.download.important_note", "IMPORTANT:")}
${t("tracking.download.section_separator", "---------------------")}
${t("tracking.download.keep_tracking", "Keep this tracking number safe for future reference.")}
${t("tracking.download.tracking_usage", "You can use it to check the status of your complaint anytime.")}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complaint-${complaint.trackingNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printDetails = () => {
    window.print();
  };

  const getStatusConfig = (status: string) => {
    const configs: any = {
      "Pending": {
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
        icon: <FiClock className="w-4 h-4" />,
        label: t("status.Pending") || "Pending"
      },
      "Completed": {
        color: "text-green-600 bg-green-50 border-green-200",
        icon: <FiCheckCircle className="w-4 h-4" />,
        label: t("status.Completed") || "Completed"
      },
      "In Progress": {
        color: "text-blue-600 bg-blue-50 border-blue-200",
        icon: <FiPlayCircle className="w-4 h-4" />,
        label: t("status.In Progress") || "In Progress"
      },
      "Canceled": {
        color: "text-red-600 bg-red-50 border-red-200",
        icon: <FiPauseCircle className="w-4 h-4" />,
        label: t("status.Canceled") || "Canceled"
      }
    };
    return configs[status] || {
      color: "text-gray-600 bg-gray-50 border-gray-200",
      icon: <FiInfo className="w-4 h-4" />,
      label: status
    };
  };

  const getLevelConfig = (level: string) => {
    const configs: any = {
      "High": {
        color: "text-red-600 bg-red-50 border-red-200",
        icon: <FiTrendingUp className="w-4 h-4" />,
        label: t("level.High") || "High"
      },
      "Medium": {
        color: "text-orange-600 bg-orange-50 border-orange-200",
        icon: <FiMinus className="w-4 h-4" />,
        label: t("level.Medium") || "Medium"
      },
      "Low": {
        color: "text-green-600 bg-green-50 border-green-200",
        icon: <FiTrendingDown className="w-4 h-4" />,
        label: t("level.Low") || "Low"
      }
    };
    return configs[level] || {
      color: "text-gray-600 bg-gray-50 border-gray-200",
      icon: <FiInfo className="w-4 h-4" />,
      label: level
    };
  };
 let statusConfig,levelConfig;
 if (complaint){
      statusConfig = getStatusConfig(complaint.status);
   levelConfig = getLevelConfig(complaint.level);
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <main className="relative min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8 text-slate-800">
      <section className="fixed top-2 right-2 z-50">
        <LanguageSwitcher />
      </section>
      
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Section - Displayed to provide clear purpose and instructions */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaSearch className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t("tracking.title", "Track Your Complaint")}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("tracking.description", "Enter your tracking number to check the status and details of your complaint")}
          </p>
        </div>

        {/* Search Section - Displayed to allow users to search for complaints */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="trackingNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("tracking.tracking_number", "Tracking Number")}
                </label>
                <input
                  id="trackingNumber"
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder={t("tracking.enter_tracking_number", "Enter your tracking number (e.g., CMP-ABC123XYZ)")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading || !trackingNumber.trim()}
                  className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 hover:cursor-pointer"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>{t("tracking.searching", "Searching...")}</span>
                    </>
                  ) : (
                    <>
                      <FaSearch />
                      <span>{t("tracking.search", "Search")}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2 text-red-700">
                <FaExclamationTriangle />
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Complaint Details - Displayed when complaint data is found */}
        {complaint && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in">
            {/* Header with Tracking Number - Displayed for quick reference and actions */}
            <div className="bg-linear-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {t("tracking.complaint_details", "Complaint Details")}
                  </h2>
                  <div className="flex items-center space-x-3">
                    <code className="bg-white/20 px-3 py-1 rounded-lg font-mono text-lg">
                      {complaint.trackingNumber}
                    </code>
                    <button
                      onClick={() => copyToClipboard(complaint.trackingNumber)}
                      className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors hover:cursor-pointer"
                      title={t("tracking.copy_tracking", "Copy tracking number")}
                    >
                      {copied ? <FaCheckCircle /> : <FaCopy />}
                    </button>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4 sm:mt-0">
                  <button
                    onClick={downloadDetails}
                    className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors hover:cursor-pointer"
                  >
                    <FaDownload />
                    <span className="hidden sm:inline">{t("tracking.downloads", "Download")}</span>
                  </button>
                  <button
                    onClick={printDetails}
                    className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors hover:cursor-pointer"
                  >
                    <FaPrint />
                    <span className="hidden sm:inline">{t("tracking.print", "Print")}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status and Priority - Displayed for quick status overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaRightLeft className="text-green-500" />
                    <span className="font-semibold text-gray-700">
                      {t("tracking.status", "Status")}
                    </span>
                  </div>
                <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                    {statusConfig.icon}
                    <span className="font-semibold">{statusConfig.label}</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaExclamationTriangle className="text-orange-500" />
                    <span className="font-semibold text-gray-700">
                      {t("tracking.priority", "Priority Level")}
                    </span>
                  </div>
                  <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium border ${levelConfig.color}`}>
                    {levelConfig.icon}
                    <span className="font-semibold">{levelConfig.label}</span>
                  </div>
                </div>
              </div>

              {/* Resolution Reason - Displayed when complaint is completed or canceled */}
              {(complaint.status === 'Completed' || complaint.status === 'Canceled') && complaint.reason && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <FaComment className={complaint.status === 'Completed' ? "text-green-500" : "text-red-500"} />
                    <span>
                      {complaint.status === 'Completed' 
                        ? t("tracking.resolution_reason", "Resolution Details")
                        : t("tracking.cancellation_reason", "Cancellation Reason")
                      }
                    </span>
                  </h3>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-800 whitespace-pre-wrap">{complaint.reason}</p>
                  </div>
                </div>
              )}

              {/* Personal Information - Displayed to show complainant details */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <FaUser className="text-blue-500" />
                  <span>{t("tracking.personal_information", "Personal Information")}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        {t("tracking.form.full_name", "Full Name")}
                      </label>
                      <p className="text-gray-800 font-medium">{complaint.fullName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        {t("tracking.form.phone_number", "Phone Number")}
                      </label>
                      <p className="text-gray-800 font-medium flex items-center space-x-2">
                        <FaPhone className="text-green-500 text-sm" />
                        <span>{complaint.phoneNumber}</span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        {t("tracking.form.gender", "Gender")}
                      </label>
                      <p className="text-gray-800 font-medium capitalize">{genderOptions.find(option => option.key === complaint.gender)?.label}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        {t("tracking.form.education_community", "Education Community")}
                      </label>
                      <p className="text-gray-800 font-medium capitalize">
                        {educationOptions.find(option => option.key === complaint.educationCommunity)?.label}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        {t("tracking.form.school_name", "School Name")}
                      </label>
                      <p className="text-gray-800 font-medium flex items-center space-x-2">
                        <FaSchool className="text-red-500 text-sm" />
                        <span>{complaint.schoolName}</span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        {t("tracking.form.wereda", "Wereda")}
                      </label>
                      <p className="text-gray-800 font-medium flex items-center space-x-2">
                        <FaMapMarkerAlt className="text-teal-500 text-sm" />
                        <span>{complaint.wereda}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complaint Details - Displayed to show complaint content */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <FaFileAlt className="text-purple-500" />
                  <span>{t("tracking.complaint_information", "Complaint Information")}</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {t("tracking.form.title", "Title")}
                    </label>
                    <p className="text-gray-800 font-medium text-lg">{complaint.title}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        {t("tracking.form.department", "Department")}
                      </label>
                      <p className="text-gray-800 font-medium">{departments[complaint.department as DepartmentKey]?.[lang] || complaint.department}</p>
                    </div>
                    {complaint.subDepartment && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          {t("tracking.form.subDepartment", "Sub-Department")}
                        </label>
                        <p className="text-gray-800 font-medium">{
                                                  departments[complaint.department as DepartmentKey]?.subDepartments.find(
                                                    (sub: any) =>
                                                      sub.en === complaint.subDepartment ||
                                                      sub.am === complaint.subDepartment ||
                                                      sub.om === complaint.subDepartment
                                                  )?.[lang] || complaint.subDepartment
                                                }</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {t("tracking.form.description", "Description")}
                    </label>
                    <p className="text-gray-800 mt-1 bg-white p-4 rounded-lg border border-gray-200 whitespace-pre-wrap">
                      {complaint.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Media Attachment - Displayed when media is available */}
              {complaint.mediaUrl && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {t("tracking.media_attachment", "Media Attachment")}
                  </h3>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    {complaint.mediaUrl.includes("image") ? (
                      <img
                        src={complaint.mediaUrl}
                        alt="Complaint attachment"
                        className="max-w-full h-auto rounded-lg max-h-96 object-contain mx-auto"
                      />
                    ) : (
                      <video
                        src={complaint.mediaUrl}
                        controls
                        className="max-w-full h-auto rounded-lg max-h-96 mx-auto"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Timeline - Displayed to show complaint timeline */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <FaCalendar className="text-orange-500" />
                  <span>{t("tracking.timeline", "Timeline")}</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      {t("tracking.submission_date", "Submission Date")}
                    </span>
                    <span className="text-gray-800 font-medium">
                      {formatDate(complaint.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      {t("tracking.last_updated", "Last Updated")}
                    </span>
                    <span className="text-gray-800 font-medium">
                      {formatDate(complaint.updatedAt)}
                    </span>
                  </div>
                  {/* Resolution Date - Displayed when complaint is resolved */}
                  {complaint.resolvedAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 flex items-center space-x-2">
                        <FaCheck className="text-green-500" />
                        <span>{t("tracking.resolved_at", "Resolved Date")}</span>
                      </span>
                      <span className="text-gray-800 font-medium">
                        {formatDate(complaint.resolvedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .bg-linear-to-br {
            background: white !important;
          }
          .shadow-lg {
            box-shadow: none !important;
          }
          .border {
            border: 1px solid #000 !important;
          }
        }
      `}</style>
    </main>
  );
}