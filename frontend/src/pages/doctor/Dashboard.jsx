import React from 'react';
import { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import StatCard from '../../components/shared/Statcard';
import StatusBadge from '../../components/shared/StatusBadge';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { appointmentAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaUsers } from 'react-icons/fa';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentAPI.getAll().then(res => setAppointments(res.data.appointments)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const pending = appointments.filter(a => a.status === 'pending').length;
  const approved = appointments.filter(a => a.status === 'approved').length;
  const completed = appointments.filter(a => a.status === 'completed').length;
  const today = appointments.filter(a => {
    const d = new Date(a.appointmentDate);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  return (
    <Layout>
      <div className="mb-10 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome, Dr. {user?.name}</h1>
        <p className="text-slate-500 font-medium mt-1">Here's your daily appointment overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Appointments" value={appointments.length} icon={FaCalendarAlt} color="blue" />
        <StatCard title="Pending" value={pending} icon={FaClock} color="yellow" />
        <StatCard title="Approved" value={approved} icon={FaCheckCircle} color="green" />
        <StatCard title="Today" value={today.length} icon={FaUsers} color="purple" />
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's appointments */}
          <div className="card h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-slate-900 text-lg tracking-tight">Today's Appointments</h2>
              <Link to="/doctor/appointments" className="text-primary-600 font-semibold text-sm hover:text-primary-700 hover:underline transition-colors">View all</Link>
            </div>
            {today.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-slate-300">
                  <FaCalendarAlt className="text-3xl" />
                </div>
                <p className="text-slate-500 font-medium">No appointments today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {today.map(a => (
                  <div key={a._id} className="p-4 bg-white rounded-xl flex items-center justify-between ring-1 ring-slate-100 hover:shadow-md hover:ring-primary-500/20 transition-all duration-300 group">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm group-hover:text-primary-700 transition-colors">{a.patient?.name}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{a.timeSlot} • <span className="text-slate-400 font-normal">{a.reason}</span></p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending appointments */}
          <div className="card h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-slate-900 text-lg tracking-tight">Pending Approvals</h2>
              <span className="bg-amber-50 border border-amber-200/50 text-amber-700 text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm">{pending} pending</span>
            </div>
            <div className="space-y-4">
              {appointments.filter(a => a.status === 'pending').slice(0, 5).map(a => (
                <div key={a._id} className="p-4 bg-amber-50/50 rounded-xl flex items-center justify-between ring-1 ring-amber-100/50 hover:bg-white hover:shadow-md hover:ring-amber-200 transition-all duration-300 group">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{a.patient?.name}</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{format(new Date(a.appointmentDate), 'MMM dd')} at {a.timeSlot}</p>
                  </div>
                  <Link to="/doctor/appointments" className="text-xs font-semibold bg-primary-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-primary-700 hover:shadow active:scale-95 transition-all duration-200">Review</Link>
                </div>
              ))}
              {pending === 0 && (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 h-[calc(100%-4rem)]">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-slate-300">
                    <FaClock className="text-3xl" />
                  </div>
                  <p className="text-slate-500 font-medium">No pending requests</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}