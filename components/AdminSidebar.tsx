'use client';
import { useState, useEffect } from 'react';
import { FaTachometerAlt, FaChartBar, FaUser, FaSignOutAlt, FaBars, FaTimes, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { usePathname } from 'next/navigation';
import { Preferences } from '@capacitor/preferences';

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
       const pathname = usePathname();
  const [activeItem, setActiveItem] = useState(pathname);
    const router = useRouter();

      const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

  // Load saved login on startup
  useEffect(() => {
    const loadUser = async () => {
      const { value } = await Preferences.get({ key: 'user' });
      if (value) setLoggedInUser(value);
    };
    loadUser();
  }, []);


  // Check screen size and set initial state
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const menuItems = [
    { name: 'Dashboard', icon: <FaTachometerAlt title='Dashboard' />, href: '/admin/dashboard' },
    { name: 'Analytics', icon: <FaChartBar title='Analytics' />, href: '/admin/analytics' },
    { name: 'Profile', icon: <FaUser title='Profile' />, href: '/admin/profile' },
  ];

  const logoutItem = { name: 'Logout', icon: <FaSignOutAlt title='Logout' />, href: '/logout' };
  const handleItemClick = (href: string) => {
    setActiveItem(href);
    if (isMobile) {
      setIsOpen(false); // Close sidebar after click on mobile
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

    const handleLogout = async () => {
    localStorage.removeItem("adminToken");
    await Preferences.remove({ key: 'user' });
    setLoggedInUser(null);
    router.push('/admin/login');
  };

  // Don't render sidebar on mobile when closed, just show the toggle button
  if (isMobile && !isOpen) {
    return (
      <button
        className="fixed lg:top-3 top-11 left-4 z-60 w-10 h-10 bg-linear-to-r from-blue-500 to-purple-600 
                   text-white rounded-xl shadow-2xl flex items-center justify-center
                   hover:scale-110 transition-transform duration-200 lg:hidden"
        onClick={() => setIsOpen(true)}
      >
        <FaBars size={18} />
      </button>
    );
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          ${isOpen ? 'w-64' : 'w-20'} 
          bg-linear-to-b from-gray-900 to-gray-800 h-screen p-5 pt-8 duration-300 ease-in-out
          ${isMobile ? 'fixed left-0 top-0 z-50 shadow-2xl' : 'relative'}
          border-r border-gray-700
        `}
      >
        {/* Toggle Button - Only show on desktop when sidebar is open */}
        {!isMobile && (
          <button
            className={`
              absolute cursor-pointer -right-3 top-9 w-7 h-7 border border-gray-600 
              rounded-full bg-gray-800 text-white flex items-center justify-center
              shadow-lg hover:shadow-xl hover:bg-gray-700 hover:scale-110 transition-all duration-200
              ${!isOpen && 'rotate-180'}
            `}
            onClick={toggleSidebar}
          >
            <FaBars size={14} />
          </button>
        )}

        {/* Close Button - Only show on mobile */}
        {isMobile && (
          <button
            className="absolute cursor-pointer -right-3 top-9 w-7 h-7 border border-gray-600 
                      rounded-full bg-red-500 text-white flex items-center justify-center
                      shadow-lg hover:shadow-xl hover:bg-red-600 hover:scale-110 transition-all duration-200"
            onClick={() => setIsOpen(false)}
          >
            <FaTimes size={14} />
          </button>
        )}

        {/* Logo / Title */}
        <div className="flex items-center gap-x-4">
          <div className="flex items-center justify-center w-10 h-10 bg-linear-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          {isOpen && (
            <div className="text-white">
              <h1 className="text-xl font-bold bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className="text-xs text-gray-400">Management Console</p>
            </div>
          )}
        </div>

        {/* Main Menu Items */}
        <ul className="pt-8 space-y-2 flex-1">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link href={item.href}>
                <div
                  className={`
                    flex items-center gap-x-4 p-3 rounded-xl cursor-pointer 
                    transition-all duration-200 group relative overflow-hidden
                    ${activeItem === item.href 
                      ? 'bg-linear-to-r from-blue-600/20 to-purple-600/20 text-white border-l-4 border-blue-500 shadow-lg' 
                      : 'text-gray-300 hover:text-white'
                    }
                    hover:bg-gray-700/50 hover:scale-105 hover:shadow-md
                  `}
                  onClick={() => handleItemClick(item.href)}
                >
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <span className={`
                    text-lg z-10 transition-transform duration-200 
                    ${activeItem === item.href ? 'text-blue-400 scale-110' : 'group-hover:scale-110'}
                  `}>
                    {item.icon}
                  </span>
                  
                  {isOpen && (
                    <>
                      <span className="text-base font-medium z-10">{item.name}</span>
                      <FaChevronRight 
                        className={`
                          ml-auto text-xs opacity-0 group-hover:opacity-100 
                          transition-all duration-300 transform translate-x-2 group-hover:translate-x-0
                          ${activeItem === item.href && 'opacity-100 translate-x-0'}
                        `} 
                      />
                    </>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* Logout Item - Fixed at bottom */}
        <div className="absolute lg:bottom-5 bottom-8 left-5 right-5 w-full">
          <button onClick={handleLogout} className={` ${isOpen ? 'w-5/6' : 'w-2/3'}`}>
            <div
              className={`
                flex items-center gap-x-4 p-3 rounded-xl cursor-pointer 
                transition-all duration-200 group relative overflow-hidden
                text-gray-300 hover:text-white
                hover:bg-linear-to-r hover:from-red-600/20 hover:to-red-500/20
                border border-transparent hover:border-red-500/30
              `}

            >
              <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <span className={`
                text-lg z-10 transition-transform duration-200 
                group-hover:scale-110 group-hover:text-red-400
              `}>
                {logoutItem.icon}
              </span>
              
              {isOpen && (
                <>
                  <span className="text-base font-medium z-10">{logoutItem.name}</span>
                  <FaChevronRight 
                    className="ml-auto text-xs opacity-0 group-hover:opacity-100 text-red-400
                    transition-all duration-300 transform translate-x-2 group-hover:translate-x-0" 
                  />
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;