'use client';

import { FiX, FiFileText, FiClock, FiTag, FiAlertCircle, FiCheckCircle, FiPlayCircle, FiPauseCircle, FiTrendingUp, FiTrendingDown, FiMinus, FiInfo, FiUser, FiPhone, FiMapPin, FiBook, FiHome, FiShield, FiMessageSquare, FiCalendar, FiUserCheck, FiDownload, FiTrash2 } from 'react-icons/fi';
import { TbBuilding, TbBuildingSkyscraper } from 'react-icons/tb';
import { useTranslation } from "react-i18next";
import { departments, DepartmentKey } from "@/data/departments";
import { useState, useEffect } from 'react';
import { FaSpinner, FaImage, FaVideo, FaVenusMars, FaGraduationCap, FaStar, FaPaperPlane, FaAward } from 'react-icons/fa';

interface ViewModalProps {
  complaint: any;
  onClose: () => void;
}

export default function ViewModal({ complaint, onClose }: ViewModalProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "en" | "am" | "om";
  const [countdown, setCountdown] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isHovered, setIsHovered] = useState<string | null>(null);

  // Countdown effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && message.type === "success") {
      const closeTimer = setTimeout(() => {
        onClose();
      }, 500);
      return () => clearTimeout(closeTimer);
    }
  }, [countdown, message.type, onClose]);

  const showMessage = (text: string, type = "info") => {
    setMessage({ text, type });
    if (type === "success") setCountdown(3);
  };

  // Extract public_id from Cloudinary URL
  const extractPublicId = (url: string): string => {
    try {
      const urlParts = url.split('/');
      const uploadIndex = urlParts.indexOf('upload');
      if (uploadIndex !== -1 && urlParts[uploadIndex + 1]) {
        const pathWithVersion = urlParts.slice(uploadIndex + 1).join('/');
        const withoutVersion = pathWithVersion.replace(/^v\d+\//, '');
        return withoutVersion.split('.')[0];
      }
      return '';
    } catch (error) {
      console.error('Error extracting public ID:', error);
      return '';
    }
  };

  // ✅ Clear the mediaUrl in DB
  const clearMediaUrl = async (complaintId: string) => {
    try {
      const res = await fetch("/api/complaints/clear-media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: complaintId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to clear media URL");

      showMessage(t("messages.file.remove.success"), "success");
      setTimeout(() => { window.location.reload(); }, 3000);
    } catch (error: any) {
      console.error("❌ Clear media failed:", error.message);
       showMessage(t("messages.file.remove.error"), "error");
    }
  };

  // Check if the same media is used by other complaints
  const checkDuplicateMedia = async (mediaUrl: string, complaintId: string) => {
    try {
      const res = await fetch(`/api/complaints/check-duplicate?mediaUrl=${encodeURIComponent(mediaUrl)}&excludeId=${complaintId}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to check duplicates");
      return data.isDuplicate;
    } catch (error: any) {
      console.error("❌ Duplicate check failed:", error.message);
      return false;
    }
  };

  // Delete from Cloudinary (with duplicate check)
  const deleteFromCloudinary = async () => {
    if (!complaint.mediaUrl) {
      showMessage("No media file to delete", "error");
      return;
    }

    try {
      setDeleting(true);
      const isDuplicate = await checkDuplicateMedia(complaint.mediaUrl, complaint._id);

      if (isDuplicate) {
        console.log("⚠️ Media used in another complaint — skipping Cloudinary delete");
        await clearMediaUrl(complaint._id);
        showMessage(t("messages.file.remove.success"), "success");
        return;
      }

      const publicId = extractPublicId(complaint.mediaUrl);
      if (!publicId) throw new Error("Could not extract file information");

      const isVideo = /\.(mp4|mov|avi|webm)$/i.test(complaint.mediaUrl);
      const resourceType = isVideo ? "video" : "image";

      const res = await fetch("/api/delete-cloudinary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_id: publicId,
          resource_type: resourceType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete file");

      console.log("✅ File deleted:", publicId);
      await clearMediaUrl(complaint._id);
    } catch (error: any) {
      console.error("❌ Delete failed:", error.message);
      showMessage(t("messages.file.remove.error"), "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleDelete = async () => {
    await deleteFromCloudinary();
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(complaint.mediaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      const fileExtension = isImage ? 'jpg' : 'mp4';
      const fileName = `complaint-media-${complaint._id || 'attachment'}.${fileExtension}`;
      a.download = fileName;
      
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setMessage({
        type: 'success',
        text: 'Media downloaded successfully!'
      });
      
    } catch (error) {
      console.error('Download failed:', error);
      setMessage({
        type: 'error',
        text: 'Failed to download media. Please try again.'
      });
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: any = {
      "Pending": {
        color: "border-yellow-300 bg-yellow-50 text-yellow-800",
        icon: <FiClock className="w-4 h-4" />,
        label: t("status.Pending") || "Pending"
      },
      "Appropriate": {
        color: "border-teal-300 bg-teal-50 text-teal-800",
        icon: <FiUserCheck className="w-4 h-4" />,
        label: t("status.Appropriate") || "Appropriate"
      },
      "Completed": {
        color: "border-green-300 bg-green-50 text-green-800",
        icon: <FiCheckCircle className="w-4 h-4" />,
        label: t("status.Completed") || "Completed"
      },
      "In Progress": {
        color: "border-blue-300 bg-blue-50 text-blue-800",
        icon: <FiPlayCircle className="w-4 h-4" />,
        label: t("status.In Progress") || "In Progress"
      },
      "Inappropriate": {
        color: "border-red-300 bg-red-50 text-red-800",
        icon: <FiAlertCircle className="w-4 h-4" />,
        label: t("status.Inappropriate") || "Inappropriate"
      }
    };
    return configs[status] || {
      color: "border-gray-300 bg-gray-50 text-gray-800",
      icon: <FiInfo className="w-4 h-4" />,
      label: status
    };
  };

  const getLevelConfig = (level: string) => {
    const configs: any = {
      "High": {
        color: "border-red-300 bg-red-50 text-red-800",
        icon: <FiTrendingUp className="w-4 h-4" />,
        label: t("levels.High") || "High"
      },
      "Medium": {
        color: "border-orange-300 bg-orange-50 text-orange-800",
        icon: <FiMinus className="w-4 h-4" />,
        label: t("levels.Medium") || "Medium"
      },
      "Low": {
        color: "border-green-300 bg-green-50 text-green-800",
        icon: <FiTrendingDown className="w-4 h-4" />,
        label: t("levels.Low") || "Low"
      }
    };
    return configs[level] || {
      color: "border-gray-300 bg-gray-50 text-gray-800",
      icon: <FiInfo className="w-4 h-4" />,
      label: level
    };
  };

  const getGenderLabel = (gender: string) => {
    const genders: any = {
      "male": t("gender.male") || "Male",
      "female": t("gender.female") || "Female"
    };
    return genders[gender] || gender;
  };

  const getEducationLabel = (education: string) => {
    const educations: any = {
      "student": t("education.student") || "Student",
      "student_family": t("education.student_family") || "Student Family",
      "teacher": t("education.teacher") || "Teacher",
      "supervisor": t("education.supervisor") || "Supervisor",
      "expert": t("education.expert") || "Expert"
    };
    return educations[education] || education;
  };

  const statusConfig = getStatusConfig(complaint.status);
  const levelConfig = getLevelConfig(complaint.level);

  const daysSinceSubmission = Math.floor(
    (new Date().getTime() - new Date(complaint.date).getTime()) / (1000 * 60 * 60 * 24)
  );

  const getMessageStyles = () => {
    const base = "my-4 p-4 rounded-xl border-2 text-center font-medium animate-fade-in";
    switch (message.type) {
      case "success": return `${base} bg-green-50 text-green-800 border-green-300`;
      case "error": return `${base} bg-red-50 text-red-800 border-red-300`;
      default: return `${base} bg-blue-50 text-blue-800 border-blue-300`;
    }
  };

  const isImage = complaint.mediaUrl?.includes("image") || /\.(jpg|jpeg|png|gif|webp)$/i.test(complaint.mediaUrl);
  const isVideo = complaint.mediaUrl?.includes("video") || /\.(mp4|mov|avi|webm)$/i.test(complaint.mediaUrl);

  return (
    <section className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-100 animate-fade-in">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden transform transition-all duration-500 animate-scale-in border border-white/20">
        {/* Enhanced Header */}
        <div className="bg-linear-to-r from-blue-600 via-purple-600 to-indigo-600 md:p-8 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <FiFileText className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="sm:text-3xl text-2xl font-bold text-white">{t("complaint_details.title")}</h2>
                  <p className="text-purple-100 text-lg hidden sm:flex items-center space-x-2">
                    <FiShield className="w-4 h-4" />
                    <span>{t("complaint_details.subtitle")}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                onMouseEnter={() => setIsHovered('close')}
                onMouseLeave={() => setIsHovered(null)}
                className="text-white/80 hover:text-white transition-all duration-300 p-3 rounded-xl hover:bg-white/10 hover:scale-110 cursor-pointer"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="md:p-8 p-6 overflow-y-auto max-h-[calc(95vh-180px)]">
          <div className="grid grid-cols-1 xl:grid-cols-7 gap-8">
            {/* Left Column - Personal Info & Basic Info */}
            <div className="xl:col-span-4 space-y-8">
              {/* Enhanced Personal Information Card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg md:p-8 p-6 border border-white/20">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FiUser className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{t("complaint_details.personal_info")}</h3>
                    <p className="text-gray-500">{t("complaint_details.complainant_details")}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { icon: <FiUser className="w-4 h-4" />, label: t("form.full_name"), value: complaint.fullName },
                    { icon: <FiPhone className="w-4 h-4" />, label: t("form.phone_number"), value: complaint.phoneNumber },
                    { icon: <FaVenusMars className="w-4 h-4" />, label: t("form.gender"), value: getGenderLabel(complaint.gender) },
                    { icon: <FaGraduationCap className="w-4 h-4" />, label: t("form.education_community"), value: getEducationLabel(complaint.educationCommunity) },
                    { icon: <FiHome className="w-4 h-4" />, label: t("form.school_name"), value: complaint.schoolName },
                    { icon: <FiMapPin className="w-4 h-4" />, label: t("form.wereda"), value: complaint.wereda }
                  ].map((item, index) => (
                    <div key={index} className="bg-linear-to-br from-gray-50 to-white rounded-2xl p-5 border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 group">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-300">
                          {item.icon}
                        </div>
                        <span className="text-sm font-semibold text-gray-500">{item.label}</span>
                      </div>
                      <p className="text-gray-800 font-bold text-lg">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enhanced Title Card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg md:p-8 p-6 border border-white/20">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FiFileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{t("complaint_details.complaint_title")}</h3>
                    <p className="text-gray-500">{t("complaint_details.main_description")}</p>
                  </div>
                </div>
                <p className="text-gray-800 text-lg leading-relaxed bg-linear-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100">
                  {complaint.title}
                </p>
              </div>

              {/* Enhanced Description Card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg md:p-8 p-6 border border-white/20">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-linear-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FiAlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{t("complaint_details.detailed_description")}</h3>
                    <p className="text-gray-500">{t("complaint_details.full_details")}</p>
                  </div>
                </div>
                <div className="bg-linear-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {complaint.description}
                  </p>
                </div>
              </div>

              {/* Enhanced Media Section */}
              {complaint.mediaUrl && (
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg md:p-8 p-6 border border-white/20">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                        {isImage ? (
                          <FaImage className="w-6 h-6 text-white" />
                        ) : (
                          <FaVideo className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {t("complaint_details.attached_media")}
                        </h3>
                        <p className="text-gray-500">
                          {isImage ? t("form.image") : t("form.video")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleDownload}
                        onMouseEnter={() => setIsHovered('download')}
                        onMouseLeave={() => setIsHovered(null)}
                        className="group relative bg-linear-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-500 hover:scale-105 hover:shadow-lg overflow-hidden flex items-center space-x-3"
                      >
                        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <FiDownload className="relative z-10 text-lg" />
                        <span className="relative z-10">{t("form.download")}</span>
                      </button>
                      
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        onMouseEnter={() => setIsHovered('delete')}
                        onMouseLeave={() => setIsHovered(null)}
                        className="group relative bg-linear-to-r from-red-500 to-rose-600 text-white px-6 py-3 rounded-2xl font-bold hover:from-red-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 hover:scale-105 hover:shadow-lg overflow-hidden flex items-center space-x-3"
                      >
                        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        {deleting ? (
                          <FaSpinner className="animate-spin relative z-10 text-lg" />
                        ) : (
                          <FiTrash2 className="relative z-10 text-lg" />
                        )}
                        <span className="relative z-10">
                          {deleting ? t("form.removing") : t("form.remove")}
                        </span>
                      </button>
                    </div>
                  </div>

                  {message.text && (
                    <div className={getMessageStyles()}>
                      <div className="flex items-center justify-center space-x-3">
                        {message.type === "success" && (
                          <FiCheckCircle className="w-5 h-5 text-green-600" />
                        )}
                        {message.type === "error" && (
                          <FiAlertCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="font-semibold">{message.text}</span>
                      </div>
                      {message.type === "success" && countdown > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                          Closing in {countdown} second{countdown !== 1 ? 's' : ''}...
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-linear-to-br from-gray-50 to-white rounded-2xl p-4 border-2 border-gray-100">
                    {isImage ? (
                      <div className="relative group overflow-hidden rounded-xl">
                        <img
                          src={complaint.mediaUrl}
                          alt="Complaint attachment"
                          className="w-full rounded-xl shadow-lg max-h-96 object-contain bg-gray-50 transform group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-end">
                          <div className="p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <div className="flex items-center space-x-2">
                              <FaImage className="w-5 h-5" />
                              <span className="font-semibold">Image Preview</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative group overflow-hidden rounded-xl">
                        <video
                          src={complaint.mediaUrl}
                          controls
                          className="w-full rounded-xl shadow-lg max-h-96 bg-black"
                        />
                        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-3 shadow-lg">
                          <FaVideo className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Metadata */}
            <div className="space-y-8 xl:col-span-3">
              {/* Enhanced Status & Priority */}
              <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-linear-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FiTag className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">{t("complaint_details.status")}</span>
                  </div>
                  <div className={`inline-flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold border-2 ${statusConfig.color} transform hover:scale-105 transition-transform duration-300`}>
                    {statusConfig.icon}
                    <span>{statusConfig.label}</span>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-linear-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FiTrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">{t("complaint_details.priority")}</span>
                  </div>
                  <div className={`inline-flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold border-2 ${levelConfig.color} transform hover:scale-105 transition-transform duration-300`}>
                    {levelConfig.icon}
                    <span>{levelConfig.label}</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Reason Section */}
              {(complaint.reason || complaint.status === 'Completed' || complaint.status === 'Inappropriate') && (
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg p-6 border border-white/20">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <FiBook className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {complaint.status === 'Completed' 
                          ? t("update_status.completion_reason") 
                          : complaint.status === 'Inappropriate'
                          ? t("update_status.inappropriate_reason")
                          : t("complaint_details.reason")}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {complaint.status === 'Completed' 
                          ? t("complaint_details.completion_explanation")
                          : complaint.status === 'Inappropriate'
                          ? t("complaint_details.inappropriate_explanation")
                          : t("complaint_details.status_reason")}
                      </p>
                    </div>
                  </div>
                  <div className="bg-linear-to-br from-gray-50 to-white rounded-2xl p-5 border-2 border-gray-100">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {complaint.reason || t("complaint_details.no_reason_provided")}
                    </p>
                  </div>
                  {complaint.resolvedAt && (
                    <div className="mt-4 flex items-center space-x-2 text-sm text-gray-500">
                      <FiCalendar className="w-4 h-4" />
                      <span>{t("complaint_details.resolved_on")}: {new Date(complaint.resolvedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  {complaint.responsiblePerson && (
                    <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500">
                      <FiUserCheck className="w-4 h-4" />
                      <span>{t("tracking.responsible_person")} {complaint.responsiblePerson}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Enhanced Department Information */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-linear-to-br from-teal-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <TbBuilding className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{t("complaint_details.department")}</h3>
                    <p className="text-gray-500 text-sm">{t("complaint_details.assigned_department")}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-linear-to-br from-gray-50 to-white rounded-2xl p-4 border-2 border-gray-100 hover:border-blue-200 transition-all duration-300">
                    <p className="text-sm font-semibold text-gray-500 mb-2">{t("complaint_details.main_department")}</p>
                    <p className="text-gray-800 font-bold text-lg">{departments[complaint.department as DepartmentKey]?.[lang] || complaint.department}</p>
                  </div>
                  {complaint.subDepartment && (
                    <div className="bg-linear-to-br from-gray-50 to-white rounded-2xl p-4 border-2 border-gray-100 hover:border-green-200 transition-all duration-300">
                      <p className="text-sm font-semibold text-gray-500 mb-2">{t("complaint_details.sub_department")}</p>
                      <p className="text-gray-800 font-bold text-lg flex items-center space-x-2">
                        <TbBuildingSkyscraper className="w-4 h-4 text-gray-400" />
                        <span>{
                          departments[complaint.department as DepartmentKey]?.subDepartments.find(
                            (sub: any) =>
                              sub.en === complaint.subDepartment ||
                              sub.am === complaint.subDepartment ||
                              sub.om === complaint.subDepartment
                          )?.[lang] || complaint.subDepartment
                        }</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Additional Information */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg p-6 border border-white/20">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-linear-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FiInfo className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{t("complaint_details.additional_info")}</h3>
                    <p className="text-gray-500 text-sm">{t("complaint_details.tracking_info")}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { label: t("complaint_details.tracking_number"), value: complaint.trackingNumber },
                    { label: t("complaint_details.complaint_id"), value: complaint._id?.slice(-8) || 'N/A' },
                    { label: t("complaint_details.submission_date"), value: new Date(complaint.createdAt).toLocaleDateString() }
                  ].map((item, index) => (
                    <div key={index} className="bg-linear-to-br from-gray-50 to-white rounded-2xl p-4 border-2 border-gray-100 hover:border-purple-200 transition-all duration-300">
                      <p className="text-sm font-semibold text-gray-500 mb-2">{item.label}</p>
                      <p className="text-gray-800 font-bold font-mono bg-gray-50 px-3 py-2 rounded-lg">
                        {item.value}
                      </p>
                    </div>
                  ))}
                  
                  <div className="bg-linear-to-br from-gray-50 to-white rounded-2xl p-4 border-2 border-gray-100 hover:border-yellow-200 transition-all duration-300">
                    <p className="text-sm font-semibold text-gray-500 mb-2">{t("complaint_details.days_active")}</p>
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${
                        daysSinceSubmission < 3 ? 'bg-green-500' :
                        daysSinceSubmission < 7 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="text-gray-800 font-bold text-lg">
                          {daysSinceSubmission} {t("complaint_details.days")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </section>
  );
}