'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiFilter, FiEdit, FiTrash2, FiEye, FiLogOut, FiUser, FiCalendar, FiLock, FiClock, FiArrowRight } from "react-icons/fi";
import { TbLayoutGrid, TbLayoutList } from "react-icons/tb";
import EditModal from "@/components/EditModal";
import ViewModal from "@/components/ViewModal";
import DeleteModal from "@/components/DeleteModal";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { departments, DepartmentKey } from "@/data/departments";

interface Complaint {
  _id: string;
  title: string;
  department: string;
  subDepartment: string;
  level: string;
  description: string;
  status: string;
  date: string;
}

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // complaints per page
const { t } = useTranslation();
const { i18n } = useTranslation();
const lang = i18n.language as "en" | "am" | "om";

useEffect(() => {
  // Function to update view mode based on screen width
  const handleResize = () => {
    if (window.innerWidth < 1024) {
      // md and sm devices
      setViewMode('card');
    } else {
      // large screens
      setViewMode('table');
    }
  };

  handleResize(); // Run once on load
  window.addEventListener('resize', handleResize);

  return () => window.removeEventListener('resize', handleResize);
}, []);

 const fetchComplaints = async (pageNumber = 1) => {
    const res = await fetch(
      `/api/complaints?page=${pageNumber}&limit=${limit}&search=${encodeURIComponent(
        searchTerm
      )}&status=${statusFilter}`
    );
    const data = await res.json();
    setComplaints(data.data);
    setTotalPages(data.totalPages);
    setPage(data.page);
    setLoading(false)
  };

  useEffect(() => {
    fetchComplaints(1); // always fetch first page when filters change
  }, [searchTerm, statusFilter]);

  const openEditModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowEditModal(true);
  };

  const openViewModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowViewModal(true);
  };

    const openDeleteModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowDeleteModal(true);
  };

  const getLevelBadge = (level: string) => {
    const baseStyles = "px-2 py-1 rounded-full text-xs font-semibold";
    
    switch (level) {
      case "High":
        return `${baseStyles} bg-red-100 text-red-800`;
      case "Medium":
        return `${baseStyles} bg-orange-100 text-orange-800`;
      case "Low":
        return `${baseStyles} bg-green-100 text-green-800`;
      default:
        return `${baseStyles} bg-gray-100 text-gray-800`;
    }
  };

