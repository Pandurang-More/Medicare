import React from 'react';
import { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { prescriptionAPI } from '../../utils/api';
import { format } from 'date-fns';
import { FaFileMedical, FaDownload, FaChevronDown, FaChevronUp, FaRobot, FaFlask, FaNotesMedical, FaPills } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function MedicalHistory() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    prescriptionAPI.getAll().then(res => setPrescriptions(res.data.prescriptions)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const downloadPDF = (p) => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.width;

    // Header
    doc.setFillColor(79, 70, 229); // Primary-600 color
    doc.rect(0, 0, pageW, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('MediCare Services', pageW / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Official Medical Prescription', pageW / 2, 30, { align: 'center' });

    // Patient info & Meta
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Patient: ${p.patient?.name}`, 14, 55);
    doc.text(`Doctor: Dr. ${p.doctor?.name}`, 14, 63);
    doc.text(`Date: ${format(new Date(p.createdAt), 'MMMM dd, yyyy')}`, 14, 71);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Primary Diagnosis: ${p.diagnosis}`, 14, 85);
    doc.setFont('helvetica', 'normal');

    // Medicines table
    doc.autoTable({
      startY: 95,
      head: [['Medicine', 'Dosage', 'Frequency', 'Duration', 'Instructions']],
      body: p.medicines.map(m => [m.name, m.dosage, m.frequency, m.duration, m.instructions || '-']),
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 4 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    let y = doc.lastAutoTable.finalY + 15;

    if (p.labTests?.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Recommended Lab Tests:', 14, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      p.labTests.forEach((t, i) => { doc.text(`• ${t}`, 20, y + 8 + i * 6); });
      y += 15 + p.labTests.length * 6;
    }

    if (p.notes && y < 250) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Doctor\'s Notes:', 14, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const splitNotes = doc.splitTextToSize(p.notes, pageW - 28);
      doc.text(splitNotes, 14, y + 8);
    }

    if (p.aiExplanation) {
      doc.addPage();
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text('AI-Generated Patient Guide', 14, 25);
      
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'italic');
      doc.text('This is an AI generated summary to help you understand your diagnosis.', 14, 33);
      
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(p.aiExplanation, pageW - 28);
      doc.text(lines, 14, 45);
    }

    doc.save(`Prescription_${p.patient?.name.replace(/\s+/g, '_')}_${format(new Date(p.createdAt), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <Layout>
      <div className="mb-10 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Medical History</h1>
        <p className="text-slate-500 font-medium mt-1">Review your past prescriptions, lab tests, and doctor notes</p>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-6 animate-fade-in">
          {prescriptions.map(p => (
            <div key={p._id} className="card p-0 overflow-hidden border-0 ring-1 ring-slate-200 shadow-sm hover:shadow-xl hover:ring-primary-300 transition-all duration-300 rounded-2xl group">
              <div className="p-6 bg-white">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                  
                  <div className="flex items-start gap-5 flex-1">
                    <div className="hidden sm:flex w-16 h-16 bg-gradient-to-br from-indigo-50 to-primary-100 rounded-2xl items-center justify-center text-primary-600 shadow-inner border border-primary-200/50">
                      <FaNotesMedical className="text-2xl" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 text-xl group-hover:text-primary-700 transition-colors">{p.diagnosis}</h3>
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 whitespace-nowrap border border-slate-200">
                          {format(new Date(p.createdAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      
                      <p className="text-sm font-medium text-slate-500 mb-4">Prescribed by Dr. <span className="text-slate-700 font-bold">{p.doctor?.name}</span></p>
                      
                      <div className="flex gap-2 flex-wrap">
                        {p.medicines.slice(0, 4).map((m, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-primary-100/50">
                            <FaPills className="text-[10px] opacity-70" /> {m.name}
                          </span>
                        ))}
                        {p.medicines.length > 4 && (
                          <span className="inline-flex items-center bg-slate-50 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200">
                            +{p.medicines.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end gap-3 justify-end md:w-32 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-5">
                    <button onClick={() => downloadPDF(p)} className="flex-1 md:flex-none flex items-center justify-center gap-2 text-sm bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-xl hover:bg-emerald-100 font-bold border border-emerald-200/50 transition-colors w-full">
                      <FaDownload className="text-emerald-600" /> PDF
                    </button>
                    <button onClick={() => toggle(p._id)} className="flex-1 md:flex-none flex items-center justify-center gap-2 text-sm bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-100 font-bold border border-slate-200 transition-colors w-full">
                      {expanded[p._id] ? 'Hide' : 'View'} 
                      {expanded[p._id] ? <FaChevronUp className="text-[10px]" /> : <FaChevronDown className="text-[10px]" />}
                    </button>
                  </div>
                </div>
              </div>

              {expanded[p._id] && (
                <div className="p-6 bg-slate-50/80 border-t border-slate-200 animate-fade-in">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    <div className="space-y-6">
                      {/* Meds */}
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm tracking-wide uppercase mb-4 flex items-center gap-2">
                          <FaPills className="text-primary-500" /> Prescribed Medicines
                        </h4>
                        <div className="space-y-3">
                          {p.medicines.map((m, i) => (
                            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                              <p className="font-bold text-slate-900 mb-1">{m.name}</p>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 font-medium">
                                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> {m.dosage}</span>
                                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> {m.frequency}</span>
                                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> For {m.duration}</span>
                              </div>
                              {m.instructions && <p className="text-slate-500 text-xs mt-3 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-start gap-2">
                                <span className="text-slate-400 mt-0.5">ℹ️</span> {m.instructions}
                              </p>}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      {p.notes && (
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm tracking-wide uppercase mb-3 text-slate-800">Doctor's Notes</h4>
                          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                            <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap">{p.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      {/* Lab tests */}
                      {p.labTests?.length > 0 && (
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm tracking-wide uppercase mb-3 flex items-center gap-2">
                            <FaFlask className="text-amber-500" /> Recommended Tests
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {p.labTests.map((t, i) => (
                              <span key={i} className="bg-amber-50 border border-amber-200/60 text-amber-800 text-sm font-bold px-3 py-1.5 rounded-lg shadow-sm">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Explanation */}
                      {p.aiExplanation && (
                        <div>
                          <h4 className="font-bold text-purple-700 text-sm tracking-wide uppercase mb-3 flex items-center gap-2">
                            <FaRobot className="text-purple-500 text-lg" /> AI Assistant Guide
                          </h4>
                          <div className="bg-gradient-to-br from-purple-50 to-indigo-50/50 rounded-xl p-5 shadow-sm border border-purple-100">
                            <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{p.aiExplanation}</p>
                          </div>
                        </div>
                      )}

                      {/* Follow up */}
                      {p.followUpDate && (
                        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-center justify-between">
                          <p className="text-sm font-bold text-rose-800">Next Follow-up Visit</p>
                          <p className="text-sm font-bold text-rose-600 bg-white px-3 py-1 rounded-lg shadow-sm">{format(new Date(p.followUpDate), 'MMMM dd, yyyy')}</p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}
            </div>
          ))}

          {!prescriptions.length && (
            <div className="flex flex-col items-center justify-center py-20 px-4 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
              <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6 text-slate-200">
                <FaFileMedical className="text-5xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No medical records found</h3>
              <p className="text-slate-500 font-medium text-center">Your prescriptions and case history will appear here once generated by a doctor.</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}