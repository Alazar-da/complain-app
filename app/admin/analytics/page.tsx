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
  FaTimesCircle,
  FaChevronDown,
  FaChevronUp,
  FaPaperPlane,
  FaUserCheck,
  FaBan,
  FaStar,
  FaAward
} from "react-icons/fa";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { BsGraphUpArrow } from "react-icons/bs";
import { useTranslation } from 'react-i18next';
import {departments,DepartmentKey} from '@/data/departments';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import * as XLSX from 'xlsx-color';
import { Toast } from '@capacitor/toast';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

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
  const [showFilters, setShowFilters] = useState(false);
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const { t, i18n } = useTranslation();
  const language = i18n.language as "am" | "en" | "om";
  const [isExporting, setIsExporting] = useState(false);

  const level = [
    { key: "Low", label: t("levels.Low") },
    { key: "Medium", label: t("levels.Medium") },
    { key: "High", label: t("levels.High") },
  ];

  const status = [
    { key: "Pending", label: t("update_status.status_options.pending.label") },
    { key: "Appropriate", label: t("update_status.status_options.appropriate.label") },
    { key: "In Progress", label: t("update_status.status_options.in_progress.label") },
    { key: "Completed", label: t("update_status.status_options.completed.label") },
    { key: "Inappropriate", label: t("update_status.status_options.inappropriate.label") },
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

  // Enhanced Chart data with better colors and styling
  const statusLabels = Object.keys(data?.statusCounts || {});
  const statusValues = statusLabels.map((l) => data?.statusCounts[l] || 0);

  const levelLabels = Object.keys(data?.levelCounts || {});
  const levelValues = levelLabels.map((l) => data?.levelCounts[l] || 0);

  const departmentLabels = Object.keys(data?.departmentCounts || {});
  const departmentValues = departmentLabels.map((l) => data?.departmentCounts[l] || 0);

  const dailyLabels = (data?.dailyCounts || []).map((d: any) => dayjs(d.date).format('MMM DD'));
  const dailyValues = (data?.dailyCounts || []).map((d: any) => d.count);

  // Enhanced Chart options and data
  const statusChartData = {
    labels: statusLabels,
    datasets: [
      {
        label: t("analytics.Complaints_by_Status"),
        data: statusValues,
        backgroundColor: [
          'rgba(255, 193, 7, 0.8)',    // Pending - Yellow
          'rgba(40, 167, 69, 0.8)',    // Appropriate - Green
          'rgba(0, 123, 255, 0.8)',    // In Progress - Blue
          'rgba(23, 162, 184, 0.8)',   // Completed - Teal
          'rgba(220, 53, 69, 0.8)',    // Inappropriate - Red
        ],
        borderColor: [
          'rgb(255, 193, 7)',
          'rgb(40, 167, 69)',
          'rgb(0, 123, 255)',
          'rgb(23, 162, 184)',
          'rgb(220, 53, 69)',
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
          'rgba(40, 167, 69, 0.8)',    // Low - Green
          'rgba(255, 193, 7, 0.8)',    // Medium - Yellow
          'rgba(220, 53, 69, 0.8)',    // High - Red
        ],
        borderColor: [
          'rgb(40, 167, 69)',
          'rgb(255, 193, 7)',
          'rgb(220, 53, 69)',
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

// Fixed CSV Download function


const downloadExcel = async () => {
  if (!items.length) {
    alert("No data to export");
    return;
  }

    // Show loading toast for mobile
  if ((window as any).Capacitor?.isNative && typeof Toast !== 'undefined') {
    await Toast.show({
      text: 'Preparing Excel report...',
      duration: 'short'
    });
  }

  // Summary counts
  const totalComplaints = items.length;
  const pendingComplaints = items.filter(item => item.status === 'Pending').length;
  const appropriateComplaints = items.filter(item => item.status === 'Appropriate').length;
  const inProgressComplaints = items.filter(item => item.status === 'In Progress').length;
  const completedComplaints = items.filter(item => item.status === 'Completed').length;
  const inappropriateComplaints = items.filter(item => item.status === 'Inappropriate').length;

  try {
    // Create workbook
    const wb = XLSX.utils.book_new();
    wb.Props = {
      Title: "Complaints Analytics Report",
      Subject: "Complaints Data",
      Author: "Complaint Management System",
      CreatedDate: new Date()
    };

    // Define styles
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
      fill: { fgColor: { rgb: "4F46E5" } }, // Indigo color
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };

    const summaryHeaderStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
      fill: { fgColor: { rgb: "059669" } }, // Emerald color
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };

    // Color mappings using English keys as base
    const statusColors: Record<string, string> = {
      "Pending": "FEF3C7", // Yellow-100
      "Appropriate": "D1FAE5", // Green-100
      "In Progress": "DBEAFE", // Blue-100
      "Completed": "10B981", // Green-500
      "Inappropriate": "FEE2E2" // Red-100
    };

    const levelColors: Record<string, string> = {
      "High": "FEE2E2", // Red-100
      "Medium": "FEF3C7", // Yellow-100
      "Low": "D1FAE5" // Green-100
    };

    // Create reverse mapping for translations to original keys
    const statusTranslationMap: Record<string, string> = {};
    const levelTranslationMap: Record<string, string> = {};
    
    // Populate translation maps
    status.forEach(s => {
      statusTranslationMap[t(`status.${s.key}`)] = s.key;
    });
    
    level.forEach(l => {
      levelTranslationMap[t(`levels.${l.key}`)] = l.key;
    });

    // Prepare data for main sheet with translated labels
    const data = items.map((item) => {
      return {
        [t("file_headers.tracking_number")]: item.trackingNumber || "",
        [t("file_headers.title")]: item.title || "",
        [t("file_headers.description")]: item.description || "",
        [t("file_headers.department")]: departments[item.department as DepartmentKey]?.[language] || item.department || "",
        [t("file_headers.sub_department")]: departments[item.department as DepartmentKey]?.subDepartments.find(
          (sub: any) =>
            sub.en === item.subDepartment ||
            sub.am === item.subDepartment ||
            sub.om === item.subDepartment
        )?.[language] || item.subDepartment || "",
        [t("file_headers.level")]: t(`levels.${item.level}`),
        [t("file_headers.status")]: t(`status.${item.status}`),
        [t("file_headers.responsible_person")]: item.responsiblePerson || "",
        [t("file_headers.reason")]: item.reason || "",
        [t("file_headers.submission_date")]: dayjs(item.createdAt).format("MMM DD, YYYY"),
        [t("file_headers.resolved_date")]: item.resolvedAt ? dayjs(item.resolvedAt).format("MMM DD, YYYY") : "",
        // Keep original keys for styling reference
        _originalLevel: item.level,
        _originalStatus: item.status
      };
    });

    // Create main worksheet
    const headers = [
      t("file_headers.tracking_number"),
      t("file_headers.title"),
      t("file_headers.description"),
      t("file_headers.department"),
      t("file_headers.sub_department"),
      t("file_headers.level"),
      t("file_headers.status"),
      t("file_headers.responsible_person"),
      t("file_headers.reason"),
      t("file_headers.submission_date"),
      t("file_headers.resolved_date")
    ];

    const ws = XLSX.utils.json_to_sheet(data, { header: headers });

    // Apply header styles
    const headerRange = XLSX.utils.decode_range(ws['!ref'] || "A1");
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = headerStyle;
    }

    // Apply conditional formatting for status and level columns
    for (let R = 1; R <= items.length; ++R) {
      // Status column (column G, index 6)
      const statusCell = XLSX.utils.encode_cell({ r: R, c: 6 });
      if (ws[statusCell]) {
        const originalStatus = data[R-1]._originalStatus;
        ws[statusCell].s = {
          fill: { fgColor: { rgb: statusColors[originalStatus] || "FFFFFF" } },
          font: { 
            bold: ["Completed", "Inappropriate"].includes(originalStatus),
            color: { rgb: ["Completed", "Inappropriate"].includes(originalStatus) ? "FFFFFF" : "000000" }
          },
          alignment: { horizontal: "center" }
        };
      }

      // Level column (column F, index 5)
      const levelCell = XLSX.utils.encode_cell({ r: R, c: 5 });
      if (ws[levelCell]) {
        const originalLevel = data[R-1]._originalLevel;
        ws[levelCell].s = {
          fill: { fgColor: { rgb: levelColors[originalLevel] || "FFFFFF" } },
          font: { bold: originalLevel === "High" },
          alignment: { horizontal: "center" }
        };
      }

      // Date columns alignment
      const submissionDateCell = XLSX.utils.encode_cell({ r: R, c: 9 });
      const resolvedDateCell = XLSX.utils.encode_cell({ r: R, c: 10 });
      if (ws[submissionDateCell]) {
        ws[submissionDateCell].s = { 
          alignment: { horizontal: "center" },
          numFmt: 'mmm dd, yyyy'
        };
      }
      if (ws[resolvedDateCell]) {
        ws[resolvedDateCell].s = { 
          alignment: { horizontal: "center" },
          numFmt: 'mmm dd, yyyy'
        };
      }
    }

    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // Tracking Number
      { wch: 30 }, // Title
      { wch: 40 }, // Description
      { wch: 20 }, // Department
      { wch: 20 }, // Sub Department
      { wch: 12 }, // Level
      { wch: 15 }, // Status
      { wch: 20 }, // Responsible Person
      { wch: 40 }, // Reason
      { wch: 15 }, // Submission Date
      { wch: 15 }  // Resolved Date
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Complaints Data");

    // Create summary sheet
    const summaryData = [
      [t("file_headers.summary_statistics"), ""],
      [t("file_headers.total_complaints"), totalComplaints],
      [t("file_headers.pending_complaints"), pendingComplaints],
      [t("file_headers.appropriate_complaints"), appropriateComplaints],
      [t("file_headers.in_progress_complaints"), inProgressComplaints],
      [t("file_headers.completed_complaints"), completedComplaints],
      [t("file_headers.inappropriate_complaints"), inappropriateComplaints],
      ["", ""],
      [t("file_headers.report_generated"), dayjs().format("MMM DD, YYYY HH:mm")],
      [t("file_headers.date_range"), `${dayjs(startDate).format("MMM DD, YYYY")} ${t("file_headers.to")} ${dayjs(endDate).format("MMM DD, YYYY")}`],
      [t("file_headers.status_filter"), statusFilter ? t(`status.${statusFilter}`) : t("file_headers.all")],
      [t("file_headers.level_filter"), levelFilter ? t(`levels.${levelFilter}`) : t("file_headers.all")],
      [t("file_headers.department"), departmentFilter ? (departments[departmentFilter as DepartmentKey]?.[language] || departmentFilter) : t("file_headers.all")],
      [t("file_headers.sub_department"), subDepartmentFilter || t("file_headers.all")]
    ];

    const ws2 = XLSX.utils.aoa_to_sheet(summaryData);

    // Apply styles to summary sheet
    ws2["A1"].s = summaryHeaderStyle;
    ws2["B1"].s = summaryHeaderStyle;
    
    // Merge header cells
    ws2["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];

    // Style summary values
    for (let R = 1; R <= 6; ++R) {
      const labelCell = XLSX.utils.encode_cell({ r: R, c: 0 });
      const valueCell = XLSX.utils.encode_cell({ r: R, c: 1 });
      
      ws2[labelCell].s = { font: { bold: true } };
      ws2[valueCell].s = { 
        font: { bold: true },
        fill: { fgColor: { rgb: R === 1 ? "3B82F6" : "6B7280" } }, // Different color for total
        alignment: { horizontal: "center" }
      };
    }

    // Style metadata rows
    for (let R = 8; R < summaryData.length; ++R) {
      const labelCell = XLSX.utils.encode_cell({ r: R, c: 0 });
      const valueCell = XLSX.utils.encode_cell({ r: R, c: 1 });
      
      ws2[labelCell].s = { font: { italic: true, color: { rgb: "6B7280" } } };
      ws2[valueCell].s = { font: { color: { rgb: "374151" } } };
    }

    ws2['!cols'] = [
      { wch: 25 },
      { wch: 30 }
    ];

    XLSX.utils.book_append_sheet(wb, ws2, "Summary");

    // Generate Excel file as ArrayBuffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const fileName = `complaints_analytics_${dayjs().format("YYYY-MM-DD_HH-mm")}.xlsx`;
    
    // Check if running in mobile app
    if ((window as any).Capacitor?.isNative) {
      // For mobile app using Capacitor
      await downloadExcelMobile(excelBuffer, fileName);
    } else {
      // For web/desktop
      downloadExcelWeb(excelBuffer, fileName);
    }

  } catch (error) {
    console.error("Excel export failed:", error);
    
    // Show error message based on platform
    if ((window as any).Capacitor?.isNative) {
      if (typeof Toast !== 'undefined') {
        await Toast.show({
          text: 'Failed to export Excel file',
          duration: 'long'
        });
      }
    } else {
      alert("Failed to export Excel file. Please try again.");
    }
    throw error;
  }
};

// Helper function for web download
const downloadExcelWeb = (excelBuffer: ArrayBuffer, fileName: string) => {
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
  
  // Show success message for web
  setTimeout(() => {
    alert(`Excel file "${fileName}" downloaded successfully!`);
  }, 100);
};

// Helper function for mobile download
const downloadExcelMobile = async (excelBuffer: ArrayBuffer, fileName: string) => {
  try {
    // Show processing message
    if (typeof Toast !== 'undefined') {
      await Toast.show({
        text: 'Processing Excel file...',
        duration: 'short'
      });
    }

    // Convert ArrayBuffer to base64
    const base64Data = arrayBufferToBase64(excelBuffer);
    console.log('Excel data converted to base64, length:', base64Data.length);

    // First, let's check platform and capabilities
    const platform = (window as any).Capacitor?.getPlatform();
    console.log('Platform:', platform);

    // METHOD 1: Try to save directly to Downloads (Android)
      try {
      console.log('Attempting to save to Downloads...');
      const savedFile = await Filesystem.writeFile({
        path: `Download/${fileName}`,
        data: base64Data,
        directory: Directory.ExternalStorage, // Use ExternalStorage for Android downloads
        recursive: true
      });
      
      console.log('File saved successfully:', savedFile);
      
      // Show success message
      if (typeof Toast !== 'undefined') {
        await Toast.show({
          text: `Excel saved to Downloads/${fileName}`,
          duration: 'long'
        });
      }
      
      return savedFile;
    } catch (saveError) {
      console.log('Method 1 (Downloads) failed:', saveError);
      
      // METHOD 2: Try ExternalStorage for older Android versions
      try {
        console.log('Trying ExternalStorage...');
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.ExternalStorage,
          recursive: true
        });
        
        console.log('File saved to ExternalStorage:', savedFile);
        
        if (typeof Toast !== 'undefined') {
          await Toast.show({
            text: `Excel saved to device storage`,
            duration: 'long'
          });
        }
        
        return savedFile;
      } catch (externalError) {
        console.log('Method 2 (ExternalStorage) failed:', externalError);
        
        // METHOD 3: Try Documents directory
        try {
          console.log('Trying Documents directory...');
          const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Documents,
            recursive: true
          });
          
          console.log('File saved to Documents:', savedFile);
          
          if (typeof Toast !== 'undefined') {
            await Toast.show({
              text: `Excel saved to Documents/${fileName}`,
              duration: 'long'
            });
          }
          
          // Offer to share the file
          await shareExcelFile(base64Data, fileName);
          
          return savedFile;
        } catch (docsError) {
          console.log('Method 3 (Documents) failed:', docsError);
          
          // METHOD 4: Try Data directory
          try {
            console.log('Trying Data directory...');
            const savedFile = await Filesystem.writeFile({
              path: fileName,
              data: base64Data,
              directory: Directory.Data,
              recursive: true
            });
            
            console.log('File saved to Data:', savedFile);
            
            // METHOD 5: Always try to share as final option
            console.log('Attempting to share file...');
            await shareExcelFile(base64Data, fileName);
            
            return savedFile;
          } catch (dataError) {
            console.log('Method 4 (Data) failed:', dataError);
            
            // Final fallback: Use FilePicker to let user choose location
            await downloadWithFilePicker(base64Data, fileName);
          }
        }
      }
    }
  } catch (error) {
    console.error('All download methods failed:', error);
    
    // Show error message
    if (typeof Toast !== 'undefined') {
      await Toast.show({
        text: 'Failed to save Excel. Trying alternative method...',
        duration: 'long'
      });
    }
    
    // Try one more time with direct share
    try {
      const base64Data = arrayBufferToBase64(excelBuffer);
      await forceShareExcel(base64Data, fileName);
    } catch (finalError) {
      console.error('Final attempt failed:', finalError);
      throw error;
    }
  }
};

