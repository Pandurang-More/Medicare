import React from 'react';
import { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { doctorAPI, appointmentAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FaUserMd, FaSearch, FaBriefcaseMedical, FaStar } from 'react-icons/fa';

const TIME_SLOTS = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'];

export default function BookAppointment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ appointmentDate: '', timeSlot: '', reason: '', symptoms: '', type: 'in-person' });
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    doctorAPI.getAll().then(res => setDoctors(res.data.doctors)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = doctors.filter(d =>
    d.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.appointmentDate || !form.timeSlot || !form.reason) return toast.error('Please fill all required fields');
    setBooking(true);
    try {
      await appointmentAPI.book({
        doctor: selected.user._id,
        ...form,
        symptoms: form.symptoms ? form.symptoms.split(',').map(s => s.trim()) : []
      });
      toast.success('Appointment booked successfully!');
      navigate('/patient/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  return (
    <Layout>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Book Appointment</h1>
        <div className="flex items-center justify-between mt-2">
          <p className="text-slate-500 font-medium">Select a doctor and available time slot</p>
          <span className="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">Step {step} of 2</span>
        </div>
        
        {/* Advanced Progress Bar */}
        <div className="flex gap-3 mt-6">
          <div className="flex-1 relative">
            <div className={`h-2 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-primary-600 shadow-[0_0_10px_rgba(79,70,229,0.4)]' : 'bg-slate-200'}`} />
            <span className={`absolute -bottom-6 text-xs font-bold ${step >= 1 ? 'text-primary-700' : 'text-slate-400'}`}>1. Select Doctor</span>
          </div>
          <div className="flex-1 relative">
            <div className={`h-2 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-primary-600 shadow-[0_0_10px_rgba(79,70,229,0.4)]' : 'bg-slate-200'}`} />
            <span className={`absolute -bottom-6 text-xs font-bold right-0 ${step >= 2 ? 'text-primary-700' : 'text-slate-400'}`}>2. Details & Confirmation</span>
          </div>
        </div>
      </div>

      <div className="mt-12 animate-fade-in">
        {step === 1 && (
          <div>
            <div className="card mb-8 p-2 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/80 shadow-sm">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input 
                  className="input-field pl-12 py-4 text-base bg-transparent border-none rounded-xl focus:ring-0 shadow-none font-medium text-slate-700" 
                  placeholder="Search by doctor name or specialization..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                />
              </div>
            </div>

            {loading ? <LoadingSpinner /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map(doc => (
                  <div key={doc._id}
                    onClick={() => { setSelected(doc); setStep(2); }}
                    className={`card p-6 cursor-pointer rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border-2 ${selected?._id === doc._id ? 'border-primary-500 bg-primary-50/30' : 'border-transparent hover:border-primary-200'}`}>
                    
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-indigo-50 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                        <FaUserMd className="text-primary-600 text-2xl" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 text-lg group-hover:text-primary-700 transition-colors">Dr. {doc.user?.name}</h3>
                        <p className="text-sm font-semibold text-primary-600 mb-2">{doc.specialization}</p>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                          <FaStar />
                          <span>{doc.rating || 4.8}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                      <div className="bg-slate-50 p-2.5 rounded-xl">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Experience</p>
                        <p className="text-sm font-semibold text-slate-800">{doc.experience} Years</p>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Consultation</p>
                        <p className="text-sm font-semibold text-slate-800">₹{doc.consultationFee}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {!filtered.length && (
                  <div className="col-span-1 md:col-span-2 xl:col-span-3 flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-slate-400">
                    <FaBriefcaseMedical className="text-4xl mb-4 text-slate-300" />
                    <p className="font-medium">No doctors found matching your criteria</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === 2 && selected && (
          <div className="max-w-3xl mx-auto">
            <div className="card mb-8 p-6 bg-gradient-to-r from-primary-50 to-indigo-50 border-0 ring-1 ring-primary-100 shadow-sm rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary-600 ring-1 ring-primary-100">
                  <FaUserMd className="text-2xl" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xl">Dr. {selected.user?.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-semibold text-primary-700">{selected.specialization}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span className="text-sm font-medium text-slate-600">Consultation Fee: <span className="font-bold text-slate-900">₹{selected.consultationFee}</span></span>
                  </div>
                </div>
              </div>
              <button onClick={() => { setSelected(null); setStep(1); }} className="btn-secondary text-sm px-4 py-2 bg-white hover:bg-slate-50 shrink-0">Change Doctor</button>
            </div>

            <form onSubmit={handleSubmit} className="card p-8 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Schedule Details</h3>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Appointment Date <span className="text-rose-500">*</span></label>
                <input type="date" className="input-field py-3 text-slate-800" min={new Date().toISOString().split('T')[0]} value={form.appointmentDate} onChange={e => setForm({ ...form, appointmentDate: e.target.value })} required />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Appointment Type</label>
                <select className="input-field py-3 text-slate-800 font-medium" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="in-person">🏥 In-Person Visit</option>
                  <option value="online">💻 Online Consultation</option>
                </select>
              </div>

              <div className="md:col-span-2 mt-2">
                <label className="block text-sm font-bold text-slate-700 mb-3">Time Slot <span className="text-rose-500">*</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {TIME_SLOTS.map(slot => (
                    <button key={slot} type="button" onClick={() => setForm({ ...form, timeSlot: slot })}
                      className={`py-2.5 px-2 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${form.timeSlot === slot ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/30 ring-2 ring-primary-100 ring-offset-1' : 'bg-slate-50 border-slate-200 hover:border-primary-300 hover:bg-white text-slate-600'}`}>
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 mt-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Medical Information</h3>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Reason for Visit <span className="text-rose-500">*</span></label>
                <textarea className="input-field py-3 min-h-[100px] text-slate-800" placeholder="Please briefly describe your primary reason for this appointment..." value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} required />
              </div>

              <div className="md:col-span-2 mb-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">Symptoms <span className="text-slate-400 font-normal">(Optional, comma separated)</span></label>
                <input className="input-field py-3 text-slate-800" placeholder="e.g., headache, fever, cough, fatigue" value={form.symptoms} onChange={e => setForm({ ...form, symptoms: e.target.value })} />
                <p className="text-xs font-medium text-slate-500 mt-2">Providing symptoms helps the doctor prepare for your visit.</p>
              </div>

              <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100 mt-2">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary py-3.5 px-8 font-bold sm:w-1/3">Go Back</button>
                <button type="submit" disabled={booking} className="btn-primary py-3.5 flex-1 shadow-md shadow-primary-500/20 text-base">
                  {booking ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Confirming Booking...
                    </span>
                  ) : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}