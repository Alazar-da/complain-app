'use client';
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiEdit, FiX, FiClock, FiCheckCircle, FiPlayCircle, FiPauseCircle, FiMessageSquare, FiSave } from "react-icons/fi";

interface EditModalProps {
  complaint: any;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditModal({ complaint, onClose, onUpdated }: EditModalProps) {
  const [status, setStatus] = useState(complaint.status);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const updateStatus = async () => {
    if ((status === 'Completed' || status === 'Canceled') && !reason.trim()) {
      alert(t('update_status.reason_required'));
      return;
    }

    setLoading(true);
    try {
      const updateData: any = { status };
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
      name: t('update_status.status_options.canceled.name'),
      label: t('update_status.status_options.canceled.label'),
      description: t('update_status.status_options.canceled.description'),
      icon: FiPauseCircle,
      color: 'red'
    }
  ];

  const getStatusColor = (color: string) => {
    const colors = {
      yellow: "border-yellow-400 bg-yellow-50 text-yellow-700",
      blue: "border-blue-400 bg-blue-50 text-blue-700", 
      green: "border-green-400 bg-green-50 text-green-700",
      red: "border-red-400 bg-red-50 text-red-700",
    };
    return colors[color as keyof typeof colors] || "border-gray-400 bg-gray-50 text-gray-700";
  };

  const selectedStatus = statusOptions.find(opt => opt.name === status);
  const requiresReason = status === 'Completed' || status === 'Canceled';

  return (
    <section className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-60 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiEdit className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{t('update_status.title')}</h2>
              <p className="text-gray-500 text-sm">{t('update_status.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[65vh]">
          {/* Complaint Preview */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start space-x-2">
              <FiMessageSquare className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {complaint.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {complaint.department}
                </p>
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              {t('update_status.select_status')}
            </label>
            
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = status === option.name;
                
                return (
                  <button
                    key={option.name}
                    onClick={() => setStatus(option.name)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium flex flex-col items-center space-y-1 hover:cursor-pointer ${
                      isSelected
                        ? `${getStatusColor(option.color)} border-current`
                        : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{option.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Status Info */}
            {selectedStatus && (
              <div className={`p-3 rounded-lg border ${getStatusColor(selectedStatus.color)}`}>
                <div className="flex items-center space-x-2">
                  <selectedStatus.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{selectedStatus.label}</span>
                </div>
                <p className="text-xs mt-1 opacity-80">
                  {selectedStatus.description}
                </p>
              </div>
            )}

            {/* Reason Input */}
            {requiresReason && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {status === 'Completed' 
                    ? t('update_status.completion_reason') 
                    : t('update_status.cancellation_reason')} *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    status === 'Completed'
                      ? t('update_status.completion_placeholder')
                      : t('update_status.cancellation_placeholder')
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200"
                />
                <p className="text-xs text-gray-500">
                  {t('update_status.reason_help')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 px-4 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 hover:cursor-pointer"
          >
            {t('update_status.cancel')}
          </button>
          <button
            onClick={updateStatus}
            disabled={loading || (status === complaint.status && !reason) || (requiresReason && !reason.trim())}
            className="flex-1 py-2.5 px-4 text-white bg-blue-600 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 hover:cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t('update_status.saving')}</span>
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                <span>{t('update_status.update')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
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