// Alternative method using File Picker (if available)
const downloadWithFilePicker = async (base64Data: string, fileName: string) => {
  try {
    // For iOS, we can use the share sheet as a file picker
    if ((window as any).Capacitor?.getPlatform() === 'ios') {
      await shareExcelFile(base64Data, fileName);
      return;
    }
    
    // For Android, create a data URL and open in browser
    const dataUrl = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64Data}`;
    
    // Create a temporary link and click it
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    link.target = '_blank';
    
    // Create a click event
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    
    // Dispatch the event
    document.body.appendChild(link);
    link.dispatchEvent(clickEvent);
    document.body.removeChild(link);
    
    if (typeof Toast !== 'undefined') {
      await Toast.show({
        text: 'File ready for download in browser',
        duration: 'long'
      });
    }
  } catch (error) {
    console.error('File picker method failed:', error);
    throw error;
  }
};

// Force share method using data URL
const forceShareExcel = async (base64Data: string, fileName: string) => {
  try {
    // Create a blob URL
    const binaryString = window.atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Create object URL
    const fileUrl = URL.createObjectURL(blob);
    
    // For Android WebView, we can use download attribute
    if ((window as any).Capacitor?.getPlatform() === 'android') {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.click();
      
      if (typeof Toast !== 'undefined') {
        await Toast.show({
          text: 'Download started in browser',
          duration: 'long'
        });
      }
    } else {
      // For iOS or other platforms, use share
      await shareExcelFile(base64Data, fileName);
    }
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
  } catch (error) {
    console.error('Force share failed:', error);
    throw error;
  }
};

// Updated shareExcelFile function with better error handling
const shareExcelFile = async (base64Data: string, fileName: string) => {
  if (typeof Share === 'undefined') {
    console.warn('Share plugin not available');
    
    // Fallback: Create download link
    const dataUrl = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64Data}`;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    link.click();
    
    if (typeof Toast !== 'undefined') {
      await Toast.show({
        text: 'File download initiated',
        duration: 'long'
      });
    }
    return;
  }
  
  try {
    // For iOS, we need to save to a specific directory first
    const platform = (window as any).Capacitor?.getPlatform();
    let directory = Directory.Cache;
    
    if (platform === 'ios') {
      directory = Directory.Library;
    }
    
    // Save file first
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: directory,
      recursive: true
    });
    
    console.log('File saved for sharing:', savedFile);
    
    // Get file URI
    const fileUri = savedFile.uri;
    
    // Share the file
    await Share.share({
      title: 'Complaints Analytics Report',
      text: 'Complaints data export',
      url: fileUri,
      dialogTitle: 'Save or Share Excel File'
    });
    
    console.log('Share dialog opened');
    
    return savedFile;
  } catch (error) {
    console.error('Share failed:', error);
    
    // Try one more time with Cache directory
    try {
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true
      });
      
      await Share.share({
        title: 'Complaints Report',
        text: 'Excel File',
        url: savedFile.uri
      });
    } catch (retryError) {
      console.error('Retry share failed:', retryError);
      throw error;
    }
  }
};

