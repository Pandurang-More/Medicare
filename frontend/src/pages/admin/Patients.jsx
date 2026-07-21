import React from 'react';
import { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { userAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { FaSearch, FaUser, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { format } from 'date-fns';

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    userAPI.getAll({ role: 'patient' }).then(res => setPatients(res.data.users)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = async (id, current) => {
    try {
      await userAPI.updateStatus(id, { isActive: !current });
      toast.success('Status updated');
      load();
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <Layout>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Patients</h1>
        <p className="text-slate-500 font-medium mt-1">Manage registered patients and accounts</p>
      </div>

      <div className="card mb-8 p-2 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/80 shadow-sm animate-fade-in">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input 
            className="input-field pl-12 py-4 text-base bg-transparent border-none rounded-xl focus:ring-0 shadow-none font-medium text-slate-700" 
            placeholder="Search patients by name or email..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card p-0 overflow-hidden border-0 ring-1 ring-slate-200 shadow-sm rounded-2xl animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">Patient Info</th>
                  <th className="py-4 px-6">Contact Details</th>
                  <th className="py-4 px-6">Gender</th>
                  <th className="py-4 px-6">Registered On</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {filtered.map(p => (
                  <tr key={p._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm ring-1 ring-emerald-100 group-hover:scale-110 transition-transform">
                          <FaUser className="text-sm" />
                        </div>
                        <span className="font-bold text-slate-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-slate-800">{p.email}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{p.phone || 'No phone provided'}</div>
                    </td>
                    <td className="py-4 px-6 capitalize">{p.gender || '-'}</td>
                    <td className="py-4 px-6">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 text-xs font-bold">
                        {format(new Date(p.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${p.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' : 'bg-rose-50 text-rose-700 border-rose-200/50'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button onClick={() => toggleStatus(p._id, p.isActive)} title={p.isActive ? 'Deactivate' : 'Activate'} className={`text-2xl transition-colors ${p.isActive ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 hover:text-slate-400'}`}>
                        {p.isActive ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr><td colSpan={6} className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <FaUser className="text-4xl mb-3 text-slate-300" />
                      <p className="font-medium">No patients found matching your search</p>
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