import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const ROLE_COLORS = {
  owner: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  collaborator: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  viewer: 'bg-ink-700 text-ink-300 border-ink-600',
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reqMsg, setReqMsg] = useState('');
  const [reqLoading, setReqLoading] = useState(false);
  const [reqSuccess, setReqSuccess] = useState('');
  const [reqError, setReqError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showReqForm, setShowReqForm] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        setProject(res.data);
      } catch (err) {
        setError('Project not found');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const isOwner = user && project && project.ownerId?._id === user._id;
  const isCollaborator = user && project &&
    project.collaborators?.some((c) => c._id === user._id);

  const handleRequest = async (e) => {
    e.preventDefault();
    setReqLoading(true);
    setReqError('');
    try {
      await api.post(`/requests/${id}`, { message: reqMsg });
      setReqSuccess('Collaboration request sent successfully!');
      setShowReqForm(false);
    } catch (err) {
      setReqError(err.response?.data?.message || 'Failed to send request');
    } finally {
      setReqLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This cannot be undone.')) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/projects/${id}`);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="card skeleton h-96" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-red-400 mb-4">{error || 'Project not found'}</p>
        <Link to="/" className="btn-secondary">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Back */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-ink-400 hover:text-white text-sm mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Projects
      </Link>

      <div className="fade-up">
        {/* Header Card */}
        <div className="card mb-5">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div className="flex flex-wrap gap-2">
              <span className="badge bg-ink-700 text-ink-300 border border-ink-600">{project.department}</span>
              <span className={`badge ${project.status === 'published' ? 'badge-published' : 'badge-ongoing'}`}>
                {project.status}
              </span>
              <span className="badge bg-ink-800 text-ink-400 border border-ink-700">{project.year}</span>
            </div>
            {(isOwner || isCollaborator) && (
              <div className="flex gap-2">
                <Link to={`/projects/${id}/edit`} className="btn-secondary text-xs px-3 py-1.5">
                  Edit Project
                </Link>
                {isOwner && (
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="btn-danger text-xs px-3 py-1.5"
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            )}
          </div>

          <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
            {project.title}
          </h1>

          <p className="text-ink-300 leading-relaxed mb-5">{project.description}</p>

          {/* Owner info */}
          <div className="flex items-center gap-3 pt-4 border-t border-ink-800">
            <div className="w-9 h-9 rounded-full bg-ink-700 border border-ink-600 flex items-center justify-center text-amber-400 font-semibold text-sm">
              {project.ownerId?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{project.ownerId?.name}</p>
              <p className="text-xs text-ink-500">{project.ownerId?.email} {project.ownerId?.department && `· ${project.ownerId.department}`}</p>
            </div>
            <span className="ml-auto badge bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs">Owner</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Left: Main content */}
          <div className="md:col-span-2 space-y-5">
            {/* PDF Download */}
            {project.fileUrl ? (
              <div className="card">
                <h2 className="font-display font-semibold text-lg text-white mb-3">Research Document</h2>
                <div className="flex items-center gap-3 p-3 bg-ink-800 rounded-lg border border-ink-700">
                  <div className="w-10 h-10 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">Research Paper PDF</p>
                    <p className="text-xs text-ink-500">Click to view or download</p>
                  </div>
                  <button
                    onClick={() => {
                      const viewUrl = project.fileUrl.replace('/raw/upload/', '/image/upload/');
                      window.open(viewUrl, '_blank', 'noopener,noreferrer');
                    }}
                    className="btn-primary text-xs px-3 py-2 shrink-0"
                  >
                    View PDF
                  </button>
                </div>
              </div>
            ) : (
              <div className="card">
                <h2 className="font-display font-semibold text-lg text-white mb-3">Research Document</h2>
                <div className="p-4 bg-ink-800 rounded-lg border border-dashed border-ink-600 text-center">
                  <p className="text-ink-500 text-sm">No PDF uploaded for this project</p>
                </div>
              </div>
            )}

            {/* Collaboration request */}
            {user && !isOwner && !isCollaborator && (
              <div className="card">
                <h2 className="font-display font-semibold text-lg text-white mb-1">Interested in Collaborating?</h2>
                <p className="text-ink-400 text-sm mb-4">Send a request to the project owner to join as a collaborator.</p>

                {reqSuccess ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg px-4 py-3 text-sm">
                    {reqSuccess}
                  </div>
                ) : (
                  <>
                    {!showReqForm ? (
                      <button onClick={() => setShowReqForm(true)} className="btn-primary">
                        Request Collaboration
                      </button>
                    ) : (
                      <form onSubmit={handleRequest} className="space-y-3">
                        {reqError && (
                          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
                            {reqError}
                          </div>
                        )}
                        <div>
                          <label className="label">Message (optional)</label>
                          <textarea
                            value={reqMsg}
                            onChange={(e) => setReqMsg(e.target.value)}
                            placeholder="Introduce yourself and explain why you'd like to collaborate..."
                            rows={3}
                            className="input-field resize-none"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button type="submit" disabled={reqLoading} className="btn-primary disabled:opacity-60">
                            {reqLoading ? 'Sending...' : 'Send Request'}
                          </button>
                          <button type="button" onClick={() => setShowReqForm(false)} className="btn-secondary">
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}
              </div>
            )}

            {!user && (
              <div className="card border-amber-500/20">
                <p className="text-ink-300 text-sm">
                  <Link to="/login" className="text-amber-400 hover:text-amber-300 font-medium">Sign in</Link>
                  {' '}to request collaboration on this project.
                </p>
              </div>
            )}

            {isCollaborator && (
              <div className="card border-violet-500/20">
                <p className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  You are a collaborator on this project
                </p>
              </div>
            )}
          </div>

          {/* Right: Contributors */}
          <div className="space-y-5">
            <div className="card">
              <h2 className="font-display font-semibold text-base text-white mb-4">
                Contributors
                <span className="ml-2 badge bg-ink-800 text-ink-400 border border-ink-700 font-mono text-xs">
                  {project.contributors?.length || 0}
                </span>
              </h2>
              {project.contributors?.length > 0 ? (
                <ul className="space-y-3">
                  {project.contributors.map((c) => (
                    <li key={c._id} className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-ink-700 border border-ink-600 flex items-center justify-center text-amber-400 font-semibold text-xs shrink-0">
                        {c.userId?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{c.userId?.name || 'Unknown'}</p>
                      </div>
                      <span className={`badge border text-xs ${ROLE_COLORS[c.role] || ROLE_COLORS.viewer}`}>
                        {c.role}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-ink-500 text-sm">No contributors listed</p>
              )}
            </div>

            {/* Meta */}
            <div className="card">
              <h2 className="font-display font-semibold text-base text-white mb-3">Details</h2>
              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-500">Department</dt>
                  <dd className="text-ink-200 font-medium">{project.department}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-500">Year</dt>
                  <dd className="text-ink-200 font-medium">{project.year}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-500">Status</dt>
                  <dd className={project.status === 'published' ? 'text-emerald-400 font-medium' : 'text-blue-400 font-medium'}>
                    {project.status}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-500">Created</dt>
                  <dd className="text-ink-200">{new Date(project.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