const getStatusBadge = (status: string) => {
  const baseStyles = "px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 w-fit";
  
  switch (status) {
    case "Pending":
      return `${baseStyles} bg-yellow-100 text-yellow-800 border border-yellow-200`;
    case "Appropriate":
      return `${baseStyles} bg-green-100 text-green-800 border border-green-200`;
    case "In Progress":
      return `${baseStyles} bg-blue-100 text-blue-800 border border-blue-200`;
    case "Completed":
      return `${baseStyles} bg-green-100 text-green-800 border border-green-200`;
    case "Inappropriate":
      return `${baseStyles} bg-red-100 text-red-800 border border-red-200`;
    default:
      return `${baseStyles} bg-gray-100 text-gray-800 border border-gray-200`;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Pending":
      return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
    case "Appropriate":
      return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
    case "In Progress":
      return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
    case "Completed":
      return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
    case "Inappropriate":
      return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
    default:
      return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
  }
};

    const handlePrev = () => {
    if (page > 1) fetchComplaints(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) fetchComplaints(page + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-slate-800">
      {/* Header */}
      <header className="lg:bg-white bg-slate-900 lg:text-slate-800 text-white shadow-sm border-b border-gray-200 w-full fixed top-0 z-50 pt-8 lg:pt-0 lg:static">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start h-16">
              <div className="shrink-0 lg:block hidden">
                <div className="w-8 h-8 bg-linear-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <FiUser className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="lg:ml-3 ml-15">
                <h1 className="text-xl font-bold lg:text-gray-900">{t('admin_dashboard.title')}</h1>
              </div>
          </div>
        </div>
      </header>

      <section className="relative p-4 py-6 sm:p-6 lg:px-8 lg:py-10 mt-20 lg:mt-0">
              <section className="fixed lg:top-3.5 top-12 right-5 z-50">
              <LanguageSwitcher/>
            </section>
        {/* Stats and Controls */}
        <div className="mb-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="sm:text-2xl text-lg font-bold text-gray-900">{t('admin_dashboard.complaint_management')}</h2>
              <p className="text-gray-600 mt-1 sm:text-md text-sm">{t('admin_dashboard.manage_and_track')}</p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'table' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <TbLayoutList className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'card' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <TbLayoutGrid className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {t('admin_dashboard.total')} {complaints.length}
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('admin_dashboard.search_placeholder') || ''}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FiSearch className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
            <div className="sm:w-48">
              <div className="relative">
                <select
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white appearance-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">{t('admin_dashboard.all_status')}</option>
                  <option value="Pending">{t('admin_dashboard.pending')}</option>
                  <option value="In Progress">{t('admin_dashboard.in_progress')}</option>
                  <option value="Completed">{t('admin_dashboard.completed')}</option>
                  <option value="Canceled">{t('admin_dashboard.canceled')}</option>
                </select>
                <FiFilter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'table' ? (
          /* Table View */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t('admin_dashboard.complaint')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t('admin_dashboard.department')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t('admin_dashboard.priority')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t('admin_dashboard.status')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t('admin_dashboard.date')}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t('admin_dashboard.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {complaints.map((complaint) => (
                    <tr key={complaint._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{complaint.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-2 mt-1">
                            {complaint.description.substring(0, 60)}...
                          </div>
                        </div>
                      </td>
                     <td className="px-6 py-4">
  {/* Department */}
  <div className="text-sm text-gray-900">
  {departments[complaint.department as DepartmentKey]?.[lang] || complaint.department}
</div>


  {/* Sub-department */}
  {complaint.subDepartment && (
    <div className="text-xs text-gray-500 mt-1">
      {
        departments[complaint.department as DepartmentKey]?.subDepartments.find(
          (sub:any) =>
            sub.en === complaint.subDepartment || // if you store the English label
            sub.am === complaint.subDepartment || // or Amharic
            sub.om === complaint.subDepartment    // or Oromo
        )?.[lang] || complaint.subDepartment
      }
    </div>
  )}
</td>

                      <td className="px-6 py-4">
                        <span className={getLevelBadge(complaint.level)}>
                          {t(`level.${complaint.level}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadge(complaint.status)}>
                          {getStatusIcon(complaint.status)}
                          <span>{t(`status.${complaint.status}`)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(complaint.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openViewModal(complaint)}
                            className="inline-flex items-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 hover:cursor-pointer"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(complaint)}
                            className="inline-flex items-center p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 hover:cursor-pointer"
                            title="Edit Status"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(complaint)}
                            className="inline-flex items-center p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 hover:cursor-pointer"
                            title="Delete Complaint"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {complaints.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiSearch className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">No complaints found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm || statusFilter !== "All" ? "Try adjusting your search or filters" : "No complaints have been submitted yet"}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complaints.map((complaint) => (
              <div key={complaint._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{complaint.title}</h3>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className={getLevelBadge(complaint.level)}>
                        {t(`level.${complaint.level}`)}
                      </span>
                      <span className={getStatusBadge(complaint.status)}>
                        {getStatusIcon(complaint.status)}
                        <span>{t(`status.${complaint.status}`)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {complaint.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <FiUser className="w-4 h-4 mr-2" />
                    <span>{complaint.department}</span>
                  </div>
                  {complaint.subDepartment && (
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="ml-6">{complaint.subDepartment}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-500">
                    <FiCalendar className="w-4 h-4 mr-2" />
                    <span>
                      {new Date(complaint.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button
                    onClick={() => openViewModal(complaint)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm font-medium hover:cursor-pointer"
                  >
                    <FiEye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(complaint)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 hover:cursor-pointer"
                      title="Edit Status"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(complaint)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 hover:cursor-pointer"
                      title="Delete Complaint"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {complaints.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiSearch className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">No complaints found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm || statusFilter !== "All" ? "Try adjusting your search or filters" : "No complaints have been submitted yet"}
                </p>
              </div>
            )}
          </div>
        )}


        {/* Compact Pagination */}
<div className="flex items-center justify-center space-x-4 mt-5">
  <button
    onClick={handlePrev}
    disabled={page === 1}
    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
    <span>{t("pagination.prev")}</span>
  </button>

  <div className="flex items-center space-x-2 text-sm">
    <span className="text-gray-600">{t("pagination.page")}</span>
    <span className="font-semibold text-blue-600">{page}</span>
    <span className="text-gray-600">of</span>
    <span className="font-semibold text-gray-900">{totalPages}</span>
  </div>

  <button
    onClick={handleNext}
    disabled={page === totalPages}
    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
  >
    <span>{t("pagination.next")}</span>
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </button>
</div>

        {/* Modals */}
        {showEditModal && selectedComplaint && (
          <EditModal
            complaint={selectedComplaint}
            onClose={() => setShowEditModal(false)}
            onUpdated={fetchComplaints}
          />
        )}

        {showViewModal && selectedComplaint && (
          <ViewModal
            complaint={selectedComplaint}
            onClose={() => setShowViewModal(false)}
          />
        )}

        {showDeleteModal && selectedComplaint && (
         <DeleteModal
            complaint={selectedComplaint}
            onClose={() => setShowDeleteModal(false)}
             onDelete={fetchComplaints}
          />
        )}
      </section>

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
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </main>
  );
}