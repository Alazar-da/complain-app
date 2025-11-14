'use client';

import { FiX, FiFileText, FiClock, FiTag, FiAlertCircle, FiCheckCircle, FiPlayCircle, FiPauseCircle, FiTrendingUp, FiTrendingDown, FiMinus, FiInfo } from 'react-icons/fi';
import { TbBuilding, TbBuildingSkyscraper } from 'react-icons/tb';
import { useTranslation } from "react-i18next";
import { departments, DepartmentKey } from "@/data/departments";
import { useState, useEffect } from 'react';
import { FaSpinner, FaTrash, FaImage, FaVideo, FaCloudUploadAlt, FaDownload } from 'react-icons/fa';
import { time } from 'console';

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

  // Countdown effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && message.type === "success") {
      // Auto-close when countdown reaches 0
      const closeTimer = setTimeout(() => {
        onClose();
      }, 500);
      return () => clearTimeout(closeTimer);
    }
  }, [countdown, message.type, onClose]);

  const showMessage = (text: string, type = "info") => {
    setMessage({ text, type });
    if (type === "success") setCountdown(3); // Start 3-second countdown
  };

  // Extract public_id from Cloudinary URL
  const extractPublicId = (url: string): string => {
    try {
      const urlParts = url.split('/');
      const uploadIndex = urlParts.indexOf('upload');
      if (uploadIndex !== -1 && urlParts[uploadIndex + 1]) {
        // Get everything after 'upload/' and remove file extension
        const pathWithVersion = urlParts.slice(uploadIndex + 1).join('/');
        const withoutVersion = pathWithVersion.replace(/^v\d+\//, '');
        return withoutVersion.split('.')[0]; // Remove file extension
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
    return data.isDuplicate; // boolean
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

    // 🔍 Step 1: Check for duplicates
    const isDuplicate = await checkDuplicateMedia(complaint.mediaUrl, complaint._id);

    if (isDuplicate) {
      console.log("⚠️ Media used in another complaint — skipping Cloudinary delete");
      await clearMediaUrl(complaint._id);
      showMessage(t("messages.file.remove.success"), "success");
      return;
    }

    // 🧩 Step 2: Extract Cloudinary public ID
    const publicId = extractPublicId(complaint.mediaUrl);
    if (!publicId) throw new Error("Could not extract file information");

    const isVideo = /\.(mp4|mov|avi|webm)$/i.test(complaint.mediaUrl);
    const resourceType = isVideo ? "video" : "image";

    // 🗑️ Step 3: Delete from Cloudinary
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

    // 🧹 Step 4: Clear the URL in DB
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
    // Fetch the media file
    const response = await fetch(complaint.mediaUrl);
    const blob = await response.blob();
    
    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    
    // Set the filename
    const fileExtension = isImage ? 'jpg' : 'mp4';
    const fileName = `complaint-media-${complaint._id || 'attachment'}.${fileExtension}`;
    a.download = fileName;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    // Optional: Show success message
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

  const statusConfig = getStatusConfig(complaint.status);
  const levelConfig = getLevelConfig(complaint.level);

  const daysSinceSubmission = Math.floor(
    (new Date().getTime() - new Date(complaint.date).getTime()) / (1000 * 60 * 60 * 24)
  );

  const getMessageStyles = () => {
    const base = "my-4 p-4 rounded-lg border text-center font-medium animate-fade-in";
    switch (message.type) {
      case "success": return `${base} bg-green-50 text-green-800 border-green-200`;
      case "error": return `${base} bg-red-50 text-red-800 border-red-200`;
      default: return `${base} bg-blue-50 text-blue-800 border-blue-200`;
    }
  };

  const isImage = complaint.mediaUrl?.includes("image") || /\.(jpg|jpeg|png|gif|webp)$/i.test(complaint.mediaUrl);
  const isVideo = complaint.mediaUrl?.includes("video") || /\.(mp4|mov|avi|webm)$/i.test(complaint.mediaUrl);

  return (
    <main className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden transform transition-all duration-300 animate-scale-in">
        {/* Header */}
        <div className="bg-linear-to-r from-purple-600 to-indigo-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <FiFileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{t("complaint_details.title")}</h2>
                <p className="text-purple-100 text-sm flex items-center space-x-1">
                  <FiInfo className="w-3 h-3" />
                  <span>{t("complaint_details.subtitle")}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-white/10 cursor-pointer"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-180px)]">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* Left Column - Basic Info */}
            <div className="xl:col-span-3 space-y-6">
              {/* Title Card */}
              <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiFileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{t("complaint_details.complaint_title")}</h3>
                    <p className="text-gray-600 text-sm">{t("complaint_details.main_description")}</p>
                  </div>
                </div>
                <p className="text-gray-800 text-base leading-relaxed bg-white rounded-lg p-4 border border-gray-200">
                  {complaint.title}
                </p>
              </div>

              {/* Description Card */}
              <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <FiAlertCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{t("complaint_details.detailed_description")}</h3>
                    <p className="text-gray-600 text-sm">{t("complaint_details.full_details")}</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {complaint.description}
                  </p>
                </div>
              </div>

              {/* Media Section */}
         {complaint.mediaUrl && (
  <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
    <div className="flex items-center justify-between mb-4">
      <div className="sm:flex items-center space-x-3 hidden">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          {isImage ? (
            <FaImage className="w-5 h-5 text-purple-600" />
          ) : (
            <FaVideo className="w-5 h-5 text-purple-600" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">
            {t("complaint_details.attached_media")}
          </h3>
          <p className="text-gray-600 text-sm">
            {isImage ? t("form.image") : t("form.video")}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-lg hover:cursor-pointer"
        >
          <FaDownload className="text-sm" />
          <span className="text-sm">{t("form.download")}</span>
        </button>
        
        {/* Delete Button */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:cursor-pointer"
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
    </div>

    {message.text && (
      <div className={getMessageStyles()}>
        <div className="flex items-center justify-center space-x-2">
          {message.type === "success" && (
            <FiCheckCircle className="w-5 h-5 text-green-600" />
          )}
          {message.type === "error" && (
            <FiAlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
        {message.type === "success" && countdown > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            Closing in {countdown} second{countdown !== 1 ? 's' : ''}...
          </div>
        )}
      </div>
    )}

    <div className="bg-white rounded-xl p-4 border-2 border-dashed border-gray-200">
      {isImage ? (
        <div className="relative group">
          <img
            src={complaint.mediaUrl}
            alt="Complaint attachment"
            className="w-full rounded-lg shadow-sm max-h-96 object-contain bg-gray-50"
          />
          <div className="absolute inset-0 bg-black/50 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <FaImage className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <video
            src={complaint.mediaUrl}
            controls
            className="w-full rounded-lg shadow-sm max-h-96 bg-black"
          />
          <div className="absolute top-4 right-4 bg-black/50 rounded-full p-2">
            <FaVideo className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
    </div>
  </div>
)}
            </div>

            {/* Right Column - Metadata */}
            <div className="space-y-6 xl:col-span-2">
              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <FiTag className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("complaint_details.status")}</span>
                  </div>
                  <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                    {statusConfig.icon}
                    <span className="font-semibold">{statusConfig.label}</span>
                  </div>
                </div>

                <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <FiTrendingUp className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("complaint_details.priority")}</span>
                  </div>
                  <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium border ${levelConfig.color}`}>
                    {levelConfig.icon}
                    <span className="font-semibold">{levelConfig.label}</span>
                  </div>
                </div>
              </div>

              {/* Department Information */}
              <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <TbBuilding className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t("complaint_details.department")}</h3>
                    <p className="text-gray-600 text-sm">{t("complaint_details.assigned_department")}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-sm font-medium text-gray-500 mb-1">{t("complaint_details.main_department")}</p>
                    <p className="text-gray-800 font-semibold">{departments[complaint.department as DepartmentKey]?.[lang] || complaint.department}</p>
                  </div>
                  {complaint.subDepartment && (
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-sm font-medium text-gray-500 mb-1">{t("complaint_details.sub_department")}</p>
                      <p className="text-gray-800 font-semibold flex items-center space-x-1">
                        <TbBuildingSkyscraper className="w-3 h-3" />
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

              {/* Additional Information */}
              <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <FiInfo className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t("complaint_details.additional_info")}</h3>
                    <p className="text-gray-600 text-sm">{t("complaint_details.tracking_info")}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-sm font-medium text-gray-500 mb-1">{t("complaint_details.complaint_id")}</p>
                    <p className="text-gray-800 font-mono text-sm bg-gray-50 px-2 py-1 rounded">
                      {complaint._id?.slice(-8) || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-sm font-medium text-gray-500 mb-1">{t("complaint_details.days_active")}</p>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        daysSinceSubmission < 3 ? 'bg-green-500' :
                        daysSinceSubmission < 7 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <p className="text-gray-800 font-semibold">
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

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </main>
  );
}