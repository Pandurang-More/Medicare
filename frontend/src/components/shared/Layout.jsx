import React from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#f8fafc] relative overflow-hidden text-slate-800">
      {/* Subtle global background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-200/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[600px] h-[600px] bg-emerald-200/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Sidebar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto lg:ml-0 relative z-10 w-full scroll-smooth">
        <div className="p-6 lg:p-10 max-w-[1600px] mx-auto min-h-full flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}