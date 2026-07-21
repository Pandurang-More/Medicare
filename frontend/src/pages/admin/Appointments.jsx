import React from 'react';
import { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import StatusBadge from '../../components/shared/StatusBadge';
import { appointmentAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { FaSearch, FaFilter, FaCalendarAlt } from 'react-icons/fa';
import { format } from 'date-fns';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = () => {
    const params = statusFilter ? { status: statusFilter } : {};
    appointmentAPI.getAll(params).then(res => setAppointments(res.data.appointments)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, [statusFilter]);

  const filtered = appointments.filter(a =>
    a.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.doctor?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = async (id, status) => {
    try {
      await appointmentAPI.updateStatus(id, { status });
      toast.success(`Appointment ${status}`);
      load();
    } catch { toast.error('Failed to update'); }
  };

  return (
    <Layout>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Appointments</h1>
        <p className="text-slate-500 font-medium mt-1">Manage all hospital appointments across doctors</p>
      </div>

      <div className="card mb-8 p-2 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/80 shadow-sm flex flex-col sm:flex-row gap-2 animate-fade-in">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input 
            className="input-field pl-12 py-4 text-base bg-transparent border-none rounded-xl focus:ring-0 shadow-none font-medium text-slate-700" 
            placeholder="Search by patient or doctor name..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <div className="relative sm:w-64">
          <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <select 
            className="input-field pl-10 py-4 text-base bg-transparent border-none border-t sm:border-t-0 sm:border-l border-slate-200 rounded-none sm:rounded-r-xl focus:ring-0 shadow-none font-medium text-slate-700" 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card p-0 overflow-hidden border-0 ring-1 ring-slate-200 shadow-sm rounded-2xl animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">Patient</th>
                  <th className="py-4 px-6">Doctor</th>
                  <th className="py-4 px-6">Schedule</th>
                  <th className="py-4 px-6">Reason</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {filtered.map(a => (
                  <tr key={a._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-900">{a.patient?.name}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">Dr. {a.doctor?.name}</div>
                      <div className="text-xs text-primary-600 font-semibold mt-0.5">{a.doctorProfile?.specialization}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 text-xs font-bold whitespace-nowrap">
                        {format(new Date(a.appointmentDate), 'MMM dd, yyyy')} <span className="text-slate-300">|</span> <span className="text-primary-600">{a.timeSlot}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500 max-w-xs truncate text-xs" title={a.reason}>{a.reason}</td>
                    <td className="py-4 px-6"><StatusBadge status={a.status} /></td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2 justify-end">
                        {a.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus(a._id, 'approved')} className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-200/50">Approve</button>
                            <button onClick={() => updateStatus(a._id, 'rejected')} className="text-xs font-bold bg-rose-50 text-rose-700 px-3 py-2 rounded-xl hover:bg-rose-100 transition-colors border border-rose-200/50">Reject</button>
                          </>
                        )}
                        {a.status === 'approved' && (
                          <button onClick={() => updateStatus(a._id, 'completed')} className="text-xs font-bold bg-primary-50 text-primary-700 px-3 py-2 rounded-xl hover:bg-primary-100 transition-colors border border-primary-200/50">Mark Complete</button>
                        )}
                        {(a.status === 'completed' || a.status === 'cancelled' || a.status === 'rejected') && (
                          <span className="text-xs text-slate-400 font-medium italic">No actions available</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr><td colSpan={6} className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <FaCalendarAlt className="text-4xl mb-3 text-slate-300" />
                      <p className="font-medium">No appointments found matching your criteria</p>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}