// Helper to convert ArrayBuffer to base64
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

/* // Update your export button to use this function:
<button 
  onClick={downloadExcel}
  disabled={!items.length}
  onMouseEnter={() => setIsHovered('export')}
  onMouseLeave={() => setIsHovered(null)}
  className="group relative bg-gradient-to-r from-green-500 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-green-600 hover:to-teal-700 focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 hover:scale-105 hover:shadow-2xl overflow-hidden flex items-center justify-center space-x-3 w-full sm:w-auto"
>
  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
  <FiDownload className="relative z-10 text-lg transition-transform group-hover:scale-110" />
  <span className="relative z-10 text-lg">Export Excel</span>
</button> */


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <FaCheckCircle className="text-green-500" />;
      case 'In Progress': return <FaSync className="text-blue-500" />;
      case 'Pending': return <FaClock className="text-yellow-500" />;
      case 'Appropriate': return <FaUserCheck className="text-teal-500" />;
      case 'Inappropriate': return <FaBan className="text-red-500" />;
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

  // Calculate stats for cards
  const totalComplaints = items.length;
  const pendingComplaints = items.filter(item => item.status === 'Pending').length;
  const appropriateComplaints = items.filter(item => item.status === 'Appropriate').length;
  const inProgressComplaints = items.filter(item => item.status === 'In Progress').length;
  const completedComplaints = items.filter(item => item.status === 'Completed').length;
  const inappropriateComplaints = items.filter(item => item.status === 'Inappropriate').length;


    if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-100 text-slate-800">
     
                {/* Header */}
           <header className="lg:bg-white bg-slate-900 lg:text-slate-800 text-white shadow-sm border-b border-gray-200 w-full fixed top-0 z-30 pt-8 lg:pt-0">
             <div className="px-4 sm:px-6 lg:px-8">
               <div className="flex items-center justify-start h-16">
                   <div className="shrink-0 lg:block hidden">
                     <div className="w-8 h-8 bg-linear-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                       <BsGraphUpArrow className="w-4 h-4 text-white" />
                     </div>
                   </div>
                   <div className="lg:ml-3 ml-15">
                     <h1 className="text-xl font-bold lg:text-gray-900">{t('analytics.title')}</h1>
                   </div>
               </div>
             </div>
           </header>
     
      {/* Animated Background Elements */}
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 lg:mb-0">

        
       <div className="flex flex-col justify-start lg:mb-12 mb-4">
          <h2 className="sm:text-2xl text-lg font-bold text-gray-900">
              {t("analytics.dashboard")}
          </h2>
          <p className="text-gray-600 mt-1 sm:text-md text-sm">
            {t("analytics.description")}
          </p>
        </div>

          <button
    onClick={() => setShowFilters(!showFilters)}
    onMouseEnter={() => setIsHovered('filters')}
    onMouseLeave={() => setIsHovered(null)}
    className="group relative bg-linear-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-lg overflow-hidden flex items-center space-x-2 w-fit"
  >
    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
    <FaFilter className="relative z-10 text-sm" />
    <span className="relative z-10 text-sm">
      {showFilters ? t("analytics.hide_filters") : t("analytics.show_filters")}
    </span>
    {showFilters ? (
      <FaChevronUp className="relative z-10 text-xs" />
    ) : (
      <FaChevronDown className="relative z-10 text-xs" />
    )}
  </button>

  </div>



