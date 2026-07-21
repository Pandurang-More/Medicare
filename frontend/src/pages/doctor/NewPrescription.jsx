import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/shared/Layout';
import { prescriptionAPI, appointmentAPI, aiAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash, FaRobot, FaUserCircle, FaStethoscope, FaFlask, FaCalendarAlt, FaNotesMedical, FaCheck } from 'react-icons/fa';

const emptyMed = { name: '', dosage: '', frequency: '', duration: '', instructions: '' };

export default function NewPrescription() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [form, setForm] = useState({ diagnosis: '', medicines: [{ ...emptyMed }], labTests: [], followUpDate: '', notes: '' });
  const [labTest, setLabTest] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');

  useEffect(() => {
    appointmentAPI.getOne(appointmentId).then(res => setAppointment(res.data.appointment)).catch(() => toast.error('Appointment not found'));
  }, [appointmentId]);

  const addMedicine = () => setForm({ ...form, medicines: [...form.medicines, { ...emptyMed }] });
  const removeMedicine = (i) => setForm({ ...form, medicines: form.medicines.filter((_, idx) => idx !== i) });
  const updateMedicine = (i, field, value) => {
    const meds = [...form.medicines];
    meds[i] = { ...meds[i], [field]: value };
    setForm({ ...form, medicines: meds });
  };

  const addLabTest = () => {
    if (labTest.trim()) {
      setForm({ ...form, labTests: [...form.labTests, labTest.trim()] });
      setLabTest('');
    }
  };

  const getAiExplanation = async () => {
    if (!form.diagnosis || form.medicines.every(m => !m.name)) {
      return toast.error('Add diagnosis and at least one medicine first');
    }
    setAiLoading(true);
    try {
      const res = await aiAPI.explainPrescription({ medicines: form.medicines.filter(m => m.name), diagnosis: form.diagnosis });
      setAiExplanation(res.data.explanation);
    } catch { toast.error('AI explanation failed'); }
    finally { setAiLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.diagnosis) return toast.error('Diagnosis is required');
    if (form.medicines.filter(m => m.name).length === 0) return toast.error('Add at least one medicine');

    setSaving(true);
    try {
      const payload = {
        appointment: appointmentId,
        patient: appointment.patient._id,
        ...form,
        medicines: form.medicines.filter(m => m.name),
        ...(aiExplanation && { aiExplanation })
      };
      await prescriptionAPI.create(payload);
      toast.success('Prescription created successfully');
      navigate('/doctor/prescriptions');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save prescription');
    } finally {
      setSaving(false);
    }
  };

  if (!appointment) return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-4 border-primary-600 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-t-4 border-emerald-500 animate-spin-reverse"></div>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="mb-8 animate-fade-in relative z-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Write Prescription</h1>
        <p className="text-slate-500 font-medium mt-1">Creating a new prescription for <strong className="text-primary-700">{appointment.patient?.name}</strong></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in max-w-5xl">
        
        {/* Patient info */}
        <div className="card p-6 rounded-2xl border-0 ring-1 ring-primary-100 bg-gradient-to-br from-white to-primary-50/50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100/50 rounded-bl-full -z-10 blur-2xl"></div>
          
          <h3 className="font-bold text-primary-900 mb-4 flex items-center gap-2 text-lg">
            <FaUserCircle className="text-primary-600" /> Patient Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-xl shadow-inner">
                {appointment.patient?.name?.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Patient Name</p>
                <p className="text-base font-bold text-slate-800">{appointment.patient?.name}</p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white shadow-sm flex items-center gap-4">
               <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
                <FaCalendarAlt className="text-xl" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Appointment Reason</p>
                <p className="text-base font-bold text-slate-800">{appointment.reason}</p>
              </div>
            </div>

            {appointment.symptoms?.length > 0 && (
              <div className="col-span-1 md:col-span-2 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reported Symptoms</p>
                <div className="flex flex-wrap gap-2">
                  {appointment.symptoms.map((sym, idx) => (
                    <span key={idx} className="bg-amber-50 text-amber-700 border border-amber-200/50 px-3 py-1 rounded-lg text-sm font-bold shadow-sm">{sym}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Diagnosis */}
        <div className="card p-6 rounded-2xl border-0 ring-1 ring-slate-200 shadow-sm hover:shadow-md transition-shadow focus-within:ring-primary-400">
           <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-lg">
            <FaStethoscope className="text-primary-500" /> Diagnosis <span className="text-rose-500 ml-1">*</span>
          </h3>
          <textarea 
            className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-primary-500 rounded-xl px-4 py-3 text-slate-700 font-medium placeholder-slate-400 transition-shadow resize-none" 
            rows={3} 
            value={form.diagnosis} 
            onChange={e => setForm({ ...form, diagnosis: e.target.value })} 
            placeholder="Enter the primary diagnosis..." 
          />
        </div>

        {/* Medicines */}
        <div className="card p-6 rounded-2xl border-0 ring-1 ring-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
              <FaNotesMedical className="text-emerald-500" /> Prescribed Medicines <span className="text-rose-500 ml-1">*</span>
            </h3>
            <button type="button" onClick={addMedicine} className="text-sm font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ring-1 ring-emerald-200/50 shadow-sm">
              <FaPlus /> Add Medicine
            </button>
          </div>
          
          <div className="space-y-4">
            {form.medicines.map((med, i) => (
              <div key={i} className="group p-5 bg-slate-50/50 border border-slate-200 rounded-2xl relative hover:border-primary-300 transition-colors">
                <button type="button" onClick={() => removeMedicine(i)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors" title="Remove Medicine">
                  <FaTrash className="text-sm" />
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pr-10">
                  <div className="lg:col-span-2 border-b md:border-b-0 md:border-r border-slate-200/60 pb-4 md:pb-0 md:pr-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      Medicine Name
                      <span className="text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded text-[10px]">Required</span>
                    </label>
                    <input className="w-full bg-white border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-xl px-4 py-2.5 text-slate-800 font-semibold placeholder-slate-400 transition-all" value={med.name} onChange={e => updateMedicine(i, 'name', e.target.value)} placeholder="e.g., Amoxicillin 500mg" />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Dosage</label>
                    <input className="w-full bg-white border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-xl px-4 py-2.5 text-slate-800 font-medium placeholder-slate-400 transition-all" value={med.dosage} onChange={e => updateMedicine(i, 'dosage', e.target.value)} placeholder="e.g., 1 tablet" />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Frequency</label>
                    <input className="w-full bg-white border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-xl px-4 py-2.5 text-slate-800 font-medium placeholder-slate-400 transition-all" value={med.frequency} onChange={e => updateMedicine(i, 'frequency', e.target.value)} placeholder="e.g., Twice daily" />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Duration</label>
                    <input className="w-full bg-white border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-xl px-4 py-2.5 text-slate-800 font-medium placeholder-slate-400 transition-all" value={med.duration} onChange={e => updateMedicine(i, 'duration', e.target.value)} placeholder="e.g., 5 days" />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Special Instructions</label>
                    <input className="w-full bg-white border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-xl px-4 py-2.5 text-slate-800 font-medium placeholder-slate-400 transition-all" value={med.instructions} onChange={e => updateMedicine(i, 'instructions', e.target.value)} placeholder="e.g., Take after meals" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lab Tests */}
          <div className="card p-6 rounded-2xl border-0 ring-1 ring-slate-200 shadow-sm flex flex-col">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-lg">
              <FaFlask className="text-violet-500" /> Recommended Lab Tests
            </h3>
            <div className="flex gap-2 mb-4">
              <input 
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 rounded-xl px-4 py-2.5 text-slate-800 font-medium placeholder-slate-400 transition-all" 
                placeholder="Type test name and press Enter..." 
                value={labTest} 
                onChange={e => setLabTest(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLabTest())} 
              />
              <button 
                type="button" 
                onClick={addLabTest} 
                className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm shadow-violet-500/20 transition-colors"
              >
                Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-auto min-h-[40px]">
              {form.labTests.length === 0 && <span className="text-sm text-slate-400 italic flex items-center self-center w-full justify-center opacity-70">No lab tests added yet</span>}
              {form.labTests.map((t, i) => (
                <span key={i} className="bg-violet-50 text-violet-700 border border-violet-200 pl-3 pr-1 py-1 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm">
                  {t} 
                  <button type="button" onClick={() => setForm({ ...form, labTests: form.labTests.filter((_, idx) => idx !== i) })} className="text-violet-400 hover:text-rose-500 hover:bg-rose-50 p-1 rounded-md transition-colors">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Notes & Follow-up */}
          <div className="card p-6 rounded-2xl border-0 ring-1 ring-slate-200 shadow-sm flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FaCalendarAlt className="text-orange-500" /> Follow-up Date
              </label>
              <input type="date" className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl px-4 py-2.5 text-slate-800 font-medium transition-all" value={form.followUpDate} onChange={e => setForm({ ...form, followUpDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Additional Notes for Patient</label>
              <textarea className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium placeholder-slate-400 transition-all resize-none" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any extra instructions..." />
            </div>
          </div>
        </div>

        {/* AI Explanation */}
        <div className="card p-6 rounded-2xl border-0 ring-1 ring-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50/50 shadow-sm overflow-hidden relative">
          <div className="absolute -right-8 -top-8 text-purple-200 opacity-30 pointer-events-none">
            <FaRobot className="text-[120px]" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4 border-b border-purple-100/50 pb-4">
              <div>
                <h3 className="font-extrabold text-purple-900 flex items-center gap-2 text-lg">
                  <FaRobot className="text-purple-600" /> AI Patient Explanation
                </h3>
                <p className="text-sm font-medium text-purple-600 my-1">Generate a simple, patient-friendly explanation of the prescription.</p>
              </div>
              <button 
                type="button" 
                onClick={getAiExplanation} 
                disabled={aiLoading} 
                className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 shrink-0"
              >
                 {aiLoading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Generating...</>
                 ) : 'Generate Summary'}
              </button>
            </div>
            
            <div className="bg-white/80 backdrop-blur border border-purple-100 p-5 rounded-xl min-h-[100px] flex flex-col justify-center shadow-inner">
              {aiExplanation ? (
                <div className="text-sm text-slate-700 whitespace-pre-wrap font-medium leading-relaxed font-sans">{aiExplanation}</div>
              ) : (
                <div className="text-center text-purple-400 font-medium text-sm">
                  Click the generate button to create an easy-to-understand summary.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4 pb-12">
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-3.5 rounded-xl font-bold text-slate-600 bg-white border-2 border-slate-200 hover:bg-slate-50 transition-all text-center sm:flex-1">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="px-6 py-3.5 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition-all sm:flex-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
            {saving ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving Prescription...</>
            ) : (
              <><FaCheck /> Save & Issue Prescription</>
            )}
          </button>
        </div>
      </form>
    </Layout>
  );
}