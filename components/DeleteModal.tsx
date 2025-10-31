import React from 'react'
import { FiTrash2 } from 'react-icons/fi';

interface DeleteModalProps {
  complaint: any;
  onClose: () => void;
  onDelete: () => void;
}
function DeleteModal({ complaint, onClose,onDelete }: DeleteModalProps) {
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
     <section className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 animate-scale-in">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                  <FiTrash2 className="w-6 h-6 text-red-600" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                  Delete Complaint
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  Are you sure you want to delete the complaint "<span className="font-semibold">{complaint.title}</span>"? This action cannot be undone.
                </p>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <FiTrash2 className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-red-800 font-medium">Warning</p>
                      <p className="text-xs text-red-700 mt-1">
                        This will permanently remove the complaint and all associated data.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 border border-gray-300 hover:cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteComplaint}
                    className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 border border-red-600 hover:cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </section>
  )
}

export default DeleteModal