'use client';
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  FiEdit, 
  FiX, 
  FiClock, 
  FiCheckCircle, 
  FiPlayCircle, 
  FiCheck, 
  FiAlertCircle, 
  FiSave, 
  FiUser, 
  FiMessageSquare,
  FiShield,
  FiArrowRight,
  FiInfo
} from "react-icons/fi";
import { departments, DepartmentKey } from "@/data/departments";
import { FaStar, FaPaperPlane } from "react-icons/fa";

interface EditModalProps {
  complaint: any;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditModal({ complaint, onClose, onUpdated }: EditModalProps) {
  const [status, setStatus] = useState(complaint.status);
  const [responsiblePerson, setResponsiblePerson] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "en" | "am" | "om";

  const updateStatus = async () => {
    if ((status === 'Completed' || status === 'Inappropriate') && !reason.trim()) {
      alert(t('update_status.reason_required'));
      return;
    }

    if ((status === 'Completed' || status === 'Inappropriate') && !responsiblePerson.trim()) {
      alert(t('update_status.responsible_person_required'));
      return;
    }

    setLoading(true);
    try {
      const updateData: any = { status };
      if (responsiblePerson.trim()) {
        updateData.responsiblePerson = responsiblePerson.trim();
      }
      if (reason.trim()) {
        updateData.reason = reason.trim();
      }

      await fetch(`/api/complaints/update?id=${complaint._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      onUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    {
      name: t('update_status.status_options.pending.name'),
      label: t('update_status.status_options.pending.label'),
      description: t('update_status.status_options.pending.description'),
      icon: FiClock,
      color: 'yellow'
    },
    {
      name: t('update_status.status_options.appropriate.name'),
      label: t('update_status.status_options.appropriate.label'),
      description: t('update_status.status_options.appropriate.description'),
      icon: FiCheck,
      color: 'green'
    },
    {
      name: t('update_status.status_options.in_progress.name'),
      label: t('update_status.status_options.in_progress.label'),
      description: t('update_status.status_options.in_progress.description'),
      icon: FiPlayCircle,
      color: 'blue'
    },
    {
      name: t('update_status.status_options.completed.name'),
      label: t('update_status.status_options.completed.label'),
      description: t('update_status.status_options.completed.description'),
      icon: FiCheckCircle,
      color: 'green'
    },
    {
      name: t('update_status.status_options.inappropriate.name'),
      label: t('update_status.status_options.inappropriate.label'),
      description: t('update_status.status_options.inappropriate.description'),
      icon: FiAlertCircle,
      color: 'red'
    }
  ];

  const getStatusColor = (color: string) => {
    const colors = {
      yellow: "border-yellow-300 bg-yellow-50 text-yellow-800",
      blue: "border-blue-300 bg-blue-50 text-blue-800", 
      green: "border-green-300 bg-green-50 text-green-800",
      red: "border-red-300 bg-red-50 text-red-800",
    };
    return colors[color as keyof typeof colors] || "border-gray-300 bg-gray-50 text-gray-800";
  };

  const selectedStatus = statusOptions.find(opt => opt.name === status);
  const requiresFinalization = status === 'Completed' || status === 'Inappropriate';

  // Status flow validation
  const getAvailableStatuses = () => {
    const currentStatus = complaint.status;
    
    if (currentStatus === 'Pending') {
      return statusOptions.filter(opt => 
        opt.name === 'Pending' || opt.name === 'Appropriate' || opt.name === 'Inappropriate'
      );
    } else if (currentStatus === 'Appropriate') {
      return statusOptions.filter(opt => 
        opt.name === 'Appropriate' || opt.name === 'In Progress' || opt.name === 'Inappropriate'
      );
    } else if (currentStatus === 'In Progress') {
      return statusOptions.filter(opt => 
        opt.name === 'In Progress' || opt.name === 'Completed' || opt.name === 'Inappropriate'
      );
    } else if (currentStatus === 'Completed' || currentStatus === 'Inappropriate') {
      return statusOptions.filter(opt => opt.name === currentStatus);
    }
    
    return statusOptions;
  };

  const availableStatuses = getAvailableStatuses();

  return (
    <section className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-100 animate-fade-in">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-lg w-full transform transition-all duration-500 animate-scale-in border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <FiEdit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">{t('update_status.title')}</h2>
              <p className="text-gray-500 text-sm">{t('update_status.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            onMouseEnter={() => setIsHovered('close')}
            onMouseLeave={() => setIsHovered(null)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-110 hover:cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[65vh]">
          {/* Complaint Preview */}
          <div className="bg-linear-to-br from-gray-50 to-white rounded-2xl p-4 border-2 border-gray-100 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <FiMessageSquare className="w-4 h-4 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {complaint.title}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {departments[complaint.department as DepartmentKey]?.[lang] || complaint.department}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded-lg">
                    {t('update_status.current')}: {t(`status.${complaint.status}`)}
                  </div>
                  {complaint.trackingNumber && (
                    <div className="text-xs font-mono text-slate-500 bg-amber-100 px-2 py-1 rounded-lg">
                      {complaint.trackingNumber}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-4">
            <label className="flex items-center text-sm font-bold text-gray-700">
              <FiShield className="mr-2 text-gray-400" />
              {t('update_status.select_status')}
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              {availableStatuses.map((option) => {
                const Icon = option.icon;
                const isSelected = status === option.name;
                const isCurrentStatus = complaint.status === option.name;
                
                return (
                  <button
                    key={option.name}
                    onClick={() => setStatus(option.name)}
                    onMouseEnter={() => setIsHovered(option.name)}
                    onMouseLeave={() => setIsHovered(null)}
                    className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 text-sm font-bold flex flex-col items-center space-y-2 hover:cursor-pointer overflow-hidden ${
                      isSelected
                        ? `${getStatusColor(option.color)} border-current shadow-lg`
                        : isCurrentStatus
                        ? "border-gray-300 bg-gray-100 text-gray-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md"
                    } ${isCurrentStatus ? 'cursor-default' : 'cursor-pointer'} transform hover:scale-105`}
                    disabled={isCurrentStatus}
                  >
                    {!isCurrentStatus && (
                      <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 opacity-0 group-hover:opacity-100"></div>
                    )}
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-current' : ''} relative z-10`} />
                    <span className="relative z-10 text-xs">{option.label}</span>
                    {isCurrentStatus && (
                      <span className="text-xs text-gray-500 mt-1">({t('update_status.current')})</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Status Flow Info */}
            <div className="bg-linear-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 border-2 border-blue-200 overflow-x-auto">
              <div className="flex items-start space-x-3">
                <FiInfo className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-1">{t('update_status.status_flow_guide')}</p>
                  <div className="flex items-center space-x-2 text-xs text-blue-700">
                    <span className="px-2 py-1 bg-white rounded-lg border border-blue-200">{t('status.Pending')}</span>
                    <FiArrowRight className="text-blue-400" />
                    <span className="px-2 py-1 bg-white rounded-lg border border-blue-200">{t('status.Appropriate')}</span>
                    <FiArrowRight className="text-blue-400" />
                    <span className="px-2 py-1 bg-white rounded-lg border border-blue-200">{t('status.In Progress')}</span>
                    <FiArrowRight className="text-blue-400" />
                    <span className="px-2 py-1 bg-white rounded-lg border border-blue-200">{t('status.Completed')}</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    {t('update_status.can_be_inappropriate')}
                  </p>
                </div>
              </div>
            </div>

            {/* Selected Status Info */}
            {selectedStatus && (
              <div className={`rounded-2xl p-4 border-2 shadow-sm ${getStatusColor(selectedStatus.color)}`}>
                <div className="flex items-center space-x-3">
                  <selectedStatus.icon className="w-5 h-5" />
                  <span className="text-sm font-bold">{selectedStatus.label}</span>
                </div>
                <p className="text-xs text-current opacity-90 mt-2">
                  {selectedStatus.description}
                </p>
              </div>
            )}

            {/* Responsible Person Input */}
            {requiresFinalization && (
              <div className="space-y-3">
                <label className="flex items-center text-sm font-bold text-gray-700">
                  <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <FiUser className="w-4 h-4 text-white" />
                  </div>
                  {t('update_status.responsible_person')} *
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={responsiblePerson}
                    onChange={(e) => setResponsiblePerson(e.target.value)}
                    placeholder={t('update_status.responsible_person_placeholder')}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm shadow-inner group-hover:border-blue-300"
                  />
                  <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <div className="absolute inset-0 rounded-xl bg-linear-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                <p className="text-xs text-gray-500">
                  {t('update_status.responsible_person_help')}
                </p>
              </div>
            )}

            {/* Reason Input */}
            {requiresFinalization && (
              <div className="space-y-3">
                <label className="flex items-center text-sm font-bold text-gray-700">
                  <div className="w-8 h-8 bg-linear-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                    <FiMessageSquare className="w-4 h-4 text-white" />
                  </div>
                  {status === 'Completed' 
                    ? t('update_status.completion_reason') 
                    : t('update_status.inappropriate_reason')} *
                </label>
                <div className="relative group">
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={
                      status === 'Completed'
                        ? t('update_status.completion_placeholder')
                        : t('update_status.inappropriate_placeholder')
                    }
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 resize-none transition-all duration-300 bg-white/50 backdrop-blur-sm shadow-inner group-hover:border-blue-300"
                  />
                  <div className="absolute inset-0 rounded-xl bg-linear-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                <p className="text-xs text-gray-500">
                  {t('update_status.reason_help')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-4 p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl">
          <button
            onClick={onClose}
            disabled={loading}
            onMouseEnter={() => setIsHovered('cancel')}
            onMouseLeave={() => setIsHovered(null)}
            className="group flex-1 bg-linear-to-r from-gray-100 to-gray-200 text-gray-700 py-4 px-6 rounded-2xl font-bold hover:from-gray-200 hover:to-gray-300 transition-all duration-500 hover:scale-105 hover:shadow-lg overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-white/30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <span className="relative z-10">{t('update_status.cancel')}</span>
          </button>
          
          <button
            onClick={updateStatus}
            disabled={loading || 
              (status === complaint.status && !reason && !responsiblePerson) || 
              (requiresFinalization && (!reason.trim() || !responsiblePerson.trim()))
            }
            onMouseEnter={() => setIsHovered('update')}
            onMouseLeave={() => setIsHovered(null)}
            className="group flex-1 bg-linear-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-bold hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 hover:scale-105 hover:shadow-lg overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-white/30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <div className="relative z-10 flex items-center justify-center space-x-2">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('update_status.saving')}</span>
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>{t('update_status.update')}</span>
                </>
              )}
            </div>
          </button>
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