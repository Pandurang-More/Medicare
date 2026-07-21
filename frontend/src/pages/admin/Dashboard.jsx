import React from 'react';
import { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import StatCard from '../../components/shared/Statcard';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import StatusBadge from '../../components/shared/StatusBadge';
import { appointmentAPI } from '../../utils/api';
import { FaUserMd, FaUsers, FaCalendarAlt, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import { format } from 'date-fns';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentAPI.getAnalytics()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  const { stats, recentAppointments, monthlyData } = data || {};

  const barData = {
    labels: monthlyData?.map(d => MONTHS[d._id.month - 1]) || [],
    datasets: [{
      label: 'Appointments',
      data: monthlyData?.map(d => d.count) || [],
      backgroundColor: 'rgba(99, 102, 241, 0.85)',
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const doughnutData = {
    labels: ['Pending', 'Approved', 'Completed', 'Cancelled'],
    datasets: [{
      data: [stats?.pendingCount, stats?.approvedCount, stats?.completedCount, stats?.cancelledCount],
      backgroundColor: ['#f59e0b', '#6366f1', '#10b981', '#f43f5e'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  return (
    <Layout>
      <div className="mb-10 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-500 font-medium mt-1">Hospital overview and real-time analytics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Doctors" value={stats?.totalDoctors || 0} icon={FaUserMd} color="blue" />
        <StatCard title="Total Patients" value={stats?.totalPatients || 0} icon={FaUsers} color="green" />
        <StatCard title="Total Appointments" value={stats?.totalAppointments || 0} icon={FaCalendarAlt} color="purple" />
        <StatCard title="Completed" value={stats?.completedCount || 0} icon={FaCheckCircle} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <StatCard title="Pending Approvals" value={stats?.pendingCount || 0} icon={FaClock} color="yellow" />
        <StatCard title="Cancelled" value={stats?.cancelledCount || 0} icon={FaTimesCircle} color="red" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="card lg:col-span-2">
          <h2 className="font-bold text-slate-900 text-lg tracking-tight mb-6">Monthly Appointments</h2>
          <div className="relative h-72 w-full">
            <Bar data={barData} options={{ maintainAspectRatio: false, responsive: true, plugins: { legend: { display: false } } }} />
          </div>
        </div>
        <div className="card">
          <h2 className="font-bold text-slate-900 text-lg tracking-tight mb-6">Status Distribution</h2>
          <div className="relative h-64 w-full flex items-center justify-center">
            <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, responsive: true, plugins: { legend: { position: 'bottom', labels: { padding: 20, font: { family: 'Inter', weight: '500' } } } } }} />
          </div>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="card mb-8 overflow-hidden">
        <h2 className="font-bold text-slate-900 text-lg tracking-tight mb-6 px-1">Recent Appointments</h2>
        <div className="overflow-x-auto rounded-xl ring-1 ring-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                <th className="py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
                <th className="py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {recentAppointments?.map(appt => (
                <tr key={appt._id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-3.5 px-5 font-semibold text-slate-900 text-sm">{appt.patient?.name}</td>
                  <td className="py-3.5 px-5 text-sm font-medium text-slate-600 group-hover:text-primary-600 transition-colors">Dr. {appt.doctor?.name}</td>
                  <td className="py-3.5 px-5 text-sm font-medium text-slate-500">{format(new Date(appt.appointmentDate), 'MMM dd, yyyy')}</td>
                  <td className="py-3.5 px-5"><StatusBadge status={appt.status} /></td>
                </tr>
              ))}
              {!recentAppointments?.length && (
                <tr><td colSpan={4} className="text-center py-10 text-slate-400 font-medium">No appointments yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}