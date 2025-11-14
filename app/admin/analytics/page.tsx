"use client";
import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import { 
  FaFilter, 
  FaDownload, 
  FaChartBar, 
  FaChartLine, 
  FaChartPie, 
  FaTable,
  FaSync,
  FaCalendarAlt,
  FaBuilding,
  FaLayerGroup,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaUsers,
  FaUniversity,
  FaTimesCircle
} from "react-icons/fa";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { BsGraphUpArrow } from "react-icons/bs";
import { useTranslation } from 'react-i18next';
import {departments,DepartmentKey} from '@/data/departments';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

export default function AnalyticsPage() {
  const [startDate, setStartDate] = useState(dayjs().subtract(30, "day").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [statusFilter, setStatusFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [subDepartmentFilter, setSubDepartmentFilter] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const { t, i18n } = useTranslation();
  const language = i18n.language as "am" | "en" | "om";

      const level = [
    { key: "Low", label: t("level.Low") },
    { key: "Medium", label: t("level.Medium") },
    { key: "High", label: t("level.High") },
  ];
        const status = [
    { key: "Pending", label: t("update_status.status_options.pending.label") },
    { key: "In Progress", label: t("update_status.status_options.in_progress.label") },
    { key: "Completed", label: t("update_status.status_options.completed.label") },
     { key: "Canceled", label: t("update_status.status_options.canceled.label") },
  ];

const fetchData = async () => {
  setLoading(true);
  try {
    const params = new URLSearchParams({
      startDate,
      endDate,
      status: statusFilter || "All",
      level: levelFilter || "All",
      department: departmentFilter || "All",
      subDepartment: subDepartmentFilter || "All",
    });

    const res = await fetch(`/api/admin/analytics?${params.toString()}`);
    const data = await res.json();
    setData(data);
    console.log("data",data)
    setItems(data.complaints);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchData();
  }, []);



  // Chart data with better colors and styling
  const statusLabels = Object.keys(data?.statusCounts || {});
  const statusValues = statusLabels.map((l) => data?.statusCounts[l] || 0);

  const levelLabels = Object.keys(data?.levelCounts || {});
  const levelValues = levelLabels.map((l) => data?.levelCounts[l] || 0);

  const departmentLabels = Object.keys(data?.departmentCounts || {});
  const departmentValues = departmentLabels.map((l) => data?.departmentCounts[l] || 0);

  const dailyLabels = (data?.dailyCounts || []).map((d: any) => dayjs(d.date).format('MMM DD'));
  const dailyValues = (data?.dailyCounts || []).map((d: any) => d.count);

  // Chart options and data
  const statusChartData = {
    labels: statusLabels,
    datasets: [
      {
        label: t("analytics.Complaints_by_Status"),
        data: statusValues,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 205, 86, 0.8)',
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(75, 192, 192)',
          'rgb(255, 205, 86)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const levelChartData = {
    labels: levelLabels,
    datasets: [
      {
        label: t("analytics.Complaints_by_Level"),
        data: levelValues,
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderColor: [
          'rgb(75, 192, 192)',
          'rgb(255, 205, 86)',
          'rgb(255, 99, 132)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const dailyChartData = {
    labels: dailyLabels,
    datasets: [
      {
        label: t("analytics.Daily_Complaints"),
        data: dailyValues,
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    maintainAspectRatio: false,
  };

// Download CSV
const downloadCSV = () => {
  if (!items.length) return;

  const headers = ["title", "description", "department", "subDepartment", "level", "status", "date"];

/*   const headers = [
    t("analytics.table_title"),
    t("analytics.table_description"),
    t("analytics.department"),
    t("analytics.sub_department"),
    t("analytics.level"),
    t("analytics.status"),
    t("analytics.table_date"),
  ]; */

  const csv = [
    headers.join(","), // header row
    ...items.map((r) =>
      headers
        .map((k) => {
          // Format date nicely
          if (k === "date") {
            return `"${dayjs(r[k]).format("MMM DD, YYYY")}"`;
          }
          return `"${r[k] || ""}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `complaints_${startDate}_${endDate}.csv`;
  a.click();
};



  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <FaCheckCircle className="text-green-500" />;
      case 'In Progress': return <FaSync className="text-blue-500" />;
      case 'Pending': return <FaClock className="text-yellow-500" />;
      case 'Canceled': return <FaTimes className="text-red-500" />;
      default: return <FaExclamationTriangle className="text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-slate-800">
                {/* Header */}
               <header className="lg:bg-white bg-slate-900 lg:text-slate-800 text-white shadow-sm border-b border-gray-200 w-full fixed top-0 z-50 pt-8 lg:pt-0 lg:static">
      
                  <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-start h-16">
                        <div className="shrink-0 lg:block hidden">
                          <div className="w-8 h-8 bg-linear-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                            <BsGraphUpArrow className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="lg:ml-3 ml-15">
                          <h1 className="text-xl font-bold lg:text-gray-900">{t("analytics.title")}</h1>
                        </div>
                    </div>
                  </div>
                </header>
          
          
               
        <section className="relative p-4 py-6 sm:p-6 lg:px-8 lg:py-10 mt-20 lg:mt-0">
           {/* Language Switcher */}
              <section className="fixed lg:top-3.5 top-12 right-5 z-50">
              <LanguageSwitcher />
            </section>  
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="sm:text-2xl text-lg font-bold text-gray-900">{t("analytics.dashboard")}</h2>
          <p className="text-gray-600 mt-1 sm:text-md text-sm">{t("analytics.description")}</p>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
              <FaFilter className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{t("analytics.filters")}</h2>
              <p className="text-gray-500 text-sm">{t("analytics.filters_description")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FaCalendarAlt className="mr-2 text-gray-400" />
                {t("analytics.start_date")}
              </label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FaCalendarAlt className="mr-2 text-gray-400" />
                {t("analytics.end_date")}
              </label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FaCheckCircle className="mr-2 text-gray-400" />
                {t("analytics.status")}
              </label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                         <option value="All">{t("analytics.All")} {t("analytics.status")}</option>
                        {status.map((value) => (
                <option key={value.key} value={value.key}>
                  {value.label}
                </option>
              ))}
              </select>
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FaExclamationTriangle className="mr-2 text-gray-400" />
                {t("analytics.level")}
              </label>
              <select 
                value={levelFilter} 
                onChange={(e) => setLevelFilter(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="All">{t("analytics.All")} {t("analytics.level")}</option>
                        {level.map((lvl) => (
                <option key={lvl.key} value={lvl.key}>
                  {lvl.label}
                </option>
              ))}
            
              </select>
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FaBuilding className="mr-2 text-gray-400" />
                {t("analytics.department")}
              </label>
           <select
             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
               value={departmentFilter}
              onChange={(e) =>
              {setDepartmentFilter(e.target.value)
              setSubDepartmentFilter("All");
              }
              }
              required
            >
              <option value="" disabled>{t("messages.selectDepartment")}</option>
              <option value={"All"}>{t("analytics.All")}</option>
              {Object.entries(departments).map(([key, dept]) => (
                <option key={key} value={key}>
                  {dept[language] || dept.en}
                </option>
              ))}
            </select>
            </div>
            <div>
              {departmentFilter && departmentFilter!=="All" && departmentFilter!=="General" &&(
                <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FaLayerGroup className="mr-2 text-gray-400" />
                {t("analytics.sub_department")}
              </label>
               
            {departments[departmentFilter as DepartmentKey].subDepartments.length > 0 && (
              <div>
                <select
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
               value={subDepartmentFilter}
                  onChange={(e) =>
                    setSubDepartmentFilter(e.target.value)
                  }
                >
                   
                  <option value="" disabled>{t("messages.selectSubDepartment")}</option>
                  <option value={"All"}>{t("analytics.All")}</option>
                  {departments[departmentFilter as DepartmentKey].subDepartments.map(
                    (sub, index) => (
                      <option key={index} value={sub.en}>
                        {sub[language] || sub.en}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}
            </div>
             )}
          </div>
          </div>
         

          <div className="flex gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center hover:cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                 {t("analytics.Loading")}
                </>
              ) : (
                <>
                  <FaSync className="mr-2" />
                  {t("analytics.apply_filters")}
                </>
              )}
            </button>
            
            <button
              onClick={() => {
                setStatusFilter('');
                setLevelFilter('');
                setDepartmentFilter('');
                setSubDepartmentFilter('');
                setStartDate(dayjs().subtract(30, "day").format("YYYY-MM-DD"));
                setEndDate(dayjs().format("YYYY-MM-DD"));
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 flex items-center hover:cursor-pointer"
            >
              <FaTimes className="mr-2" />
             {t("analytics.clear_all")}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  {/* Total Complaints */}
  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{t("analytics.total_complaints")}</p>
        <h3 className="text-3xl font-bold text-gray-800 mt-2">{items.length}</h3>
      </div>
      <div className="w-12 h-12 bg-linear-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
        <FaChartBar className="text-white text-xl" />
      </div>
    </div>
  </div>

  {/* Active Cases */}
  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{t("analytics.active_cases")}</p>
        <h3 className="text-3xl font-bold text-amber-600 mt-2">
          {items.filter(item => item.status === 'Pending' || item.status === 'In Progress').length}
        </h3>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
          <div 
            className="bg-amber-500 h-1.5 rounded-full" 
            style={{ 
              width: `${((items.filter(item => item.status === 'Pending' || item.status === 'In Progress').length / items.length) * 100) || 0}%` 
            }}
          ></div>
        </div>
      </div>
      <div className="w-12 h-12 bg-linear-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
        <FaSync className="text-white text-xl animate-pulse" />
      </div>
    </div>
  </div>

  {/* Completed Cases */}
  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{t("analytics.completed_complaints")}</p>
        <h3 className="text-3xl font-bold text-green-600 mt-2">
          {items.filter(item => item.status === 'Completed').length}
        </h3>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
          <div 
            className="bg-green-500 h-1.5 rounded-full" 
            style={{ 
              width: `${((items.filter(item => item.status === 'Completed').length / items.length) * 100) || 0}%` 
            }}
          ></div>
        </div>
      </div>
      <div className="w-12 h-12 bg-linear-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
        <FaCheckCircle className="text-white text-xl" />
      </div>
    </div>
  </div>

  {/* Canceled Cases */}
  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{t("analytics.canceled_complaints")}</p>
        <h3 className="text-3xl font-bold text-red-600 mt-2">
          {items.filter(item => item.status === 'Canceled').length}
        </h3>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
          <div 
            className="bg-red-500 h-1.5 rounded-full" 
            style={{ 
              width: `${((items.filter(item => item.status === 'Canceled').length / items.length) * 100) || 0}%` 
            }}
          ></div>
        </div>
      </div>
      <div className="w-12 h-12 bg-linear-to-r from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
        <FaTimesCircle className="text-white text-xl" />
      </div>
    </div>
  </div>
</div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {/* Status Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                <FaChartBar className="text-white text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{t("analytics.status_distribution")}</h3>
                <p className="text-gray-500 text-sm">{t("analytics.status_distribution_desc")}</p>
              </div>
            </div>
            <div className="h-64">
              <Bar data={statusChartData} options={chartOptions} />
            </div>
          </div>

          {/* Level Breakdown */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-linear-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center mr-3">
                <FaChartPie className="text-white text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{t("analytics.level_breakdown")}</h3>
                <p className="text-gray-500 text-sm">{t("analytics.level_breakdown_desc")}</p>
              </div>
            </div>
            <div className="h-64">
              <Pie data={levelChartData} options={chartOptions} />
            </div>
          </div>

          {/* Daily Trends */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 lg:col-span-2 xl:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-linear-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-3">
                <FaChartLine className="text-white text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{t("analytics.daily_trends")}</h3>
                <p className="text-gray-500 text-sm">{t("analytics.daily_trends_desc")}</p>
              </div>
            </div>
            <div className="h-64">
              <Line data={dailyChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-linear-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-3">
                <FaTable className="text-white text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{t("analytics.complaints_data")}</h3>
                <p className="text-gray-500 text-sm">{t("analytics.complaints_data_desc")}</p>
              </div>
            </div>
            <button 
              onClick={downloadCSV}
              disabled={!items.length}
              className="bg-linear-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-teal-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center hover:cursor-pointer"
            >
              <FaDownload className="mr-2" />
              {t("analytics.export_csv")}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">{t("analytics.table_title")}</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">{t("analytics.table_description")}</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">{t("analytics.department")}</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">{t("analytics.sub_department")}</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">{t("analytics.level")}</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">{t("analytics.status")}</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">{t("analytics.table_date")}</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((r) => (
                    <tr key={r._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 py-3 text-sm text-gray-800">{r.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{r.description}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{departments[r.department as DepartmentKey]?.[language] || r.department}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{
        departments[r.department as DepartmentKey]?.subDepartments.find(
          (sub:any) =>
            sub.en === r.subDepartment || // if you store the English label
            sub.am === r.subDepartment || // or Amharic
            sub.om === r.subDepartment    // or Oromo
        )?.[language] || r.subDepartment
      || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLevelColor(r.level)}`}>
                          {t(`level.${r.level}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(r.status)}
                          <span className="text-sm text-gray-700">{t(`status.${r.status}`)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {dayjs(r.date).format('MMM DD, YYYY')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FaChartBar className="text-4xl text-gray-300 mb-2" />
                        <p className="text-lg">{t("analytics.no_data")}</p>
                        <p className="text-sm">{t("analytics.try_adjusting")}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
    </main>
  );
}