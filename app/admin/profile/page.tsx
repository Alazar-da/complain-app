'use client';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FaUser, FaLock, FaEye, FaEyeSlash, FaSave, FaKey, 
  FaCheckCircle, FaExclamationTriangle, FaUserEdit, FaShieldAlt 
} from 'react-icons/fa';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { FiUser } from 'react-icons/fi';
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
      <main className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 text-slate-800">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md mx-4">
          <FaUser className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('profile.accessRequired')}</h2>
          <p className="text-gray-600">{t('profile.loginPrompt')}</p>
        </div>
      </main>
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
                      <h1 className="text-xl font-bold lg:text-gray-900">{t('profile.title')}</h1>
                    </div>
                </div>
              </div>
            </header>
      
      
              <section className="relative p-4 py-6 sm:p-6 lg:px-8 lg:py-10 mt-20 lg:mt-0">
           {/* Language Switcher */}
              <section className="fixed lg:top-3.5 top-12 right-5 z-50">
          <LanguageSwitcher />
        </section>

      <div className="max-w-4xl mx-auto">
  

        {/* Header */}
        <div className="mb-8">
           <h2 className="sm:text-2xl text-lg font-bold text-gray-900"> {t('profile.profileSettings')}
          </h2>
          <p className="text-gray-600 mt-1 sm:text-md text-sm">{t('profile.manageAccount')}</p>
        </div>

        {/* Alerts */}
        {message && (
          <div className="flex items-center p-4 mb-6 bg-green-50 border border-green-200 rounded-xl shadow-sm">
            <FaCheckCircle className="text-green-500 text-xl mr-3" />
            <span className="text-green-700 font-medium">{message}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center p-4 mb-6 bg-red-50 border border-red-200 rounded-xl shadow-sm">
            <FaExclamationTriangle className="text-red-500 text-xl mr-3" />
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-linear-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <FaUserEdit className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{t('profile.profileInformation')}</h2>
                <p className="text-gray-500 text-sm">{t('profile.updateUsername')}</p>
              </div>
            </div>

            <form onSubmit={updateUsername} className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FaUser className="mr-2 text-gray-400" />
                  {t('profile.username')}
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder={t('profile.username')}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 flex items-center justify-center hover:cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {t('profile.saving')}
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    {t('profile.saveChanges')}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Password Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-linear-to-r from-rose-500 to-orange-500 rounded-xl flex items-center justify-center mr-4">
                <FaShieldAlt className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{t('profile.securitySettings')}</h2>
                <p className="text-gray-500 text-sm">{t('profile.changePassword')}</p>
              </div>
            </div>

            <form onSubmit={changePassword} className="space-y-4">
              {/* Current Password */}
              <PasswordInput
                label={t('profile.currentPassword')}
                value={oldPassword}
                show={showOldPassword}
                setShow={setShowOldPassword}
                onChange={setOldPassword}
              />
              {/* New Password */}
              <PasswordInput
                label={t('profile.newPassword')}
                value={newPassword}
                show={showNewPassword}
                setShow={setShowNewPassword}
                onChange={setNewPassword}
                strengthMsg={{
                  good: t('profile.passwordStrengthGood'),
                  min: t('profile.passwordMinLength')
                }}
              />
              {/* Confirm Password */}
              <PasswordInput
                label={t('profile.confirmPassword')}
                value={confirmPassword}
                show={showConfirmPassword}
                setShow={setShowConfirmPassword}
                onChange={setConfirmPassword}
                match={newPassword}
                matchMsg={{
                  match: t('profile.passwordsMatch'),
                  notMatch: t('profile.passwordsDoNotMatch')
                }}
              />

              <button
                type="submit"
                disabled={loading || newPassword !== confirmPassword || newPassword.length < 6}
                className="w-full bg-linear-to-r from-rose-600 to-orange-600 text-white py-3 px-4 rounded-xl font-medium hover:from-rose-700 hover:to-orange-700 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 flex items-center justify-center hover:cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {t('profile.updating')}
                  </>
                ) : (
                  <>
                    <FaKey className="mr-2" />
                    {t('profile.changePassword')}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">{t('profile.needHelp')}</div>
      </div>
      </section>
    </main>
  );
}

// Reusable Password Input component
function PasswordInput({
  label,
  value,
  show,
  setShow,
  onChange,
  strengthMsg,
  match,
  matchMsg
}: any) {
  return (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-medium text-gray-700">
        <FaLock className="mr-2 text-gray-400" />
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
          placeholder={label}
          required
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {show ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {strengthMsg && value && (
        <p className={`text-xs ${value.length >= 6 ? 'text-green-600' : 'text-amber-600'}`}>
          {value.length >= 6 ? strengthMsg.good : strengthMsg.min}
        </p>
      )}
      {matchMsg && value && (
        <p className={`text-xs ${value === match && value.length >= 6 ? 'text-green-600' : 'text-red-600'}`}>
          {value === match && value.length >= 6 ? matchMsg.match : matchMsg.notMatch}
        </p>
      )}
    </div>
  );
}
