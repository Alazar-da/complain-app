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
  FaUniversity
} from "react-icons/fa";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

export default function AnalyticsPage() {
  const [startDate, setStartDate] = useState(dayjs().subtract(30, "day").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [statusFilter, setStatusFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [subDepartmentFilter, setSubDepartmentFilter] = useState("");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<string[]>([]);
  const [subDepartments, setSubDepartments] = useState<string[]>([]);
  const [items, setItems] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("startDate", startDate);
      params.set("endDate", endDate);
      if (statusFilter) params.set("status", statusFilter);
      if (levelFilter) params.set("level", levelFilter);
      if (departmentFilter) params.set("department", departmentFilter);
      if (subDepartmentFilter) params.set("subDepartment", subDepartmentFilter);

      const res = await fetch(`/api/admin/analytics?${params.toString()}`, {
    method: "GET",
  });

      if (!res.ok) throw new Error('Failed to fetch data');
      const json = await res.json();
      setData(json);
      setItems(json.items || []);
      setDepartments(json.departments || []);
      setSubDepartments(json.subDepartments || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setData(null);
      setItems([]);
      setDepartments([]);
      setSubDepartments([]);
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
        label: "Complaints by Status",
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
        label: "Complaints by Level",
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
        label: "Daily Complaints",
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
    const headers = ["title", "department", "subDepartment", "level", "status", "date"];
    const csv = [
      headers.join(","),
      ...items.map((r) => headers.map((h) => `"${r[h] || ""}"`).join(",")),
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
    <main className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8 px-4 text-slate-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Comprehensive insights and analytics for complaints management</p>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
              <FaFilter className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Filters & Controls</h2>
              <p className="text-gray-500 text-sm">Refine your analytics data</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FaCalendarAlt className="mr-2 text-gray-400" />
                Start Date
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
                End Date
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
                Status
              </label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Status</option>
                {["Pending", "In Progress", "Completed", "Canceled"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FaExclamationTriangle className="mr-2 text-gray-400" />
                Level
              </label>
              <select 
                value={levelFilter} 
                onChange={(e) => setLevelFilter(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Levels</option>
                {["Low", "Medium", "High"].map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FaBuilding className="mr-2 text-gray-400" />
                Department
              </label>
              <select 
                value={departmentFilter} 
                onChange={(e) => setDepartmentFilter(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FaLayerGroup className="mr-2 text-gray-400" />
                Sub Department
              </label>
              <select 
                value={subDepartmentFilter} 
                onChange={(e) => setSubDepartmentFilter(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Sub-Departments</option>
                {subDepartments.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                <>
                  <FaSync className="mr-2" />
                  Apply Filters
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
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 flex items-center"
            >
              <FaTimes className="mr-2" />
              Clear All
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Complaints</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{items.length}</h3>
              </div>
              <div className="w-12 h-12 bg-linear-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FaChartBar className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Departments</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{departments.length}</h3>
              </div>
              <div className="w-12 h-12 bg-linear-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                <FaUniversity className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Sub-Departments</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{subDepartments.length}</h3>
              </div>
              <div className="w-12 h-12 bg-linear-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <FaLayerGroup className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Date Range</p>
                <h3 className="text-lg font-semibold text-gray-800 mt-2">
                  {dayjs(startDate).format('MMM DD')} - {dayjs(endDate).format('MMM DD, YYYY')}
                </h3>
              </div>
              <div className="w-12 h-12 bg-linear-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <FaCalendarAlt className="text-white text-xl" />
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
                <h3 className="text-lg font-semibold text-gray-800">Status Distribution</h3>
                <p className="text-gray-500 text-sm">Breakdown by complaint status</p>
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
                <h3 className="text-lg font-semibold text-gray-800">Level Breakdown</h3>
                <p className="text-gray-500 text-sm">Priority level distribution</p>
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
                <h3 className="text-lg font-semibold text-gray-800">Daily Trends</h3>
                <p className="text-gray-500 text-sm">Complaints over time</p>
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
                <h3 className="text-lg font-semibold text-gray-800">Complaints Data</h3>
                <p className="text-gray-500 text-sm">Detailed view of all complaints</p>
              </div>
            </div>
            <button 
              onClick={downloadCSV}
              disabled={!items.length}
              className="bg-linear-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-teal-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <FaDownload className="mr-2" />
              Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Title</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Department</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Sub-Department</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Level</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((r) => (
                    <tr key={r._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 py-3 text-sm text-gray-800">{r.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{r.department}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{r.subDepartment || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLevelColor(r.level)}`}>
                          {r.level}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(r.status)}
                          <span className="text-sm text-gray-700">{r.status}</span>
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
                        <p className="text-lg">No complaints data found</p>
                        <p className="text-sm">Try adjusting your filters or date range</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}