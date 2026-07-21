import React from 'react';
import { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { doctorAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUserMd } from 'react-icons/fa';

const SPECIALIZATIONS = ['Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedist', 'Pediatrician', 'Psychiatrist', 'General Physician', 'ENT Specialist', 'Gynecologist', 'Oncologist'];

const emptyForm = { name: '', email: '', password: '', phone: '', specialization: '', experience: '', consultationFee: '', bio: '', hospital: '' };

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    doctorAPI.getAll().then(res => setDoctors(res.data.doctors)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = doctors.filter(d =>
    d.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (doc) => {
    setEditing(doc._id);
    setForm({
      name: doc.user?.name || '',
      email: doc.user?.email || '',
      password: '',
      phone: doc.user?.phone || '',
      specialization: doc.specialization || '',
      experience: doc.experience || '',
      consultationFee: doc.consultationFee || '',
      bio: doc.bio || '',
      hospital: doc.hospital || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || (!editing && !form.password) || !form.specialization) {
      return toast.error('Please fill required fields');
    }
    setSaving(true);
    try {
      if (editing) {
        await doctorAPI.update(editing, form);
        toast.success('Doctor updated');
      } else {
        await doctorAPI.create(form);
        toast.success('Doctor added');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving doctor');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this doctor?')) return;
    try {
      await doctorAPI.delete(id);
      toast.success('Doctor removed');
      load();
    } catch (err) {
      toast.error('Failed to remove doctor');
    }
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Doctors</h1>
          <p className="text-slate-500 font-medium mt-1">Manage hospital doctors and specialties</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center justify-center gap-2 shadow-md shadow-primary-500/20 py-3">
          <FaPlus /> Add Doctor
        </button>
      </div>

      {/* Search */}
      <div className="card mb-8 p-2 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/80 shadow-sm animate-fade-in">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input 
            className="input-field pl-12 py-4 text-base bg-transparent border-none rounded-xl focus:ring-0 shadow-none font-medium text-slate-700" 
            placeholder="Search doctors by name or specialization..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filtered.map(doc => (
            <div key={doc._id} className="card p-6 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border-0 ring-1 ring-slate-200 hover:ring-primary-200">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-primary-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    <FaUserMd className="text-primary-600 text-2xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-primary-700 transition-colors">Dr. {doc.user?.name}</h3>
                    <p className="text-sm font-semibold text-primary-600">{doc.specialization}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(doc)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors bg-slate-50 border border-slate-100"><FaEdit /></button>
                  <button onClick={() => handleDelete(doc._id)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors bg-slate-50 border border-slate-100"><FaTrash /></button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm text-slate-500 font-medium border-t border-slate-100 pt-5">
                <div className="bg-slate-50 rounded-xl p-2.5 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Experience</span>
                  <span className="text-slate-800 font-semibold">{doc.experience} Years</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Consultation</span>
                  <span className="text-slate-800 font-semibold">₹{doc.consultationFee}</span>
                </div>
                <div className="col-span-2 flex items-center gap-2 mt-1">
                  <span className="text-slate-400">📧</span>
                  <span className="truncate">{doc.user?.email}</span>
                </div>
                <div className="col-span-2 flex items-center justify-between mt-1 pt-3 border-t border-slate-100">
                  <span className="flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${doc.isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    {doc.isVerified ? 'Verified' : 'Pending Verification'}
                  </span>
                  <span className="text-xs font-bold text-slate-400 truncate max-w-[120px]">🏥 {doc.hospital || 'Not specified'}</span>
                </div>
              </div>
            </div>
          ))}
          {!filtered.length && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-slate-400">
              <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                <FaUserMd className="text-4xl text-slate-300" />
              </div>
              <p className="font-medium text-lg text-slate-600">No doctors found</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
              <h2 className="text-xl font-bold text-slate-900">{editing ? 'Edit Doctor Profile' : 'Add New Doctor'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 border-b border-slate-100 pb-2">Account Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Full Name <span className="text-rose-500">*</span></label>
                    <input className="input-field py-2.5 text-slate-800" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email <span className="text-rose-500">*</span></label>
                    <input type="email" className="input-field py-2.5 text-slate-800" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                  </div>
                  {!editing && (
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Password <span className="text-rose-500">*</span></label>
                      <input type="password" className="input-field py-2.5 text-slate-800" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 border-b border-slate-100 pb-2">Professional Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Phone</label>
                    <input className="input-field py-2.5 text-slate-800" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Specialization <span className="text-rose-500">*</span></label>
                    <select className="input-field py-2.5 text-slate-800 font-medium" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} required>
                      <option value="">Select...</option>
                      {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Experience (years)</label>
                    <input type="number" className="input-field py-2.5 text-slate-800" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Consultation Fee (₹)</label>
                    <input type="number" className="input-field py-2.5 text-slate-800" value={form.consultationFee} onChange={e => setForm({ ...form, consultationFee: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Hospital</label>
                    <input className="input-field py-2.5 text-slate-800" value={form.hospital} onChange={e => setForm({ ...form, hospital: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Bio</label>
                    <textarea className="input-field py-2.5 min-h-[100px] text-slate-800" rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100 mt-6 sticky bottom-0 bg-white pb-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 py-3 font-bold">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-3 shadow-md shadow-primary-500/20">{saving ? 'Saving...' : editing ? 'Update Doctor' : 'Add Doctor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}