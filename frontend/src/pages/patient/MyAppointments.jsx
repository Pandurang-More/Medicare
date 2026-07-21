import React from 'react';
import { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import StatusBadge from '../../components/shared/StatusBadge';
import { appointmentAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FaCalendarAlt, FaStethoscope } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = () => {
    const params = filter !== 'all' ? { status: filter } : {};
    appointmentAPI.getAll(params).then(res => setAppointments(res.data.appointments)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const cancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await appointmentAPI.cancel(id);
      toast.success('Appointment cancelled');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to cancel'); }
  };

  const tabs = ['all', 'pending', 'approved', 'completed', 'cancelled'];

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 animate-fade-in">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Appointments</h1>
          <p className="text-slate-500 font-medium mt-1">Track and manage your medical appointments</p>
        </div>
        <Link to="/patient/book" className="btn-primary shadow-primary-500/20 text-sm py-2.5 px-6">+ Book New</Link>
      </div>

      <div className="flex gap-3 mb-8 flex-wrap animate-fade-in">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold capitalize transition-all duration-300 ${filter === tab ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20 ring-1 ring-primary-600' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:ring-slate-300'}`}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-5 animate-fade-in">
          {appointments.map(a => (
            <div key={a._id} className="card p-6 rounded-2xl ring-1 ring-slate-100 hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 shadow-sm ring-1 ring-primary-100/50">
                      <FaStethoscope className="text-2xl" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg">Dr. {a.doctor?.name}</p>
                      <p className="text-sm font-medium text-primary-600">{a.doctorProfile?.specialization}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-slate-400 font-medium text-xs mb-1 uppercase tracking-wider">Date & Time</p>
                      <p className="font-semibold text-slate-800">{format(new Date(a.appointmentDate), 'EEEE, MMM dd, yyyy')}</p>
                      <p className="text-slate-600">{a.timeSlot}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-slate-400 font-medium text-xs mb-1 uppercase tracking-wider">Reason & Notes</p>
                      <p className="font-semibold text-slate-800 line-clamp-1">{a.reason}</p>
                      <p className="text-slate-500 line-clamp-1 truncate">{a.notes || 'No notes provided'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 md:w-48 pl-4 md:border-l md:border-slate-100">
                  <StatusBadge status={a.status} />
                  {a.fee && <p className="text-lg font-bold text-slate-900 flex items-center gap-1"><span className="text-slate-400 text-sm font-medium">Fee</span> ₹{a.fee}</p>}
                  {['pending', 'approved'].includes(a.status) && (
                    <button onClick={() => cancel(a._id)} className="text-sm font-semibold text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-lg transition-colors w-full md:w-auto">
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {!appointments.length && (
            <div className="flex flex-col items-center justify-center py-20 px-4 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
              <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6 text-slate-200">
                <FaCalendarAlt className="text-5xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No appointments found</h3>
              <p className="text-slate-500 font-medium mb-8 text-center max-w-sm">You don't have any appointments matching the current filter criteria.</p>
              <Link to="/patient/book" className="btn-primary shadow-primary-500/20 px-8 py-3 text-base">Book Your First Appointment</Link>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}