{/* Compact Collapsible Filters Card */}
{showFilters && (
  <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 mb-6 border border-white/20 animate-fade-in">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {/* Status Filter */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t("analytics.status")}
        </label>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)} 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
        >
          <option value="">{t("analytics.All")}</option>
          {status.map((value) => (
            <option key={value.key} value={value.key}>
              {value.label}
            </option>
          ))}
        </select>
      </div>

      {/* Level Filter */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t("analytics.level")}
        </label>
        <select 
          value={levelFilter} 
          onChange={(e) => setLevelFilter(e.target.value)} 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
        >
          <option value="">{t("analytics.All")}</option>
          {level.map((lvl) => (
            <option key={lvl.key} value={lvl.key}>
              {lvl.label}
            </option>
          ))}
        </select>
      </div>

      {/* Department Filter */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t("analytics.department")}
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
          value={departmentFilter}
          onChange={(e) => {
            setDepartmentFilter(e.target.value);
            setSubDepartmentFilter("");
          }}
        >
          <option value="">{t("analytics.All")}</option>
          {Object.entries(departments).map(([key, dept]) => (
            <option key={key} value={key}>
              {dept[language] || dept.en}
            </option>
          ))}
        </select>
      </div>

          {/* Sub-department - Only shows when needed */}
    {departmentFilter && departments[departmentFilter as DepartmentKey]?.subDepartments.length > 0 && (
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t("analytics.sub_department")}
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
          value={subDepartmentFilter}
          onChange={(e) => setSubDepartmentFilter(e.target.value)}
        >
          <option value="">{t("analytics.All")}</option>
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

<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
   {/* Date Range - Combined */}
      <div className="sm:col-span-2 lg:col-span-1">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t("analytics.date_range")}
        </label>
        <div className="flex space-x-2">
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
          />
          <span className="flex items-center text-gray-400">→</span>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
          />
        </div>
      </div>
    {/* Action Buttons - Compact */}
    <div className="flex gap-3 pt-2 justify-between w-full sm:items-end sm:col-span-2 lg:col-span-1">
      <button
        onClick={fetchData}
        disabled={loading}
        onMouseEnter={() => setIsHovered('apply')}
        onMouseLeave={() => setIsHovered(null)}
        className="group relative bg-linear-to-r from-blue-500 to-purple-600 text-white px-4 py-3 h-fit rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-lg overflow-hidden flex items-center justify-center space-x-2 flex-1"
      >
        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10"></div>
            <span className="relative z-10 text-sm">{t("analytics.Loading")}</span>
          </>
        ) : (
          <>
            <FaSync className="relative z-10 text-sm" />
            <span className="relative z-10 text-sm">{t("analytics.apply_filters")}</span>
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
        onMouseEnter={() => setIsHovered('clear')}
        onMouseLeave={() => setIsHovered(null)}
        className="group relative bg-linear-to-r from-gray-500 to-gray-600 text-white px-4 py-3 h-fit rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-lg overflow-hidden flex items-center justify-center space-x-2 flex-1"
      >
        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
        <FaTimes className="relative z-10 text-sm" />
        <span className="relative z-10 text-sm">{t("analytics.clear_all")}</span>
      </button>
    </div>
    </div>
  </div>
)}

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Complaints */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-500 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">{t("analytics.total_complaints")}</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{totalComplaints}</h3>
              </div>
              <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaChartBar className="text-white text-xl" />
              </div>
            </div>
          </div>

          {/* Pending Complaints */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-500 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">{t("analytics.pending_complaints")}</p>
                <h3 className="text-3xl font-bold text-yellow-600 mt-2">{pendingComplaints}</h3>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ 
                      width: `${((pendingComplaints / totalComplaints) * 100) || 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div className="w-12 h-12 bg-linear-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaClock className="text-white text-xl" />
              </div>
            </div>
          </div>

          {/* Appropriate Complaints */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-500 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">{t("analytics.appropriate_complaints")}</p>
                <h3 className="text-3xl font-bold text-teal-600 mt-2">{appropriateComplaints}</h3>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-teal-500 h-2 rounded-full" 
                    style={{ 
                      width: `${((appropriateComplaints / totalComplaints) * 100) || 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div className="w-12 h-12 bg-linear-to-br from-teal-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaUserCheck className="text-white text-xl" />
              </div>
            </div>
          </div>

          {/* In Progress Complaints */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-500 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">{t("analytics.in_progress_complaints")}</p>
                <h3 className="text-3xl font-bold text-blue-600 mt-2">{inProgressComplaints}</h3>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ 
                      width: `${((inProgressComplaints / totalComplaints) * 100) || 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaSync className="text-white text-xl animate-pulse" />
              </div>
            </div>
          </div>

          {/* Completed Complaints */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-500 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">{t("analytics.completed_complaints")}</p>
                <h3 className="text-3xl font-bold text-green-600 mt-2">{completedComplaints}</h3>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ 
                      width: `${((completedComplaints / totalComplaints) * 100) || 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div className="w-12 h-12 bg-linear-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaCheckCircle className="text-white text-xl" />
              </div>
            </div>
          </div>

          {/* Inappropriate Complaints */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-500 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">{t("analytics.inappropriate_complaints")}</p>
                <h3 className="text-3xl font-bold text-red-600 mt-2">{inappropriateComplaints}</h3>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ 
                      width: `${((inappropriateComplaints / totalComplaints) * 100) || 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div className="w-12 h-12 bg-linear-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaBan className="text-white text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {/* Status Distribution */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20 transform transition-all duration-500 hover:shadow-3xl">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <FaChartBar className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{t("analytics.status_distribution")}</h3>
                <p className="text-gray-500">{t("analytics.status_distribution_desc")}</p>
              </div>
            </div>
            <div className="h-64">
              <Bar data={statusChartData} options={chartOptions} />
            </div>
          </div>

          {/* Level Breakdown */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20 transform transition-all duration-500 hover:shadow-3xl">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-linear-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <FaChartPie className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{t("analytics.level_breakdown")}</h3>
                <p className="text-gray-500">{t("analytics.level_breakdown_desc")}</p>
              </div>
            </div>
            <div className="h-64">
              <Pie data={levelChartData} options={chartOptions} />
            </div>
          </div>

          {/* Daily Trends */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20 transform transition-all duration-500 hover:shadow-3xl lg:col-span-2 xl:col-span-1">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <FaChartLine className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{t("analytics.daily_trends")}</h3>
                <p className="text-gray-500">{t("analytics.daily_trends_desc")}</p>
              </div>
            </div>
            <div className="h-64">
              <Line data={dailyChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Enhanced Complaints Table */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 transform transition-all duration-500 hover:shadow-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-linear-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <FaTable className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{t("analytics.complaints_data")}</h3>
                <p className="text-gray-500">{t("analytics.complaints_data_desc")}</p>
              </div>
            </div>
   <button 
  onClick={async () => {
    if (!items.length) {
      if ((window as any).Capacitor?.isNative && typeof Toast !== 'undefined') {
        await Toast.show({
          text: 'No data to export',
          duration: 'short'
        });
      } else {
        alert("No data to export");
      }
      return;
    }
    
    // Show loading state
    setIsExporting(true);
    
    try {
      await downloadExcel();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  }}
  disabled={!items.length || isExporting}
  onMouseEnter={() => setIsHovered('export')}
  onMouseLeave={() => setIsHovered(null)}
  className={`group relative bg-linear-to-r from-green-500 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-green-600 hover:to-teal-700 focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 hover:scale-105 hover:shadow-2xl overflow-hidden flex items-center justify-center space-x-3 w-full sm:w-auto ${isExporting ? 'opacity-70' : ''}`}
>
  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
  
  {isExporting ? (
    <>
      <div className="relative z-10 w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      <span className="relative z-10 text-lg">
        {(window as any).Capacitor?.isNative ? 'Preparing...' : 'Exporting...'}
      </span>
    </>
  ) : (
    <>
      <FaDownload className="relative z-10 text-lg transition-transform group-hover:scale-110" />
      <span className="relative z-10 text-lg">{t("analytics.export_csv")}</span>
    </>
  )}
</button>
          </div>

          <div className="overflow-x-auto rounded-2xl border-2 border-gray-100">
           <table className="min-w-max w-full">
              <thead>
                <tr className="bg-linear-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-sm font-bold text-gray-700">{t("analytics.table_title")}</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700">{t("analytics.table_description")}</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700">{t("analytics.department")}</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700">{t("analytics.sub_department")}</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700">{t("analytics.level")}</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700">{t("analytics.status")}</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700">{t("analytics.table_date")}</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((r) => (
                    <tr key={r._id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-200">
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">{r.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{r.description}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{departments[r.department as DepartmentKey]?.[language] || r.department}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{
                        departments[r.department as DepartmentKey]?.subDepartments.find(
                          (sub:any) =>
                            sub.en === r.subDepartment ||
                            sub.am === r.subDepartment ||
                            sub.om === r.subDepartment
                        )?.[language] || r.subDepartment || "-"
                      }</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2 ${getLevelColor(r.level)}`}>
                          {t(`levels.${r.level}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(r.status)}
                          <span className="text-sm font-medium text-gray-700">{t(`status.${r.status}`)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        {dayjs(r.date).format('MMM DD, YYYY')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <FaChartBar className="text-6xl text-gray-300 mb-4" />
                        <p className="text-xl font-semibold text-gray-500 mb-2">{t("analytics.no_data")}</p>
                        <p className="text-gray-400">{t("analytics.try_adjusting")}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
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
        .shadow-3xl {
          box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </main>
  );
}