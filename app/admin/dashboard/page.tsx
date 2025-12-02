'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  FiSearch, 
  FiFilter, 
  FiEdit, 
  FiTrash2, 
  FiEye, 
  FiLogOut, 
  FiUser, 
  FiCalendar, 
  FiLock, 
  FiClock, 
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiFileText,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle,
  FiPlayCircle,
  FiUserCheck,
  FiXCircle
} from "react-icons/fi";
import { TbLayoutGrid, TbLayoutList } from "react-icons/tb";
import EditModal from "@/components/EditModal";
import ViewModal from "@/components/ViewModal";
import DeleteModal from "@/components/DeleteModal";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { departments, DepartmentKey } from "@/data/departments";
import { FaStar, FaPaperPlane, FaAward } from "react-icons/fa";

interface Complaint {
  _id: string;
  title: string;
  department: string;
  subDepartment: string;
  level: string;
  description: string;
  status: string;
  date: string;
  trackingNumber?: string;
  responsiblePerson?: string;
  reason?: string;
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
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const limit = 10;
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const lang = i18n.language as "en" | "am" | "om";

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setViewMode('card');
      } else {
        setViewMode('table');
      }
    };

    handleResize();
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
    fetchComplaints(1);
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
    const baseStyles = "px-3 py-1.5 rounded-full text-xs font-bold border-2";
    
    switch (level) {
      case "High":
        return `${baseStyles} bg-red-50 text-red-700 border-red-200`;
      case "Medium":
        return `${baseStyles} bg-yellow-50 text-yellow-700 border-yellow-200`;
      case "Low":
        return `${baseStyles} bg-green-50 text-green-700 border-green-200`;
      default:
        return `${baseStyles} bg-gray-50 text-gray-700 border-gray-200`;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseStyles = "px-4 py-2 rounded-xl text-sm font-bold flex items-center space-x-2 w-fit border-2";
    
    switch (status) {
      case "Pending":
        return `${baseStyles} bg-yellow-50 text-yellow-700 border-yellow-200`;
      case "Appropriate":
        return `${baseStyles} bg-teal-50 text-teal-700 border-teal-200`;
      case "In Progress":
        return `${baseStyles} bg-blue-50 text-blue-700 border-blue-200`;
      case "Completed":
        return `${baseStyles} bg-green-50 text-green-700 border-green-200`;
      case "Inappropriate":
        return `${baseStyles} bg-red-50 text-red-700 border-red-200`;
      default:
        return `${baseStyles} bg-gray-50 text-gray-700 border-gray-200`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <FiClock className="w-4 h-4" />;
      case "Appropriate":
        return <FiUserCheck className="w-4 h-4" />;
      case "In Progress":
        return <FiPlayCircle className="w-4 h-4" />;
      case "Completed":
        return <FiCheckCircle className="w-4 h-4" />;
      case "Inappropriate":
        return <FiXCircle className="w-4 h-4" />;
      default:
        return <FiAlertCircle className="w-4 h-4" />;
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
      <main className="relative min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-100 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative flex flex-col items-center space-y-6">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-800 mb-2">Loading complaints...</p>
            <p className="text-gray-600">Please wait while we fetch the data</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-100 text-slate-800 overflow-hidden">
      
              {/* Header */}
      <header className="lg:bg-white bg-slate-900 lg:text-slate-800 text-white shadow-sm border-b border-gray-200 w-full fixed top-0 z-30 pt-8 lg:pt-0">
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
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Language Switcher */}
      <section className="fixed lg:top-3.5 top-12 right-5 z-30">
        <LanguageSwitcher />
      </section>

      <section className="relative z-10 max-w-7xl mx-auto p-4 py-8 sm:p-6 lg:px-8 lg:py-10 mt-20 lg:mt-10">
        {/* Enhanced Header */}
        <div className="flex flex-col justify-start mb-12">
          <h2 className="sm:text-2xl text-lg font-bold text-gray-900">    {t('admin_dashboard.title')}
          </h2>
         <p className="text-gray-600 mt-1 sm:text-md text-sm">
            {t('admin_dashboard.manage_and_track')}
          </p>
        </div>

        {/* Enhanced Filters and Search */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 mb-8 border border-white/20">
          <div className="flex justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl sm:flex items-center justify-center shadow-lg hidden">
                <FiFilter className="text-white text-sm" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{t('admin_dashboard.filters_and_search')}</h2>
                <p className="text-gray-500 text-sm">{t('admin_dashboard.find_and_manage')}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'table' 
                      ? 'bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <TbLayoutList className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'card' 
                      ? 'bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <TbLayoutGrid className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <input
                type="text"
                placeholder={t('admin_dashboard.search_placeholder') || ''}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm shadow-inner text-lg group-hover:border-blue-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FiSearch className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <div className="absolute inset-0 rounded-xl bg-linear-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            
            <div className="lg:w-64 relative group">
              <select
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm shadow-inner text-lg appearance-none group-hover:border-blue-300"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">{t('admin_dashboard.all_status')}</option>
                <option value="Pending">{t('admin_dashboard.pending')}</option>
                <option value="Appropriate">{t('admin_dashboard.appropriate')}</option>
                <option value="In Progress">{t('admin_dashboard.in_progress')}</option>
                <option value="Completed">{t('admin_dashboard.completed')}</option>
                <option value="Inappropriate">{t('admin_dashboard.inappropriate')}</option>
              </select>
              <FiFilter className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <div className="absolute inset-0 rounded-xl bg-linear-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Content */}
        {viewMode === 'table' ? (
          /* Enhanced Table View */
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-linear-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <FiFileText className="text-gray-400" />
                        <span>{t('admin_dashboard.complaint')}</span>
                      </div>
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <FiUser className="text-gray-400" />
                        <span>{t('admin_dashboard.department')}</span>
                      </div>
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <FiTrendingUp className="text-gray-400" />
                        <span>{t('admin_dashboard.priority')}</span>
                      </div>
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <FiAlertCircle className="text-gray-400" />
                        <span>{t('admin_dashboard.status')}</span>
                      </div>
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <FiCalendar className="text-gray-400" />
                        <span>{t('admin_dashboard.date')}</span>
                      </div>
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <FiEdit className="text-gray-400" />
                        <span>{t('admin_dashboard.actions')}</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {complaints.map((complaint) => (
                    <tr key={complaint._id} className="hover:bg-gray-50/50 transition-all duration-200 group">
                      <td className="px-8 py-5">
                        <div className="space-y-1">
                          <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                            {complaint.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {complaint.description.substring(0, 80)}...
                          </div>
                          {complaint.trackingNumber && (
                            <div className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded inline-block">
                              {complaint.trackingNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">
                            {departments[complaint.department as DepartmentKey]?.[lang] || complaint.department}
                          </div>
                          {complaint.subDepartment && (
                            <div className="text-sm text-gray-500">
                              {
                                departments[complaint.department as DepartmentKey]?.subDepartments.find(
                                  (sub: any) =>
                                    sub.en === complaint.subDepartment ||
                                    sub.am === complaint.subDepartment ||
                                    sub.om === complaint.subDepartment
                                )?.[lang] || complaint.subDepartment
                              }
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center space-x-1 ${getLevelBadge(complaint.level)} transform hover:scale-105 transition-transform duration-200`}>
                          <span>{t(`level.${complaint.level}`)}</span>
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className={`inline-flex items-center space-x-2 ${getStatusBadge(complaint.status)} transform hover:scale-105 transition-transform duration-200`}>
                          {getStatusIcon(complaint.status)}
                          <span>{t(`status.${complaint.status}`)}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <FiCalendar className="text-gray-400" />
                          <span className="font-medium">
                            {new Date(complaint.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openViewModal(complaint)}
                            onMouseEnter={() => setIsHovered(`view-${complaint._id}`)}
                            onMouseLeave={() => setIsHovered(null)}
                            className="group relative p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                            title="View Details"
                          >
                            <div className="absolute inset-0 bg-blue-100/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <FiEye className="relative z-10" />
                          </button>
                          <button
                            onClick={() => openEditModal(complaint)}
                            onMouseEnter={() => setIsHovered(`edit-${complaint._id}`)}
                            onMouseLeave={() => setIsHovered(null)}
                            className="group relative p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                            title="Edit Status"
                          >
                            <div className="absolute inset-0 bg-green-100/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <FiEdit className="relative z-10" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(complaint)}
                            onMouseEnter={() => setIsHovered(`delete-${complaint._id}`)}
                            onMouseLeave={() => setIsHovered(null)}
                            className="group relative p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                            title="Delete Complaint"
                          >
                            <div className="absolute inset-0 bg-red-100/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <FiTrash2 className="relative z-10" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {complaints.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-linear-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <FiSearch className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-2xl font-semibold text-gray-500 mb-2">No complaints found</p>
                <p className="text-gray-400">
                  {searchTerm || statusFilter !== "All" ? "Try adjusting your search or filters" : "No complaints have been submitted yet"}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Enhanced Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complaints.map((complaint) => (
              <div key={complaint._id} className="group bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg p-6 border border-white/20 hover:shadow-2xl hover:border-blue-200 transition-all duration-500 transform hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                      {complaint.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`inline-flex items-center space-x-1 ${getLevelBadge(complaint.level)}`}>
                        <span>{t(`level.${complaint.level}`)}</span>
                      </span>
                      <span className={`inline-flex items-center space-x-2 ${getStatusBadge(complaint.status)}`}>
                        {getStatusIcon(complaint.status)}
                        <span className="text-xs">{t(`status.${complaint.status}`)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {complaint.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                      <FiUser className="text-blue-600" />
                    </div>
                    <div>
                      <span className="font-medium">
                        {departments[complaint.department as DepartmentKey]?.[lang] || complaint.department}
                      </span>
                      {complaint.subDepartment && (
                        <div className="text-xs text-gray-500 mt-1">
                          {
                            departments[complaint.department as DepartmentKey]?.subDepartments.find(
                              (sub: any) =>
                                sub.en === complaint.subDepartment ||
                                sub.am === complaint.subDepartment ||
                                sub.om === complaint.subDepartment
                            )?.[lang] || complaint.subDepartment
                          }
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center mr-3">
                      <FiCalendar className="text-gray-600" />
                    </div>
                    <span className="font-medium">
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
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors duration-200 text-sm font-semibold"
                  >
                    <FiEye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(complaint)}
                      className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-all duration-300 hover:scale-110"
                      title="Edit Status"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(complaint)}
                      className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all duration-300 hover:scale-110"
                      title="Delete Complaint"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {complaints.length === 0 && (
              <div className="col-span-full">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg p-12 text-center">
                  <div className="w-20 h-20 bg-linear-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <FiSearch className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-2xl font-semibold text-gray-500 mb-2">No complaints found</p>
                  <p className="text-gray-400">
                    {searchTerm || statusFilter !== "All" ? "Try adjusting your search or filters" : "No complaints have been submitted yet"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg p-6 mt-8 border border-white/20">
            <div className="text-sm text-gray-600">
              Showing <span className="font-bold text-gray-800">{complaints.length}</span> complaints
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => fetchComplaints(1)}
                disabled={page === 1}
                className="group p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
              >
                <FiChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handlePrev}
                disabled={page === 1}
                className="group p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center space-x-1">
                <span className="px-3 py-1.5 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold">
                  {page}
                </span>
                <span className="text-gray-400 mx-1">of</span>
                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-bold">
                  {totalPages}
                </span>
              </div>
              
              <button
                onClick={handleNext}
                disabled={page === totalPages}
                className="group p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchComplaints(totalPages)}
                disabled={page === totalPages}
                className="group p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
              >
                <FiChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

  
      </section>

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
        .shadow-2xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>

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
    </main>
  );
}