"use client";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useState, useEffect, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { departments, DepartmentKey } from "@/data/departments";


type Department = keyof typeof departments;


export default function Home() {
  const [form, setForm] = useState<{
    title: string;
    department: Department | "";
    subDepartment: string;
    status?:string;
    level: string;
    description: string;
  }>({
    title: "",
    department: "",
    subDepartment: "",
    status:"Pending",
    level: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [countdown, setCountdown] = useState(0);
    const { t } = useTranslation();
    const { i18n } = useTranslation();
const language = i18n.language as "am" | "en" | "om";





 const levels = [
  { key: "Low", label: t("levels.low") },
  { key: "Medium", label: t("levels.medium") },
  { key: "High", label: t("levels.high") },
];

  // Countdown effect for redirect
useEffect(() => {
  if (countdown > 0) {
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }
}, [countdown, message.type]);


  const showMessage = (text:string, type = "info") => {
    setMessage({ text, type });
    if (type === "success") {
      setCountdown(3); // Start 3-second countdown for redirect
    }
  };

  const handleSubmit = async (e:FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });
    
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      
      if (data.success) {
        showMessage(t("messages.success"), "success");
        setForm({
          title: "",
          department: "",
          subDepartment: "",
          level: "",
          description: "",
        });
        setTimeout(()=>window.location.reload(),3500)
      } else {
        showMessage("Error: " + data.error, "error");
      }
    } catch (err) {
      showMessage(t("messages.error"), "error");
    } finally {
      setLoading(false);
    }
  };

  const getMessageStyles = () => {
    const baseStyles = "my-4 p-4 rounded-lg border text-center font-medium animate-fade-in";
    
    switch (message.type) {
      case "success":
        return `${baseStyles} bg-green-50 text-green-800 border-green-200`;
      case "error":
        return `${baseStyles} bg-red-50 text-red-800 border-red-200`;
      default:
        return `${baseStyles} bg-blue-50 text-blue-800 border-blue-200`;
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 text-slate-800 py-8">
      <section className="fixed top-2 right-2">
        <LanguageSwitcher/>
      </section>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-lg mx-4 my-8 border border-gray-100 transform transition-all duration-300 hover:shadow-3xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2"> {t("title")}</h1>
          <p className="text-gray-600">{t("subtitle")}</p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={getMessageStyles()}>
            <div className="flex items-center justify-center space-x-2">
              {message.type === "success" && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {message.type === "error" && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span>{message.text}</span>
            </div>
            {message.type === "success" && countdown > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
              </div>
            )}
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t("form.title")}</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={t("messages.enterTitle")}
              required
            />
          </div>

          {/* Department Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t("form.department")}</label>
            <select
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white"
              value={form.department}
              onChange={(e) =>
    setForm({
      ...form,
      department: e.target.value as DepartmentKey,
      subDepartment: "",
    })
  }
              required
            >
               <option value="" selected disabled>{t("messages.selectDepartment")}</option>
  {Object.entries(departments).map(([key, dept]) => (
    <option key={key} value={key}>
      {dept[language] || dept.am}
    </option>
  ))}
            </select>
          </div>

          {/* Sub-department Dropdown */}
         {form.department &&
  departments[form.department as DepartmentKey].subDepartments.length > 0 && (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {t("form.subDepartment")}
      </label>

      <select
        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white"
        value={form.subDepartment}
        onChange={(e) =>
          setForm({ ...form, subDepartment: e.target.value })
        }
      >
        <option value="" selected disabled>{t("messages.selectSubDepartment")}</option>
        {departments[form.department as DepartmentKey].subDepartments.map(
          (sub, index) => (
            <option key={index} value={sub.am}>
              {sub[language] || sub.am}
            </option>
          )
        )}
      </select>
    </div>
  )}


          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t("form.priority")}</label>
            <select
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              required
            >
              <option value="" selected disabled>{t("messages.selectLevel")}</option>
              {levels.map((lvl) => (
                <option key={lvl.key} value={lvl.key}>
                  {lvl.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t("form.description")}</label>
            <textarea
              className="w-full border border-gray-300 rounded-xl p-3 h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={t("messages.enterDescription")}
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold mt-8 hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] hover:cursor-pointer"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{t("form.submitting")}</span>
            </div>
          ) : (
            `${t("form.submit")}`
          )}
        </button>

        {/* Footer Note */}
        <p className="text-center text-gray-500 text-sm mt-6">
          {t("form.note")}
        </p>
      </form>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </main>
  );
}