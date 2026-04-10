import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import api from '../utils/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mine');

useEffect(() => {
  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects/user/mine');
      // ✅ Handle both array and wrapped response
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setProjects(data);
    } catch (err) {
      console.error(err);
      setProjects([]); // ✅ Always set to array on error
    } finally {
      setLoading(false);
    }
  };
  fetchProjects();
}, []);

  const myProjects = projects.filter((p) => p.ownerId?._id === user._id);
  const collabProjects = projects.filter((p) => p.ownerId?._id !== user._id);

  const displayProjects = activeTab === 'mine' ? myProjects : collabProjects;

  const stats = [
    { label: 'My Projects', value: myProjects.length, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Collaborating On', value: collabProjects.length, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
    { label: 'Published', value: projects.filter((p) => p.status === 'published').length, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Ongoing', value: projects.filter((p) => p.status === 'ongoing').length, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 fade-up">
        <div>
          <h1 className="page-header mb-1">Dashboard</h1>
          <p className="text-ink-400 text-sm">
            Welcome back, <span className="text-amber-400 font-medium">{user?.name}</span>
          </p>
        </div>
        <Link to="/upload" className="btn-primary self-start sm:self-auto">
          + New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`card border ${s.bg} fade-up`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <p className={`text-3xl font-display font-bold ${s.color}`}>{s.value}</p>
            <p className="text-ink-400 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-ink-900 border border-ink-800 rounded-xl p-1 w-fit mb-6">
        <button
          onClick={() => setActiveTab('mine')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'mine'
              ? 'bg-ink-700 text-white shadow-sm'
              : 'text-ink-400 hover:text-white'
          }`}
        >
          My Projects ({myProjects.length})
        </button>
        <button
          onClick={() => setActiveTab('collab')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'collab'
              ? 'bg-ink-700 text-white shadow-sm'
              : 'text-ink-400 hover:text-white'
          }`}
        >
          Collaborating ({collabProjects.length})
        </button>
      </div>

      {/* Projects */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => <div key={i} className="card h-56 skeleton" />)}
        </div>
      ) : displayProjects.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-ink-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-ink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-ink-300 font-medium mb-2">
            {activeTab === 'mine' ? 'No projects yet' : 'No collaborations yet'}
          </h3>
          <p className="text-ink-500 text-sm mb-5">
            {activeTab === 'mine'
              ? 'Upload your first research project to get started.'
              : 'Browse projects and send collaboration requests.'}
          </p>
          {activeTab === 'mine' ? (
            <Link to="/upload" className="btn-primary inline-flex">Upload Project</Link>
          ) : (
            <Link to="/" className="btn-secondary inline-flex">Browse Projects</Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayProjects.map((project, i) => (
            <div key={project._id} className="fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      )}

      {/* Quick links */}
      <div className="mt-10 pt-8 border-t border-ink-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/requests" className="card hover:border-ink-500 transition-all group flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-white group-hover:text-amber-400 transition-colors text-sm">Collaboration Requests</p>
            <p className="text-ink-500 text-xs">Manage incoming & outgoing requests</p>
          </div>
          <svg className="w-4 h-4 text-ink-600 ml-auto group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link to="/" className="card hover:border-ink-500 transition-all group flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-white group-hover:text-amber-400 transition-colors text-sm">Explore Projects</p>
            <p className="text-ink-500 text-xs">Discover research from other students</p>
          </div>
          <svg className="w-4 h-4 text-ink-600 ml-auto group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
