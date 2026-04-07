import React, { useState, useEffect } from 'react';
import ProjectCard from '../components/ProjectCard';
import api from '../utils/api';

const DEPARTMENTS = [
  'All',
  'Computer Science',
  'Electronics',
  'Mechanical',
  'Civil',
  'Biotechnology',
  'Chemical',
];

const currentYear = new Date().getFullYear();
const YEARS = ['All', ...Array.from({ length: 8 }, (_, i) => currentYear - i)];

export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dept, setDept] = useState('All');
  const [year, setYear] = useState('All');
  const [search, setSearch] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dept !== 'All') params.department = dept;
      if (year !== 'All') params.year = year;
      const res = await api.get('/projects', { params });
      setProjects(res.data.projects || res.data.data.projects || []);
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line
  }, [dept, year]);

  const filtered = (projects||[]).filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero */}
      <div className="text-center mb-12 fade-up">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 text-amber-400 text-xs font-medium mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          Student Research Repository
        </div>
        <h1 className="page-header mb-4">
          Discover & Share<br />
          <span className="text-amber-400">Research Projects</span>
        </h1>
        <p className="text-ink-400 text-base max-w-xl mx-auto leading-relaxed">
          Browse student research papers and projects. Collaborate, learn, and contribute to academic innovation.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="card mb-8 fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>

          {/* Department Filter */}
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            className="input-field md:w-52"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="input-field md:w-36"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>{y === 'All' ? 'All Years' : y}</option>
            ))}
          </select>
        </div>

        {/* Active filters */}
        {(dept !== 'All' || year !== 'All') && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-ink-500">Active:</span>
            {dept !== 'All' && (
              <span className="badge bg-amber-500/15 text-amber-300 border border-amber-500/30 gap-1">
                {dept}
                <button onClick={() => setDept('All')} className="ml-1 hover:text-amber-200">×</button>
              </span>
            )}
            {year !== 'All' && (
              <span className="badge bg-amber-500/15 text-amber-300 border border-amber-500/30 gap-1">
                {year}
                <button onClick={() => setYear('All')} className="ml-1 hover:text-amber-200">×</button>
              </span>
            )}
            <button onClick={() => { setDept('All'); setYear('All'); }} className="text-xs text-ink-500 hover:text-ink-300 transition-colors">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-ink-400">
            Showing <span className="text-white font-medium">{filtered.length}</span> project{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-64 skeleton" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-400">{error}</p>
          <button onClick={fetchProjects} className="btn-secondary mt-4">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-ink-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-ink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-ink-300 font-medium mb-1">No projects found</h3>
          <p className="text-ink-500 text-sm">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((project, i) => (
            <div key={project._id} className="fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
