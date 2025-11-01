'use client';

import { FiX, FiFileText, FiCalendar, FiClock, FiTag, FiAlertCircle, FiCheckCircle, FiPlayCircle, FiPauseCircle, FiTrendingUp, FiTrendingDown, FiMinus, FiInfo } from 'react-icons/fi';
import { TbBuilding, TbBuildingSkyscraper } from 'react-icons/tb';
import { useTranslation } from "react-i18next";
import { departments } from "@/data/departments";

interface ViewModalProps {
  complaint: any;
  onClose: () => void;
}

export default function ViewModal({ complaint, onClose }: ViewModalProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "en" | "am" | "om";

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Pending":
        return {
          color: "text-yellow-600 bg-yellow-50 border-yellow-200",
          icon: <FiClock className="w-4 h-4" />
        };
      case "Completed":
        return {
          color: "text-green-600 bg-green-50 border-green-200",
          icon: <FiCheckCircle className="w-4 h-4" />
        };
      case "In Progress":
        return {
          color: "text-blue-600 bg-blue-50 border-blue-200",
          icon: <FiPlayCircle className="w-4 h-4" />
        };
      case "Canceled":
        return {
          color: "text-red-600 bg-red-50 border-red-200",
          icon: <FiPauseCircle className="w-4 h-4" />
        };
      default:
        return {
          color: "text-gray-600 bg-gray-50 border-gray-200",
          icon: <FiInfo className="w-4 h-4" />,
          label: status
        };
    }
  };

  const getLevelConfig = (level: string) => {
    switch (level) {
      case "High":
        return {
          color: "text-red-600 bg-red-50 border-red-200",
          icon: <FiTrendingUp className="w-4 h-4" />,
        };
      case "Medium":
        return {
          color: "text-orange-600 bg-orange-50 border-orange-200",
          icon: <FiMinus className="w-4 h-4" />,
        };
      case "Low":
        return {
          color: "text-green-600 bg-green-50 border-green-200",
          icon: <FiTrendingDown className="w-4 h-4" />,
        };
      default:
        return {
          color: "text-gray-600 bg-gray-50 border-gray-200",
          icon: <FiInfo className="w-4 h-4" />,
          label: level
        };
    }
  };

  const statusConfig = getStatusConfig(complaint.status);
  const levelConfig = getLevelConfig(complaint.level);

  const daysSinceSubmission = Math.floor(
    (new Date().getTime() - new Date(complaint.date).getTime()) / (1000 * 60 * 60 * 24)
  );

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
                    <span className="font-semibold">{t(`status.${complaint.status}`)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{statusConfig.label}</p>
                </div>

                <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <FiTrendingUp className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t("complaint_details.priority")}</span>
                  </div>
                  <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium border ${levelConfig.color}`}>
                    {levelConfig.icon}
                    <span className="font-semibold">{t(`level.${complaint.level}`)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{levelConfig.label}</p>
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
                    <p className="text-gray-800 font-semibold">{departments[complaint.department]?.[lang] || complaint.department}</p>
                  </div>
                  {complaint.subDepartment && (
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-sm font-medium text-gray-500 mb-1">{t("complaint_details.sub_department")}</p>
                      <p className="text-gray-800 font-semibold flex items-center space-x-1">
                        <TbBuildingSkyscraper className="w-3 h-3" />
                        <span>{
                          departments[complaint.department]?.subDepartments.find(
                            (sub:any) =>
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
    </main>
  );
}

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
