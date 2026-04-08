import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const verified = searchParams.get('verified');

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleResendVerification = async (email) => {
    try {
      await api.post('/auth/resend-verification', { email });
      setError('Verification email resent! Please check your inbox.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend email');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', form);
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      const requiresVerification = err.response?.data?.requiresVerification;
      const userEmail = err.response?.data?.email;
      const msg = err.response?.data?.message || 'Login failed';

      if (requiresVerification) {
        setError(
          <span>
            {msg}{' '}
            <button
              type="button"
              onClick={() => handleResendVerification(userEmail || form.email)}
              className="text-amber-400 underline hover:text-amber-300"
            >
              Resend verification email
            </button>
          </span>
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "https://research-and-project-tracking-platform.onrender.com/auth/google";
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md fade-up">
        <div className="card">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-ink-400 text-sm mt-1">Sign in to your ResearchHub account</p>
          </div>

          {/* ✅ Show success message after email verification */}
          {verified && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg px-4 py-3 text-sm mb-5">
              ✅ Email verified successfully! You can now sign in.
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@university.edu"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="flex items-center my-5">
            <div className="flex-1 h-px bg-ink-700"></div>
            <span className="px-3 text-xs text-ink-400">OR</span>
            <div className="flex-1 h-px bg-ink-700"></div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white/90 hover:bg-white text-black py-2.5 rounded-lg transition font-medium"
            >
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>
          </div>

          <p className="text-center text-sm text-ink-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-amber-400 hover:text-amber-300 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}