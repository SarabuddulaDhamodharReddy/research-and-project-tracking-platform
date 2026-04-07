import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const DEPARTMENTS = [
  'Computer Science',
  'Electronics',
  'Mechanical',
  'Civil',
  'Biotechnology',
  'Chemical',
  'Other',
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 8 }, (_, i) => currentYear - i);

export default function UploadProjectPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    department: '',
    year: currentYear,
    status: 'ongoing',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleFile = (f) => {
    if (f && f.type === 'application/pdf') {
      setFile(f);
      setError('');
    } else if (f) {
      setError('Only PDF files are allowed');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

// ONLY showing the FIXED PART (handleSubmit)

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.title || !form.description || !form.department) {
    return setError('Please fill all required fields');
  }

  setLoading(true);
  setError('');

  try {
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (file) formData.append('file', file);

    const res = await api.post('/projects', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    // ✅ Backend returns project directly, not wrapped in { data: ... }
    const projectId = res.data?._id || res.data?.data?._id;

    if (!projectId) {
      throw new Error("Project ID not returned from server");
    }

    navigate(`/projects/${projectId}`);

  } catch (err) {
    console.error(err);
    setError(err.response?.data?.message || err.message || 'Failed to upload project');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 fade-up">
        <h1 className="page-header mb-2">Upload Project</h1>
        <p className="text-ink-400 text-sm">Share your research with the community</p>
      </div>

      <div className="card fade-up" style={{ animationDelay: '0.1s' }}>
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="label">Project Title <span className="text-red-400">*</span></label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g., AI-Based Disease Detection System"
              className="input-field"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">Description <span className="text-red-400">*</span></label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your project, its objectives, methodology, and key findings..."
              rows={4}
              className="input-field resize-none"
              required
            />
          </div>

          {/* Department + Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Department <span className="text-red-400">*</span></label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Year <span className="text-red-400">*</span></label>
              <select
                name="year"
                value={form.year}
                onChange={handleChange}
                className="input-field"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="label">Project Status</label>
            <div className="flex gap-3">
              {['ongoing', 'published'].map((s) => (
                <label
                  key={s}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border cursor-pointer transition-all duration-200 flex-1 ${
                    form.status === s
                      ? 'border-amber-500/50 bg-amber-500/10 text-white'
                      : 'border-ink-600 bg-ink-800 text-ink-400 hover:border-ink-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={form.status === s}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                    form.status === s ? 'border-amber-400' : 'border-ink-500'
                  }`}>
                    {form.status === s && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                  </div>
                  <span className="capitalize text-sm font-medium">{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="label">Research Paper (PDF)</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${
                dragOver
                  ? 'border-amber-500 bg-amber-500/5'
                  : file
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-ink-600 hover:border-ink-500 bg-ink-800/50'
              }`}
              onClick={() => document.getElementById('file-input').click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".pdf"
                onChange={(e) => handleFile(e.target.files[0])}
                className="sr-only"
              />

              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-emerald-400 font-medium text-sm">{file.name}</p>
                    <p className="text-ink-500 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="ml-2 text-ink-500 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-xl bg-ink-700 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-ink-300 text-sm font-medium mb-1">Drop your PDF here or click to browse</p>
                  <p className="text-ink-500 text-xs">PDF files only, max 10MB</p>
                </>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Uploading...
                </span>
              ) : 'Upload Project'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
