"use client";
import { useState, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { 
  FaSearch, 
  FaSpinner, 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
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
  FaTimesCircle
} from "react-icons/fa";

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
  status: "Pending" | "Canceled" | "In Progress" | "Completed";
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
  const language = i18n.language as "am" | "en" | "om";

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
        setError(data.message || "Complaint not found");
      }
    } catch (err) {
      setError("Failed to fetch complaint details");
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
COMPLAINT DETAILS - TRACKING NUMBER: ${complaint.trackingNumber}
==============================================================

PERSONAL INFORMATION:
---------------------
Full Name: ${complaint.fullName}
Phone Number: ${complaint.phoneNumber}
Gender: ${complaint.gender}
Education Community: ${complaint.educationCommunity}
School Name: ${complaint.schoolName}
Wereda: ${complaint.wereda}

COMPLAINT DETAILS:
------------------
Title: ${complaint.title}
Department: ${complaint.department}
${complaint.subDepartment ? `Sub-Department: ${complaint.subDepartment}` : ''}
Priority Level: ${complaint.level}
Status: ${complaint.status}
Submission Date: ${new Date(complaint.createdAt).toLocaleDateString()}

DESCRIPTION:
------------
${complaint.description}

TRACKING INFORMATION:
---------------------
Complaint ID: ${complaint._id}
Tracking Number: ${complaint.trackingNumber}
Last Updated: ${new Date(complaint.updatedAt).toLocaleString()}

IMPORTANT:
----------
Keep this tracking number safe for future reference.
You can use it to check the status of your complaint anytime.
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <FaCheckCircle className="text-green-500" />;
      case 'In Progress':
        return <FaSync className="text-blue-500 animate-spin" />;
      case 'Pending':
        return <FaClock className="text-yellow-500" />;
      case 'Canceled':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaExclamationTriangle className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Canceled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
    <main className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8 text-slate-800">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
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

        {/* Search Section */}
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

        {/* Complaint Details */}
        {complaint && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in">
            {/* Header with Tracking Number */}
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
                    <span className="hidden sm:inline">{t("tracking.download", "Download")}</span>
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
              {/* Status and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(complaint.status)}
                    <span className="font-semibold text-gray-700">
                      {t("tracking.status", "Status")}
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <FaExclamationTriangle className="text-orange-500" />
                    <span className="font-semibold text-gray-700">
                      {t("tracking.priority", "Priority Level")}
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getLevelColor(complaint.level)}`}>
                    {complaint.level}
                  </span>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <FaUser className="text-blue-500" />
                  <span>{t("tracking.personal_information", "Personal Information")}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        {t("form.full_name", "Full Name")}
                      </label>
                      <p className="text-gray-800 font-medium">{complaint.fullName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        {t("form.phone_number", "Phone Number")}
                      </label>
                      <p className="text-gray-800 font-medium flex items-center space-x-2">
                        <FaPhone className="text-green-500 text-sm" />
                        <span>{complaint.phoneNumber}</span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        {t("form.gender", "Gender")}
                      </label>
                      <p className="text-gray-800 font-medium capitalize">{complaint.gender}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        {t("form.education_community", "Education Community")}
                      </label>
                      <p className="text-gray-800 font-medium capitalize">
                        {complaint.educationCommunity.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        {t("form.school_name", "School Name")}
                      </label>
                      <p className="text-gray-800 font-medium flex items-center space-x-2">
                        <FaSchool className="text-red-500 text-sm" />
                        <span>{complaint.schoolName}</span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        {t("form.wereda", "Wereda")}
                      </label>
                      <p className="text-gray-800 font-medium flex items-center space-x-2">
                        <FaMapMarkerAlt className="text-teal-500 text-sm" />
                        <span>{complaint.wereda}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complaint Details */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <FaFileAlt className="text-purple-500" />
                  <span>{t("tracking.complaint_information", "Complaint Information")}</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {t("form.title", "Title")}
                    </label>
                    <p className="text-gray-800 font-medium text-lg">{complaint.title}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        {t("form.department", "Department")}
                      </label>
                      <p className="text-gray-800 font-medium">{complaint.department}</p>
                    </div>
                    {complaint.subDepartment && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          {t("form.subDepartment", "Sub-Department")}
                        </label>
                        <p className="text-gray-800 font-medium">{complaint.subDepartment}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {t("form.description", "Description")}
                    </label>
                    <p className="text-gray-800 mt-1 bg-white p-4 rounded-lg border border-gray-200 whitespace-pre-wrap">
                      {complaint.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Media Attachment */}
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

              {/* Timeline */}
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