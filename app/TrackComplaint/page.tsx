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
  FaCheck,
  FaUserTie,
  FaPaperPlane,
  FaRocket,
  FaAward,
  FaBuilding,
  FaHome,
  FaMapPin,
  FaCalendarDay,
  FaComments,
  FaUniversity,
  FaMusic,
  FaImage,
  FaVideo,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileArchive
} from "react-icons/fa";
import { FiCheckCircle, FiClock, FiInfo, FiMinus, FiPauseCircle, FiPlayCircle, FiTrendingDown, FiTrendingUp, FiUserCheck } from "react-icons/fi";
import { FaRightLeft, FaStar } from "react-icons/fa6";
import { departments, DepartmentKey } from "@/data/departments";

interface ComplaintData {
  _id: string;
  trackingNumber: string;
  
  // Step 1: Personal Information
  fullName: string;
  phoneNumber: string;
  gender: "male" | "female";
  educationCommunity: "student" | "student_family" | "teacher" | "supervisor" | "expert";
  schoolName: string;
  wereda: string;
  city: string;
  subCity: string;
  houseNo: string;
  
  // Step 2: Complaint Information
  title: string;
  department: string;
  subDepartment?: string;
  level: "Low" | "Medium" | "High";
  description: string;
  mediaUrl?: string;
  publicId?: string;
  complaintMadeDate: string;
  complaintMadePlace: string;
  responsibleBody: string;
  responceGived: string;
  
  // Status fields
  status: "Pending" | "Appropriate" | "In Progress" | "Completed" | "Inappropriate";
  reason?: string;
  responsiblePerson?: string;
  resolvedAt?: string;
  
  // Timestamps
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
  const [isHovered, setIsHovered] = useState<string | null>(null);
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

  // Function to get file type icon
  const getFileIcon = (mediaUrl?: string) => {
    if (!mediaUrl) return { icon: FaFileAlt, color: 'text-gray-600', bg: 'bg-gray-100' };
    
    if (mediaUrl.includes("image")) return { icon: FaImage, color: 'text-green-600', bg: 'bg-green-100' };
    if (mediaUrl.includes("video")) return { icon: FaVideo, color: 'text-blue-600', bg: 'bg-blue-100' };
    if (mediaUrl.includes("audio")) return { icon: FaMusic, color: 'text-purple-600', bg: 'bg-purple-100' };
    if (mediaUrl.includes("pdf")) return { icon: FaFilePdf, color: 'text-red-600', bg: 'bg-red-100' };
    if (mediaUrl.includes("word") || mediaUrl.includes("document")) return { icon: FaFileWord, color: 'text-blue-600', bg: 'bg-blue-100' };
    if (mediaUrl.includes("excel") || mediaUrl.includes("sheet")) return { icon: FaFileExcel, color: 'text-green-600', bg: 'bg-green-100' };
    if (mediaUrl.includes("zip") || mediaUrl.includes("archive") || mediaUrl.includes("compressed")) return { icon: FaFileArchive, color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { icon: FaFileAlt, color: 'text-gray-600', bg: 'bg-gray-100' };
  };

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
${t("form.gender", "Gender")}: ${t(`gender.${complaint.gender}`)}
${t("form.education_community", "Education Community")}: ${t(`education.${complaint.educationCommunity}`)}
${t("form.school_name", "School Name")}: ${complaint.schoolName}
${t("form.wereda", "Wereda")}: ${complaint.wereda}
${t("form.city", "City")}: ${t("city")}
${t("form.sub_city", "Sub City")}: ${t(`sub_city.${complaint.subCity}`)}
${t("form.house_no", "House No")}: ${complaint.houseNo}

${t("tracking.download.complaint_section", "COMPLAINT DETAILS:")}
${t("tracking.download.section_separator", "---------------------")}
${t("form.title", "Title")}: ${complaint.title}
${t("form.department", "Department")}: ${departments[complaint.department as DepartmentKey]?.[lang] || complaint.department}
${complaint.subDepartment ? `${t("form.subDepartment", "Sub-Department")}: ${departments[complaint.department as DepartmentKey]?.subDepartments.find(
                            (sub: any) =>
                              sub.en === complaint.subDepartment ||
                              sub.am === complaint.subDepartment ||
                              sub.om === complaint.subDepartment
                          )?.[lang] || complaint.subDepartment}\n` : ''}
${t("tracking.priority", "Priority Level")}: ${t(`levels.${complaint.level}`)}
${t("tracking.status", "Status")}: ${t(`status.${complaint.status}`)}
${complaint.complaintMadeDate ? `${t("form.complaint_made_date", "Complaint Made Date")}: ${new Date(complaint.complaintMadeDate).toLocaleDateString()}\n` : ''}
${complaint.complaintMadePlace ? `${t("form.complaint_made_place", "Complaint Made Place")}: ${complaint.complaintMadePlace}\n` : ''}
${complaint.responsibleBody ? `${t("form.responsible_person", "Responsible Body")}: ${complaint.responsibleBody}\n` : ''}
${complaint.responceGived ? `${t("form.response_given", "Response Given")}: ${complaint.responceGived}\n` : ''}
${complaint.responsiblePerson ? `${t("tracking.responsible_person", "Responsible Person")}: ${complaint.responsiblePerson}\n` : ''}
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
      "Appropriate": {
        color: "text-green-600 bg-green-50 border-green-200",
        icon: <FiUserCheck className="w-4 h-4" />,
        label: t("status.Appropriate") || "Appropriate"
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
      "Inappropriate": {
        color: "text-red-600 bg-red-50 border-red-200",
        icon: <FiPauseCircle className="w-4 h-4" />,
        label: t("status.Inappropriate") || "Inappropriate"
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
        label: t("levels.High") || "High"
      },
      "Medium": {
        color: "text-orange-600 bg-orange-50 border-orange-200",
        icon: <FiMinus className="w-4 h-4" />,
        label: t("levels.Medium") || "Medium"
      },
      "Low": {
        color: "text-green-600 bg-green-50 border-green-200",
        icon: <FiTrendingDown className="w-4 h-4" />,
        label: t("levels.Low") || "Low"
      }
    };
    return configs[level] || {
      color: "text-gray-600 bg-gray-50 border-gray-200",
      icon: <FiInfo className="w-4 h-4" />,
      label: level
    };
  };

