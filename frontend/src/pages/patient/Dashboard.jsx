import React from 'react';
import { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import StatCard from '../../components/shared/Statcard';
import StatusBadge from '../../components/shared/StatusBadge';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { appointmentAPI, prescriptionAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { FaCalendarAlt, FaCheckCircle, FaFileMedical, FaStethoscope } from 'react-icons/fa';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([appointmentAPI.getAll(), prescriptionAPI.getAll()])
      .then(([a, p]) => { setAppointments(a.data.appointments); setPrescriptions(p.data.prescriptions); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const upcoming = appointments.filter(a => ['pending', 'approved'].includes(a.status));
  const completed = appointments.filter(a => a.status === 'completed');

  return (
    <Layout>
      <div className="mb-10 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome, {user?.name}!</h1>
        <p className="text-slate-500 font-medium mt-1">Your personal health dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Appointments" value={appointments.length} icon={FaCalendarAlt} color="blue" />
        <StatCard title="Upcoming" value={upcoming.length} icon={FaCalendarAlt} color="yellow" />
        <StatCard title="Completed" value={completed.length} icon={FaCheckCircle} color="green" />
        <StatCard title="Prescriptions" value={prescriptions.length} icon={FaFileMedical} color="purple" />
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming appointments */}
          <div className="card h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-slate-900 text-lg tracking-tight">Upcoming Appointments</h2>
              <Link to="/patient/appointments" className="text-primary-600 font-semibold text-sm hover:text-primary-700 hover:underline transition-colors">View all</Link>
            </div>
            {upcoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-slate-300">
                  <FaCalendarAlt className="text-3xl" />
                </div>
                <p className="text-slate-500 font-medium mb-5">No upcoming appointments</p>
                <Link to="/patient/book" className="btn-primary text-sm shadow-primary-500/20">Book Now</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcoming.slice(0, 4).map(a => (
                  <div key={a._id} className="p-4 bg-white rounded-xl flex items-center justify-between ring-1 ring-slate-100 hover:shadow-md hover:ring-primary-500/20 transition-all duration-300 group">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm group-hover:text-primary-700 transition-colors">Dr. {a.doctor?.name}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{format(new Date(a.appointmentDate), 'MMM dd, yyyy')} at {a.timeSlot}</p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{a.reason}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent prescriptions */}
          <div className="card h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-slate-900 text-lg tracking-tight">Recent Prescriptions</h2>
              <Link to="/patient/history" className="text-primary-600 font-semibold text-sm hover:text-primary-700 hover:underline transition-colors">View all</Link>
            </div>
            {prescriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 h-[calc(100%-4rem)]">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-slate-300">
                  <FaFileMedical className="text-3xl" />
                </div>
                <p className="text-slate-500 font-medium">No prescriptions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {prescriptions.slice(0, 4).map(p => (
                  <div key={p._id} className="p-4 bg-white rounded-xl ring-1 ring-slate-100 hover:shadow-md hover:ring-primary-500/20 transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-slate-900 text-sm group-hover:text-primary-700 transition-colors line-clamp-1 pr-4">{p.diagnosis}</p>
                      <p className="text-xs font-medium text-slate-400 shrink-0">{format(new Date(p.createdAt), 'MMM dd, yyyy')}</p>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mb-3">Dr. {p.doctor?.name}</p>
                    <div className="flex gap-2 flex-wrap">
                      {p.medicines.slice(0, 3).map((m, i) => (
                        <span key={i} className="text-[11px] font-semibold bg-primary-50 text-primary-700 px-2.5 py-1 rounded-md border border-primary-100/50">
                          {m.name}
                        </span>
                      ))}
                      {p.medicines.length > 3 && (
                        <span className="text-[11px] font-semibold bg-slate-50 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200">
                          +{p.medicines.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="card lg:col-span-2">
            <h2 className="font-bold text-slate-900 text-lg tracking-tight mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {[
                { to: '/patient/book', icon: FaCalendarAlt, label: 'Book Appointment', color: 'primary' },
                { to: '/patient/doctors', icon: FaStethoscope, label: 'Find Doctors', color: 'emerald' },
                { to: '/ai/symptoms', icon: FaStethoscope, label: 'Symptom Checker', color: 'purple' },
                { to: '/ai/chat', icon: FaStethoscope, label: 'AI Chatbot', color: 'amber' }
              ].map(({ to, icon: Icon, label, color }) => (
                <Link key={to} to={to} className={`p-6 rounded-2xl text-center hover:-translate-y-1 hover:shadow-lg transition-all duration-300 bg-${color}-50/50 ring-1 ring-${color}-500/20 hover:bg-${color}-50 group`}>
                  <div className={`w-14 h-14 mx-auto bg-white rounded-2xl shadow-sm ring-1 ring-${color}-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`text-${color}-600 text-2xl`} />
                  </div>
                  <p className={`text-${color}-700 text-sm font-semibold tracking-wide`}>{label}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}