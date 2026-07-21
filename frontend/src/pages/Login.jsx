import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaHospital, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(`/${user.role}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role) => {
    const demos = {
      admin: { email: 'admin@medicare.com', password: 'admin123' },
      doctor: { email: 'doctor@medicare.com', password: 'doctor123' },
      patient: { email: 'patient@medicare.com', password: 'patient123' }
    };
    setForm(demos[role]);
  };

  return (
    <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-200/40 rounded-full blur-3xl opacity-70" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] bg-emerald-200/40 rounded-full blur-3xl opacity-60" />

      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100/60 w-full max-w-md p-10 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex bg-gradient-to-br from-primary-500 to-primary-600 text-white p-3.5 rounded-2xl shadow-md shadow-primary-500/20 mb-5">
            <FaHospital className="text-2xl" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 font-medium mt-2">Sign in to MediCare</p>
        </div>

        {/* Demo buttons */}
        <div className="mb-8 p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
          <p className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wider">Quick Demo Access</p>
          <div className="flex gap-2">
            {['admin', 'doctor', 'patient'].map(role => (
              <button key={role} onClick={() => demoLogin(role)}
                className="flex-1 text-xs py-2 px-2 bg-white border border-slate-200 rounded-xl hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 text-slate-700 capitalize font-medium transition-all duration-200 hover:shadow-sm">
                {role}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                className="input-field pr-12"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors">
                {showPw ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-2 shadow-primary-500/25">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm font-medium text-slate-600 mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 hover:underline transition-colors">Register here</Link>
        </p>
      </div>
    </div>
  );
}