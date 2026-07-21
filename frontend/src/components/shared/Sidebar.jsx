import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaHome, FaUserMd, FaCalendarAlt, FaUsers, FaFileMedical,
  FaRobot, FaComments, FaFileAlt, FaSignOutAlt, FaUser,
  FaStethoscope, FaBars, FaTimes, FaHospital
} from 'react-icons/fa';
import { useState } from 'react';

const navItems = {
  admin: [
    { path: '/admin', icon: FaHome, label: 'Dashboard' },
    { path: '/admin/doctors', icon: FaUserMd, label: 'Doctors' },
    { path: '/admin/patients', icon: FaUsers, label: 'Patients' },
    { path: '/admin/appointments', icon: FaCalendarAlt, label: 'Appointments' },
    { path: '/ai/chat', icon: FaComments, label: 'AI Chatbot' }
  ],
  doctor: [
    { path: '/doctor', icon: FaHome, label: 'Dashboard' },
    { path: '/doctor/appointments', icon: FaCalendarAlt, label: 'Appointments' },
    { path: '/doctor/prescriptions', icon: FaFileMedical, label: 'Prescriptions' },
    { path: '/ai/chat', icon: FaComments, label: 'AI Chatbot' }
  ],
  patient: [
    { path: '/patient', icon: FaHome, label: 'Dashboard' },
    { path: '/patient/doctors', icon: FaUserMd, label: 'Find Doctors' },
    { path: '/patient/book', icon: FaCalendarAlt, label: 'Book Appointment' },
    { path: '/patient/appointments', icon: FaCalendarAlt, label: 'My Appointments' },
    { path: '/patient/history', icon: FaFileMedical, label: 'Medical History' },
    { path: '/ai/symptoms', icon: FaStethoscope, label: 'Symptom Checker' },
    { path: '/ai/chat', icon: FaComments, label: 'AI Chatbot' },
    { path: '/ai/report', icon: FaFileAlt, label: 'Report Summarizer' }
  ]
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = navItems[user?.role] || [];
  const roleBadge = { admin: 'Admin', doctor: 'Doctor', patient: 'Patient' };
  const roleColor = { admin: 'bg-purple-50 text-purple-700 ring-1 ring-purple-500/20', doctor: 'bg-primary-50 text-primary-700 ring-1 ring-primary-500/20', patient: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20' };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#f8fafc]/50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-200/60 transition-all">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-2.5 rounded-xl shadow-md shadow-primary-500/20">
          <FaHospital className="text-xl" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-xl tracking-tight leading-tight">MediCare</h1>
          <div className="mt-1">
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${roleColor[user?.role]}`}>
              {roleBadge[user?.role]}
            </span>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-6 py-5 border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white ring-1 ring-slate-200 shadow-sm rounded-full flex items-center justify-center">
            <img 
              src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=e0e7ff&color=4f46e5&rounded=true`} 
              alt="Avatar" 
              className="w-10 h-10 rounded-full"
            />
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-slate-900 text-sm truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 font-medium truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {items.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-500/10'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm ring-1 ring-transparent hover:ring-slate-200'
              }`}
            >
              <Icon className={`${active ? 'text-primary-600' : 'text-slate-400'} text-lg`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-4 py-5 border-t border-slate-200/60 space-y-1.5 bg-slate-50">
        <Link
          to="/profile"
          className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm ring-1 ring-transparent hover:ring-slate-200 transition-all duration-200"
        >
          <FaUser className="text-slate-400 text-lg" /> Profile
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 ring-1 ring-transparent hover:ring-rose-200 transition-all duration-200"
        >
          <FaSignOutAlt className="text-lg" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md p-2 rounded-lg ring-1 ring-slate-200"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <FaTimes className="text-slate-600" /> : <FaBars className="text-slate-600" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <div className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200/60 h-screen sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <SidebarContent />
      </div>
    </>
  );
}