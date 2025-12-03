'use client';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FaUser, FaLock, FaEye, FaEyeSlash, FaSave, FaKey, 
  FaCheckCircle, FaExclamationTriangle, FaUserEdit, FaShieldAlt,
  FaPaperPlane,
  FaRocket,
  FaAward,
  FaStar
} from 'react-icons/fa';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { FiUser, FiShield, FiCheck, FiAlertCircle } from 'react-icons/fi';
import {jwtDecode} from "jwt-decode";

interface AdminToken {
  id: string;
  username: string;
  exp: number;
  iat: number;
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const [token, setToken] = useState<string>('');
  const [username, setUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [id, setId] = useState('');
  const [isHovered, setIsHovered] = useState<string | null>(null);

  // Fetch token
  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken') || '';

    if (storedToken) {
      const decoded = jwtDecode<AdminToken>(storedToken);
      setId(decoded.id);
      setToken(storedToken);

      // Fetch username from DB instead of token
      fetch(`/api/admin/profile?id=${decoded.id}`)
        .then(res => res.json())
        .then(data => setUsername(data.username));
    }
  }, []);

  // Update username
  async function updateUsername(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch(`/api/admin/profile?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Store new token
      localStorage.setItem("adminToken", data.token);

      // Decode new token and update UI
      const decoded = jwtDecode<AdminToken>(data.token);
      setUsername(decoded.username);
      setId(decoded.id);

      setMessage(t('profile.usernameUpdated'));

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Change password
  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError(t('profile.passwordsDoNotMatch'));
      return;
    }
    if (newPassword.length < 6) {
      setError(t('profile.passwordMinLength'));
      return;
    }
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch(`/api/admin/profile/password?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t('profile.failed'));
      setMessage(t('profile.passwordChanged'));
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <main className="relative min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-indigo-50 to-purple-100 text-slate-800 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md mx-4 border border-white/20 text-center transform transition-all duration-500 hover:shadow-3xl">
          <div className="w-20 h-20 bg-linear-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FaUser className="text-white text-2xl" />
          </div>
          <h2 className="text-2xl font-bold bg-linear-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent mb-3">
            {t('profile.accessRequired')}
          </h2>
          <p className="text-gray-600 mb-6">{t('profile.loginPrompt')}</p>
          <button
            onClick={() => window.location.href = '/admin/login'}
            className="group relative bg-linear-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-500 hover:scale-105 hover:shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <span className="relative z-10">{t('profile.goToLogin')}</span>
          </button>
        </div>
      </main>
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
                  <FiUser className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="lg:ml-3 ml-15">
                <h1 className="text-xl font-bold lg:text-gray-900">{t('profile.title')}</h1>
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

      <section className="relative z-10 max-w-6xl mx-auto p-4 py-8 sm:p-6 lg:px-8 lg:py-10 mt-20 lg:mt-10">
        {/* Enhanced Header */}
        <div className="flex flex-col justify-start mb-12">
          <h2 className="sm:text-2xl text-lg font-bold text-gray-900">
            {t('profile.profileSettings')}
          </h2>
          <p className="text-gray-600 mt-1 sm:text-md text-sm">
            {t('profile.manageAccount')}
          </p>
        </div>

        {/* Enhanced Alerts */}
        {message && (
          <div className="flex items-center p-6 mb-8 bg-linear-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-lg animate-fade-in">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
              <FiCheck className="text-green-600 text-xl" />
            </div>
            <span className="text-green-800 font-semibold text-lg">{message}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center p-6 mb-8 bg-linear-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl shadow-lg animate-fade-in">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
              <FiAlertCircle className="text-red-600 text-xl" />
            </div>
            <span className="text-red-800 font-semibold text-lg">{error}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Enhanced Profile Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 transform transition-all duration-500 hover:shadow-3xl">
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <FaUserEdit className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{t('profile.profileInformation')}</h2>
                <p className="text-gray-500">{t('profile.updateUsername')}</p>
              </div>
            </div>

            <form onSubmit={updateUsername} className="space-y-6">
              <div className="space-y-3">
                <label className="flex items-center text-lg font-semibold text-gray-700 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                    <FaUser className="text-blue-600" />
                  </div>
                  {t('profile.username')}
                </label>
                <div className="relative group">
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm shadow-inner text-lg font-medium group-hover:border-blue-300"
                    placeholder={t('profile.username')}
                    required
                  />
                  <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                onMouseEnter={() => setIsHovered('profile')}
                onMouseLeave={() => setIsHovered(null)}
                className="group relative w-full bg-linear-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-bold hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 hover:scale-105 hover:shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative z-10 flex items-center justify-center space-x-3">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-lg font-semibold">{t('profile.saving')}</span>
                    </>
                  ) : (
                    <>
                      <FaSave className="text-lg transition-transform group-hover:scale-110" />
                      <span className="text-lg font-semibold">{t('profile.saveChanges')}</span>
                    </>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </button>
            </form>
          </div>

          {/* Enhanced Password Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 transform transition-all duration-500 hover:shadow-3xl">
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 bg-linear-to-br from-rose-500 to-orange-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <FiShield className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{t('profile.securitySettings')}</h2>
                <p className="text-gray-500">{t('profile.changePassword')}</p>
              </div>
            </div>

            <form onSubmit={changePassword} className="space-y-6">
              {/* Current Password */}
              <EnhancedPasswordInput
                label={t('profile.currentPassword')}
                value={oldPassword}
                show={showOldPassword}
                setShow={setShowOldPassword}
                onChange={setOldPassword}
                icon={<FaLock className="text-rose-600" />}
              />
              
              {/* New Password */}
              <EnhancedPasswordInput
                label={t('profile.newPassword')}
                value={newPassword}
                show={showNewPassword}
                setShow={setShowNewPassword}
                onChange={setNewPassword}
                icon={<FaKey className="text-orange-600" />}
                strengthMsg={{
                  good: t('profile.passwordStrengthGood'),
                  min: t('profile.passwordMinLength')
                }}
              />
              
              {/* Confirm Password */}
              <EnhancedPasswordInput
                label={t('profile.confirmPassword')}
                value={confirmPassword}
                show={showConfirmPassword}
                setShow={setShowConfirmPassword}
                onChange={setConfirmPassword}
                icon={<FaCheckCircle className="text-green-600" />}
                match={newPassword}
                matchMsg={{
                  match: t('profile.passwordsMatch'),
                  notMatch: t('profile.passwordsDoNotMatch')
                }}
              />

              <button
                type="submit"
                disabled={loading || newPassword !== confirmPassword || newPassword.length < 6}
                onMouseEnter={() => setIsHovered('password')}
                onMouseLeave={() => setIsHovered(null)}
                className="group relative w-full bg-linear-to-r from-rose-500 to-orange-500 text-white py-4 px-6 rounded-2xl font-bold hover:from-rose-600 hover:to-orange-600 focus:ring-4 focus:ring-rose-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 hover:scale-105 hover:shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative z-10 flex items-center justify-center space-x-3">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-lg font-semibold">{t('profile.updating')}</span>
                    </>
                  ) : (
                    <>
                      <FaKey className="text-lg transition-transform group-hover:scale-110" />
                      <span className="text-lg font-semibold">{t('profile.changePassword')}</span>
                    </>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </button>
            </form>
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

// Enhanced Password Input Component
function EnhancedPasswordInput({
  label,
  value,
  show,
  setShow,
  onChange,
  icon,
  strengthMsg,
  match,
  matchMsg
}: any) {
  return (
    <div className="space-y-3">
      <label className="flex items-center text-lg font-semibold text-gray-700">
        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-3">
          {icon}
        </div>
        {label}
      </label>
      <div className="relative group">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm shadow-inner text-lg font-medium group-hover:border-blue-300 pr-12"
          placeholder={label}
          required
        />
        <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300 hover:scale-110"
        >
          {show ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
        </button>
      </div>
      {strengthMsg && value && (
        <p className={`text-sm font-medium ${value.length >= 6 ? 'text-green-600' : 'text-amber-600'} flex items-center space-x-2`}>
          {value.length >= 6 ? (
            <FiCheck className="text-green-500" />
          ) : (
            <FiAlertCircle className="text-amber-500" />
          )}
          <span>{value.length >= 6 ? strengthMsg.good : strengthMsg.min}</span>
        </p>
      )}
      {matchMsg && value && (
        <p className={`text-sm font-medium ${value === match && value.length >= 6 ? 'text-green-600' : 'text-red-600'} flex items-center space-x-2`}>
          {value === match && value.length >= 6 ? (
            <FiCheck className="text-green-500" />
          ) : (
            <FiAlertCircle className="text-red-500" />
          )}
          <span>{value === match && value.length >= 6 ? matchMsg.match : matchMsg.notMatch}</span>
        </p>
      )}
    </div>
  );
}