  let statusConfig, levelConfig;
  if (complaint) {
    statusConfig = getStatusConfig(complaint.status);
    levelConfig = getLevelConfig(complaint.level);
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render file preview based on type
  const renderFilePreview = () => {
    if (!complaint?.mediaUrl) return null;

    const fileIcon = getFileIcon(complaint.mediaUrl);
    const IconComponent = fileIcon.icon;

    if (complaint.mediaUrl.includes("image")) {
      return (
        <img
          src={complaint.mediaUrl}
          alt="Complaint attachment"
          className="max-w-full h-auto rounded-xl max-h-96 object-contain mx-auto shadow-lg"
        />
      );
    } else if (complaint.mediaUrl.includes("video")) {
      return (
        <video
          src={complaint.mediaUrl}
          controls
          className="max-w-full h-auto rounded-xl max-h-96 mx-auto shadow-lg"
        />
      );
    } else if (complaint.mediaUrl.includes("audio")) {
      return (
        <div className="w-full p-6 md:p-8 bg-linear-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100 flex flex-col items-center justify-center">
          <FaMusic className="w-16 h-16 text-purple-500 mb-4" />
          <p className="text-purple-700 font-medium">{t("form.audio_file", "Audio File")}</p>
          <audio src={complaint.mediaUrl} controls className="w-full mt-4" />
        </div>
      );
    } else if (complaint.mediaUrl.includes("pdf")) {
      return (
        <div className="w-full p-6 md:p-8 bg-linear-to-r from-red-50 to-pink-50 rounded-xl border-2 border-red-100 flex flex-col items-center justify-center">
          <FaFilePdf className="w-16 h-16 text-red-500 mb-4" />
          <p className="text-red-700 font-medium">{t("form.pdf_file", "PDF Document")}</p>
          <a 
            href={complaint.mediaUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-4 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-300"
          >
            {t("form.view_pdf", "View PDF")}
          </a>
        </div>
      );
    } else {
      // Generic file preview for other types
      return (
        <div className="w-full p-6 md:p-8 bg-linear-to-r from-gray-50 to-blue-50 rounded-xl border-2 border-gray-100 flex flex-col items-center justify-center">
          <IconComponent className="w-16 h-16 text-gray-500 mb-4" />
          <a 
            href={complaint.mediaUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-4 px-5 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-300"
          >
            {t("form.download_file", "Download File")}
          </a>
        </div>
      );
    }
  };

  return (
    <main className="relative min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-100 py-8 text-slate-800 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Floating Action Buttons */}
      <section className="fixed top-6 right-6 z-50">
        <LanguageSwitcher />
      </section>

      <section className="fixed top-6 left-6 z-50">
        <button 
          onClick={() => window.location.href = '/'}
          onMouseEnter={() => setIsHovered('home')}
          onMouseLeave={() => setIsHovered(null)}
          className="group relative flex items-center space-x-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 active:scale-95 hover:cursor-pointer overflow-hidden"
        >
          <div className="absolute inset-0 bg-linear-to-r from-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <FaPaperPlane className="w-5 h-5 relative z-10 transition-transform group-hover:scale-110 group-hover:-rotate-45" />
          <span className="relative z-10">{t("back_to_home", "Back to Home")}</span>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
        </button>
      </section>
      
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* Enhanced Header Section */}
        <div className="text-center my-12">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-linear-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <FaSearch className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <FaStar className="w-4 h-4 text-yellow-800" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {t("tracking.title", "Track Your Complaint")}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t("tracking.description", "Enter your tracking number to check the status and details of your complaint")}
          </p>
        </div>

        {/* Enhanced Search Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl sm:p-6 md:p-8 p-6 mb-8 border border-white/20 transform transition-all duration-500 hover:shadow-3xl">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-end">
              <div className="flex-1 w-full">
                <label htmlFor="trackingNumber" className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                    <FaSearch className="text-white text-sm" />
                  </div>
                  <span className="text-lg font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {t("tracking.tracking_number", "Tracking Number")}
                  </span>
                </label>
                <div className="relative group">
                  <input
                    id="trackingNumber"
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder={t("tracking.enter_tracking_number", "Enter your tracking number (e.g., CMP-ABC123XYZ)")}
                    className="w-full px-6 py-5 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl focus:shadow-2xl group-hover:border-blue-300 text-lg font-medium"
                    required
                  />
                  <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>
              
              <div className="flex sm:items-end w-full sm:w-auto">
                <button
                  type="submit"
                  disabled={loading || !trackingNumber.trim()}
                  className="group relative w-full sm:w-48 bg-linear-to-r from-blue-500 to-purple-600 text-white px-8 py-5 rounded-2xl font-bold hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-500 disabled:hover:to-purple-600 transition-all duration-500 hover:scale-105 hover:shadow-2xl active:scale-95 overflow-hidden"
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 delay-200"></div>
                  
                  {/* Button Content */}
                  <div className="relative z-10 flex items-center justify-center space-x-3">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-lg font-semibold">{t("tracking.searching", "Searching...")}</span>
                      </>
                    ) : (
                      <>
                        <FaSearch className="text-lg transition-transform group-hover:scale-110 group-hover:rotate-12" />
                        <span className="text-lg font-semibold">{t("tracking.search", "Search")}</span>
                      </>
                    )}
                  </div>
                  
