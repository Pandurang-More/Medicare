import React from 'react';
import { Link } from 'react-router-dom';
import { FaHospital, FaUserMd, FaCalendarCheck, FaRobot, FaShieldAlt, FaChartBar, FaFileMedical } from 'react-icons/fa';

export default function Landing() {
  const features = [
    { icon: FaUserMd, title: 'Expert Doctors', desc: 'Browse and book appointments with verified specialists across all departments.' },
    { icon: FaCalendarCheck, title: 'Easy Scheduling', desc: 'Book, manage, and track your appointments seamlessly online.' },
    { icon: FaRobot, title: 'AI-Powered Tools', desc: 'Symptom checker, health chatbot, and prescription explanations powered by AI.' },
    { icon: FaFileMedical, title: 'Medical Records', desc: 'Access and download your complete medical history anytime.', },
    { icon: FaShieldAlt, title: 'Secure & Private', desc: 'Your health data is protected with enterprise-grade security.' },
    { icon: FaChartBar, title: 'Analytics Dashboard', desc: 'Real-time analytics for admins to monitor hospital operations.' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 relative overflow-hidden to-[#f8fafc]">
      {/* Decorative background shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/40 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[40%] bg-emerald-200/40 rounded-full blur-3xl opacity-60" />

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/50 shadow-sm transition-all">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-2.5 rounded-xl shadow-sm shadow-primary-500/20"><FaHospital className="text-xl" /></div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">MediCare</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="btn-secondary text-sm px-6">Login</Link>
          <Link to="/register" className="btn-primary text-sm px-6 shadow-primary-500/30">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-5xl mx-auto text-center px-8 pt-24 pb-20 z-10">
        <span className="inline-block bg-primary-50 border border-primary-200 text-primary-700 px-5 py-2 rounded-full text-sm font-semibold tracking-wide shadow-sm mb-8">
          ✨ AI-Powered Hospital Management
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          Healthcare Made <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-emerald-500">
            Simple & Smart
          </span>
        </h1>
        <p className="mt-8 text-lg font-medium text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Complete hospital management with AI-powered symptom checking, instant appointments, and intelligent prescriptions.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/register" className="btn-primary text-base px-10 py-3.5 shadow-lg shadow-primary-500/30 hover:-translate-y-0.5">Start Free Today</Link>
          <Link to="/login" className="btn-secondary text-base px-10 py-3.5 hover:-translate-y-0.5">Login →</Link>
        </div>
      </section>

      {/* Features */}
      <section className="relative max-w-6xl mx-auto px-8 py-20 z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Everything You Need</h2>
          <p className="text-slate-500 mt-4 max-w-2xl mx-auto font-medium">All the tools required to manage a modern hospital efficiently.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card group hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-primary-500/10 group-hover:scale-110 transition-transform duration-300">
                <Icon className="text-primary-600 text-2xl" />
              </div>
              <h3 className="font-bold text-slate-900 text-xl mb-3">{title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="relative bg-slate-900 py-24 px-8 mt-12 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-full bg-gradient-to-b from-primary-900/50 to-transparent blur-3xl opacity-50" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-bold text-white tracking-tight mb-16">Built for Everyone</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { role: 'Patients', desc: 'Book appointments, view history, chat with AI assistant' },
              { role: 'Doctors', desc: 'Manage appointments, write prescriptions, view patient records' },
              { role: 'Admins', desc: 'Full hospital control with analytics and staff management' }
            ].map(({ role, desc }) => (
              <div key={role} className="bg-slate-800/80 backdrop-blur-sm ring-1 ring-white/10 rounded-2xl p-8 text-white hover:bg-slate-800 transition-colors duration-300">
                <h3 className="font-bold text-2xl mb-4">{role}</h3>
                <p className="text-slate-400 font-medium leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 bg-white border-t border-slate-200">
        <p className="text-slate-500 font-medium">© 2026 MediCare Hospital Management System. Built with MERN Stack + AI.</p>
      </footer>
    </div>
  );
}