import { FiTrash2, FiX, FiAlertTriangle, FiShield } from 'react-icons/fi';
import { useTranslation } from "react-i18next";
import { departments, DepartmentKey } from "@/data/departments";

interface DeleteModalProps {
  complaint: any;
  onClose: () => void;
  onDelete: () => void;
}

function DeleteModal({ complaint, onClose, onDelete }: DeleteModalProps) {
    const { t, i18n } = useTranslation();
  const lang = i18n.language as "en" | "am" | "om";

  const deleteComplaint = async () => {
    if (!complaint) return;
    
    try {
      await fetch(`/api/complaints/update?id=${complaint._id}`, { 
        method: "DELETE" 
      });
      onDelete();
      onClose();
    } catch (error) {
      console.error("Error deleting complaint:", error);
    }
  };

  return (
    <section className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-100 animate-fade-in">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-500 animate-scale-in border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
              <FiTrash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">{t('delete_complaint.title')}</h2>
              <p className="text-gray-500 text-sm">{t('delete_complaint.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-110 hover:cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Complaint Preview */}
          <div className="bg-linear-to-br from-gray-50 to-white rounded-2xl p-4 mb-6 border-2 border-gray-100 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <FiAlertTriangle className="w-4 h-4 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {complaint.title}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {departments[complaint.department as DepartmentKey]?.[lang] || complaint.department}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    complaint.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    complaint.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {t(`status.${complaint.status}`)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-linear-to-r from-red-50 to-rose-50 rounded-2xl p-5 mb-6 border-2 border-red-200 shadow-lg">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                <FiShield className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-red-800 font-bold text-lg mb-1">
                  {t('delete_complaint.warning_title')}
                </p>
                <p className="text-red-700 text-sm leading-relaxed">
                  {t('delete_complaint.irreversible_note')} "<span className="font-semibold">{complaint.title}</span>"{' '}
                  {t('delete_complaint.warning_message')}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="group flex-1 bg-linear-to-r from-gray-100 to-gray-200 text-gray-700 py-4 px-6 rounded-2xl font-bold hover:from-gray-200 hover:to-gray-300 transition-all duration-500 hover:scale-105 hover:shadow-lg overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-white/30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="relative z-10">{t('delete_complaint.cancel')}</span>
            </button>
            
            <button
              onClick={deleteComplaint}
              className="group flex-1 bg-linear-to-r from-red-500 to-rose-600 text-white py-4 px-6 rounded-2xl font-bold hover:from-red-600 hover:to-rose-700 focus:ring-4 focus:ring-red-200 transition-all duration-500 hover:scale-105 hover:shadow-lg overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-white/30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="relative z-10 flex items-center justify-center space-x-2">
                <FiTrash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{t('delete_complaint.delete')}</span>
              </div>
            </button>
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
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </section>
  );
}

export default DeleteModal;