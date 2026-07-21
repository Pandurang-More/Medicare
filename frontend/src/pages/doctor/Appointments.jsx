import React from 'react';
import { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import StatusBadge from '../../components/shared/StatusBadge';
import { appointmentAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { FaFileMedical, FaUserInjured, FaCalendarAlt } from 'react-icons/fa';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = () => {
    const params = filter !== 'all' ? { status: filter } : {};
    appointmentAPI.getAll(params).then(res => setAppointments(res.data.appointments)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await appointmentAPI.updateStatus(id, { status });
      toast.success(`Appointment ${status}`);
      load();
    } catch { toast.error('Failed to update'); }
  };

  const tabs = ['all', 'pending', 'approved', 'completed', 'cancelled'];

  return (
    <Layout>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Appointments</h1>
        <p className="text-slate-500 font-medium mt-1">Manage patient appointments and consultations</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8 flex-nowrap overflow-x-auto pb-2 scrollbar-hide animate-fade-in">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold capitalize transition-all duration-300 whitespace-nowrap border-2 ${filter === tab ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/30' : 'bg-white text-slate-600 border-transparent hover:border-slate-200 shadow-sm'}`}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-4 animate-fade-in">
          {appointments.map(a => (
            <div key={a._id} className="card p-6 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group ring-1 ring-slate-200 border-0 hover:ring-primary-200">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                
                <div className="flex items-start gap-5 flex-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-primary-100 rounded-2xl flex items-center justify-center text-primary-600 shadow-inner group-hover:scale-105 transition-transform">
                    <FaUserInjured className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xl group-hover:text-primary-700 transition-colors">{a.patient?.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm font-medium text-slate-500">
                      <span>{a.patient?.email}</span>
                      {a.patient?.phone && (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          <span>{a.patient?.phone}</span>
                        </>
                      )}
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-lg font-bold border border-primary-100 flex items-center gap-2">
                          <FaCalendarAlt /> {format(new Date(a.appointmentDate), 'EEEE, MMM dd, yyyy')} <span className="text-primary-300">|</span> {a.timeSlot}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mt-3">
                        <p className="text-sm font-medium text-slate-700"><span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mr-2">Reason</span>{a.reason}</p>
                        {a.symptoms?.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-200/60 flex gap-2 flex-wrap">
                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] self-center">Symptoms</span>
                            {a.symptoms.map((sym, i) => (
                              <span key={i} className="bg-white px-2 py-0.5 rounded border border-slate-200 text-xs font-semibold text-slate-600">{sym}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col items-center justify-between sm:items-end gap-3 sm:w-48 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-5">
                  <StatusBadge status={a.status} />
                  
                  <div className="flex flex-col gap-2 w-full mt-auto">
                    {a.status === 'pending' && (
                      <div className="flex gap-2 w-full">
                        <button onClick={() => updateStatus(a._id, 'approved')} className="flex-1 text-xs bg-emerald-50 text-emerald-700 py-2.5 rounded-xl hover:bg-emerald-100 font-bold border border-emerald-200/50 transition-colors">Approve</button>
                        <button onClick={() => updateStatus(a._id, 'rejected')} className="flex-1 text-xs bg-rose-50 text-rose-700 py-2.5 rounded-xl hover:bg-rose-100 font-bold border border-rose-200/50 transition-colors">Reject</button>
                      </div>
                    )}
                    {a.status === 'approved' && (
                      <Link to={`/doctor/prescriptions/new/${a._id}`}
                        className="w-full text-sm bg-primary-600 text-white py-2.5 rounded-xl hover:bg-primary-700 font-bold flex items-center justify-center gap-2 shadow-md shadow-primary-500/20 transition-colors">
                        <FaFileMedical /> Write Prescription
                      </Link>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ))}
          {!appointments.length && (
            <div className="flex flex-col items-center justify-center py-20 px-4 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-slate-400">
              <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                <FaCalendarAlt className="text-4xl text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">No appointments found</h3>
              <p className="text-sm font-medium">Try changing your filter settings</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}