                  {/* Bottom Border Animation */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-linear-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl shadow-lg">
              <div className="flex items-center space-x-3 text-red-700">
                <FaExclamationTriangle className="text-red-600" />
                <span className="font-semibold">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Complaint Details */}
        {complaint && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-fade-in transform transition-all duration-500 hover:shadow-3xl">
            {/* Enhanced Header with Tracking Number */}
            <div className="bg-linear-to-r from-blue-600 via-purple-600 to-indigo-600 sm:p-6 md:p-8 p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-3">
                      {t("tracking.complaint_details", "Complaint Details")}
                    </h2>
                    <div className="flex items-center space-x-4">
                      <code className="bg-white/20 px-4 py-3 rounded-xl font-mono text-xl font-bold backdrop-blur-sm">
                        {complaint.trackingNumber}
                      </code>
                      <button
                        onClick={() => copyToClipboard(complaint.trackingNumber)}
                        className="group p-3 md:p-4 bg-white/20 rounded-xl hover:bg-white/30 transition-all duration-300 hover:scale-110 hover:cursor-pointer relative overflow-hidden"
                        title={t("tracking.copy_tracking", "Copy tracking number")}
                      >
                        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        {copied ? <FaCheckCircle className="relative z-10" /> : <FaCopy className="relative z-10" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex space-x-3 mt-6 sm:mt-0">
                    <button
                      onClick={downloadDetails}
                      className="group relative flex items-center space-x-3 bg-white/20 px-5 py-3 rounded-xl hover:bg-white/30 transition-all duration-300 hover:scale-105 hover:cursor-pointer overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <FaDownload className="relative z-10" />
                      <span className="relative z-10 hidden sm:inline">{t("tracking.downloads", "Download")}</span>
                    </button>
                    <button
                      onClick={printDetails}
                      className="group relative flex items-center space-x-3 bg-white/20 px-5 py-3 rounded-xl hover:bg-white/30 transition-all duration-300 hover:scale-105 hover:cursor-pointer overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <FaPrint className="relative z-10" />
                      <span className="relative z-10 hidden sm:inline">{t("tracking.print", "Print")}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="sm:p-6 md:p-8 p-6 space-y-8">
              {/* Enhanced Status and Priority Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-linear-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FaRightLeft className="text-blue-600 text-lg" />
                    </div>
                    <span className="font-bold text-gray-800 text-lg">
                      {t("tracking.status", "Status")}
                    </span>
                  </div>
                  <div className={`inline-flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold border-2 ${statusConfig.color} transform hover:scale-105 transition-transform duration-300`}>
                    {statusConfig.icon}
                    <span>{statusConfig.label}</span>
                  </div>
                </div>

                <div className="bg-linear-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <FaExclamationTriangle className="text-orange-600 text-lg" />
                    </div>
                    <span className="font-bold text-gray-800 text-lg">
                      {t("tracking.priority", "Priority Level")}
                    </span>
                  </div>
                  <div className={`inline-flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold border-2 ${levelConfig.color} transform hover:scale-105 transition-transform duration-300`}>
                    {levelConfig.icon}
                    <span>{levelConfig.label}</span>
                  </div>
                </div>
              </div>

              {/* Responsible Person Section */}
              {complaint.responsiblePerson && (
                <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <FaUserTie className="text-green-600" />
                    </div>
                    <span>{t("tracking.responsible_person", "Responsible Person")}</span>
                  </h3>
                  <div className="bg-white p-4 rounded-xl border-2 border-green-100">
                    <p className="text-gray-800 font-semibold text-lg flex items-center space-x-3">
                      <FiUserCheck className="text-green-500" />
                      <span>{complaint.responsiblePerson}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Resolution Reason Section */}
              {(complaint.status === 'Completed' || complaint.status === 'Inappropriate') && complaint.reason && (
                <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FaComment className={complaint.status === 'Completed' ? "text-green-500" : "text-red-500"} />
                    </div>
                    <span>
                      {complaint.status === 'Completed' 
                        ? t("tracking.resolution_reason", "Resolution Details")
                        : t("tracking.cancellation_reason", "Cancellation Reason")
                      }
                    </span>
                  </h3>
                  <div className="bg-white p-5 rounded-xl border-2 border-blue-100">
                    <p className="text-gray-800 whitespace-pre-wrap text-lg leading-relaxed">{complaint.reason}</p>
                  </div>
                </div>
              )}

              {/* New Complaint Details Section */}
              <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FaCalendarDay className="text-purple-600" />
                  </div>
                  <span>{t("tracking.complaint_process_details", "Complaint Process Details")}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {complaint.complaintMadeDate && (
                    <div className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-purple-200 transition-all duration-300">
                      <label className="text-sm font-semibold text-gray-600 flex items-center space-x-2 mb-2">
                        <FaCalendarDay className="text-purple-500" />
                        <span>{t("form.complaint_made_date", "Complaint Made Date")}</span>
                      </label>
                      <p className="text-gray-800 font-bold">
                        {formatDate(complaint.complaintMadeDate)}
                      </p>
                    </div>
                  )}
                  
                  {complaint.complaintMadePlace && (
                    <div className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-teal-200 transition-all duration-300">
                      <label className="text-sm font-semibold text-gray-600 flex items-center space-x-2 mb-2">
                        <FaMapPin className="text-teal-500" />
                        <span>{t("form.complaint_made_place", "Complaint Made Place")}</span>
                      </label>
                      <p className="text-gray-800 font-bold">{complaint.complaintMadePlace}</p>
                    </div>
                  )}
                  
                  {complaint.responsibleBody && (
                    <div className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300">
                      <label className="text-sm font-semibold text-gray-600 flex items-center space-x-2 mb-2">
                        <FaUniversity className="text-blue-500" />
                        <span>{t("form.responsible_person", "Responsible Person")}</span>
                      </label>
                      <p className="text-gray-800 font-bold">{complaint.responsibleBody}</p>
                    </div>
                  )}
                  
                  {complaint.responceGived && (
                    <div className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-green-200 transition-all duration-300">
                      <label className="text-sm font-semibold text-gray-600 flex items-center space-x-2 mb-2">
                        <FaComments className="text-green-500" />
                        <span>{t("form.response_given", "Response Given")}</span>
                      </label>
                      <p className="text-gray-800 font-bold">{complaint.responceGived}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Personal Information */}
              <div className="bg-linear-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FaUser className="text-blue-600" />
                  </div>
                  <span>{t("tracking.personal_information", "Personal Information")}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300">
                      <label className="text-sm font-semibold text-gray-600">
                        {t("tracking.form.full_name", "Full Name")}
                      </label>
                      <p className="text-gray-800 font-bold text-lg">{complaint.fullName}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-green-200 transition-all duration-300">
                      <label className="text-sm font-semibold text-gray-600">
                        {t("tracking.form.phone_number", "Phone Number")}
                      </label>
                      <p className="text-gray-800 font-bold text-lg flex items-center space-x-3">
                        <FaPhone className="text-green-500" />
                        <span>{complaint.phoneNumber}</span>
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-purple-200 transition-all duration-300">
                      <label className="text-sm font-semibold text-gray-600">
                        {t("tracking.form.gender", "Gender")}
                      </label>
                      <p className="text-gray-800 font-bold text-lg capitalize">{genderOptions.find(option => option.key === complaint.gender)?.label}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-200 transition-all duration-300">
                      <label className="text-sm font-semibold text-gray-600 flex items-center space-x-2">
                        <FaBuilding className="text-indigo-500" />
                        <span>{t("form.city", "City")}</span>
                      </label>
                      <p className="text-gray-800 font-bold text-lg">{t("city")}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-orange-200 transition-all duration-300">
                      <label className="text-sm font-semibold text-gray-600">
                        {t("tracking.form.education_community", "Education Community")}
                      </label>
                      <p className="text-gray-800 font-bold text-lg capitalize">
                        {educationOptions.find(option => option.key === complaint.educationCommunity)?.label}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-red-200 transition-all duration-300">
                      <label className="text-sm font-semibold text-gray-600">
                        {t("tracking.form.school_name", "School Name")}
                      </label>
                      <p className="text-gray-800 font-bold text-lg flex items-center space-x-3">
                        <FaSchool className="text-red-500" />
                        <span>{complaint.schoolName}</span>
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-teal-200 transition-all duration-300">
                      <label className="text-sm font-semibold text-gray-600">
                        {t("tracking.form.wereda", "Wereda")}
                      </label>
                      <p className="text-gray-800 font-bold text-lg flex items-center space-x-3">
                        <FaMapMarkerAlt className="text-teal-500" />
                        <span>{complaint.wereda}</span>
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-pink-200 transition-all duration-300">
                      <label className="text-sm font-semibold text-gray-600 flex items-center space-x-2">
                        <FaMapPin className="text-pink-500" />
                        <span>{t("form.sub_city", "Sub City")}</span>
                      </label>
                      <p className="text-gray-800 font-bold text-lg">{t(`sub_city.${complaint.subCity}`)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-amber-200 transition-all duration-300">
                      <label className="text-sm font-semibold text-gray-600 flex items-center space-x-2">
                        <FaHome className="text-amber-500" />
                        <span>{t("form.house_no", "House No")}</span>
                      </label>
                      <p className="text-gray-800 font-bold text-lg">{complaint.houseNo}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Complaint Details */}
              <div className="bg-linear-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FaFileAlt className="text-purple-600" />
                  </div>
                  <span>{t("tracking.complaint_information", "Complaint Information")}</span>
                </h3>
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-xl border-2 border-gray-100 hover:border-purple-200 transition-all duration-300">
                    <label className="text-sm font-semibold text-gray-600">
                      {t("tracking.form.title", "Title")}
                    </label>
                    <p className="text-gray-800 font-bold text-xl mt-2">{complaint.title}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300">
                      <label className="text-sm font-semibold text-gray-600">
                        {t("tracking.form.department", "Department")}
                      </label>
                      <p className="text-gray-800 font-bold text-lg mt-2">{departments[complaint.department as DepartmentKey]?.[lang] || complaint.department}</p>
                    </div>
                    {complaint.subDepartment && (
                      <div className="bg-white p-5 rounded-xl border-2 border-gray-100 hover:border-green-200 transition-all duration-300">
                        <label className="text-sm font-semibold text-gray-600">
                          {t("tracking.form.subDepartment", "Sub-Department")}
                        </label>
                        <p className="text-gray-800 font-bold text-lg mt-2">{
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

                  <div className="bg-white p-5 rounded-xl border-2 border-gray-100 hover:border-indigo-200 transition-all duration-300">
                    <label className="text-sm font-semibold text-gray-600">
                      {t("tracking.form.description", "Description")}
                    </label>
                    <p className="text-gray-800 mt-3 bg-gray-50 p-4 rounded-lg border-2 border-gray-200 whitespace-pre-wrap leading-relaxed">
                      {complaint.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced Media Attachment */}
              {complaint.mediaUrl && (
                <div className="bg-linear-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                    <div className={`w-10 h-10 ${getFileIcon(complaint.mediaUrl).bg} rounded-xl flex items-center justify-center`}>
                      {(() => {
                        const Icon = getFileIcon(complaint.mediaUrl).icon;
                        return <Icon className={getFileIcon(complaint.mediaUrl).color} />;
                      })()}
                    </div>
                    <span>{t("tracking.media_attachment", "Media Attachment")}</span>
                  </h3>
                  <div className="bg-white md:p-5 rounded-xl border-2 border-gray-200">
                    {renderFilePreview()}
                  </div>
                </div>
              )}

              {/* Enhanced Timeline */}
              <div className="bg-linear-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <FaCalendar className="text-orange-600" />
                  </div>
                  <span>{t("tracking.timeline", "Timeline")}</span>
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center bg-white p-3 md:p-4 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300">
                    <span className="text-sm font-semibold text-gray-600">
                      {t("tracking.submission_date", "Submission Date")}
                    </span>
                    <span className="text-gray-800 font-bold">
                      {formatDate(complaint.createdAt)}
                    </span>
                  </div>
                  {complaint.complaintMadeDate && (
                    <div className="flex justify-between items-center bg-white p-3 md:p-4 rounded-xl border-2 border-gray-100 hover:border-purple-200 transition-all duration-300">
                      <span className="text-sm font-semibold text-gray-600 flex items-center space-x-3">
                        {/* <FaCalendarDay className="text-purple-500" /> */}
                        <span>{t("form.complaint_made_date", "Complaint Made Date")}</span>
                      </span>
                      <span className="text-gray-800 font-bold">
                        {formatDate(complaint.complaintMadeDate)}
                      </span>
                    </div>
                  )}
                  {complaint.resolvedAt && (
                    <div className="flex justify-between items-center bg-white p-3 md:p-4 rounded-xl border-2 border-gray-100 hover:border-green-200 transition-all duration-300">
                      <span className="text-sm font-semibold text-gray-600 flex items-center space-x-3">
                       {/*  <FaCheck className="text-green-500" /> */}
                        <span>{t("tracking.resolved_at", "Resolved Date")}</span>
                      </span>
                      <span className="text-gray-800 font-bold">
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
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
        .shadow-3xl {
          box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
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
          .shadow-2xl, .shadow-lg {
            box-shadow: none !important;
          }
          .border-2 {
            border: 1px solid #000 !important;
          }
          .backdrop-blur-xl {
            backdrop-filter: none !important;
          }
        }
      `}</style>
    </main>
  );
}