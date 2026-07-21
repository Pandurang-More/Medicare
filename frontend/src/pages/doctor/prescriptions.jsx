import React from 'react';
import { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { prescriptionAPI } from '../../utils/api';
import { format } from 'date-fns';
import { FaFileMedical, FaUserInjured, FaCalendarCheck, FaNotesMedical, FaRobot } from 'react-icons/fa';

export default function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prescriptionAPI.getAll().then(res => setPrescriptions(res.data.prescriptions)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Prescriptions</h1>
        <p className="text-slate-500 font-medium mt-1">Manage and review prescriptions you've written</p>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 animate-fade-in">
          {prescriptions.map(p => (
            <div key={p._id} className="card p-6 rounded-2xl flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border-0 ring-1 ring-slate-200 hover:ring-primary-300">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-primary-100 rounded-2xl flex items-center justify-center text-primary-600 shadow-sm group-hover:scale-105 transition-transform shrink-0">
                    <FaNotesMedical className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-primary-700 transition-colors">{p.patient?.name}</h3>
                    <p className="text-sm font-semibold text-primary-600 mb-1">{p.diagnosis}</p>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 text-xs font-bold mt-1">
                      {format(new Date(p.createdAt), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 mt-2">
                <div className="mb-4">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Prescribed Medicines</p>
                  <div className="flex flex-wrap gap-2">
                    {p.medicines.map((m, i) => (
                      <span key={i} className="bg-primary-50 text-primary-700 border border-primary-100/50 text-xs font-bold px-3 py-1.5 rounded-lg">
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-3 pt-4 border-t border-slate-100">
                {p.followUpDate && (
                  <div className="flex items-center justify-between bg-orange-50/50 border border-orange-100/50 p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-orange-700">
                      <FaCalendarCheck />
                      <span className="text-xs font-bold uppercase tracking-wide">Follow-up Required</span>
                    </div>
                    <span className="text-sm font-bold text-orange-800 bg-white px-3 py-1 rounded-lg shadow-sm">{format(new Date(p.followUpDate), 'MMM dd, yyyy')}</span>
                  </div>
                )}
                
                {p.aiExplanation && (
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50/50 rounded-xl border border-purple-100/50 shadow-sm">
                    <p className="text-xs font-bold text-purple-700 mb-2 flex items-center gap-2">
                      <FaRobot /> AI Explanation Included
                    </p>
                    <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">{p.aiExplanation}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          {!prescriptions.length && (
            <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center py-20 px-4 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-slate-400">
              <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-slate-300">
                <FaFileMedical className="text-4xl" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">No prescriptions found</h3>
              <p className="text-sm font-medium">You haven't written any prescriptions yet.</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}