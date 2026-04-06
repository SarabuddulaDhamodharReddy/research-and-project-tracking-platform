import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLink = (to, label) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`text-sm font-medium transition-colors duration-200 ${
        isActive(to)
          ? 'text-amber-400'
          : 'text-ink-300 hover:text-white'
      }`}
    >
      {label}
    </Link>
  );

  // ✅ Avatar component — shows photo if available, else first letter
  const Avatar = ({ size = "w-8 h-8" }) => {
    if (user?.photo) {
      return (
        <img
          src={user.photo}
          alt={user.name || user.email}
          referrerPolicy="no-referrer"
          className={`${size} rounded-full object-cover border border-ink-600`}
        />
      );
    }
    return (
      <div className={`${size} rounded-full bg-ink-700 border border-ink-600 flex items-center justify-center text-amber-400 font-semibold text-xs`}>
        {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-ink-800 bg-ink-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-ink-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-display font-bold text-lg text-white group-hover:text-amber-400 transition-colors">
              ResearchHub
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLink('/', 'Explore')}
            {user && navLink('/dashboard', 'Dashboard')}
            {user && navLink('/requests', 'Requests')}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/upload" className="btn-primary text-sm">
                  + New Project
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 text-sm text-ink-300 hover:text-white transition-colors">
                    {/* ✅ Avatar with photo or initial */}
                    <Avatar />
                    <span className="font-medium">
                      {user.name?.split(' ')[0] || user.email?.split('@')[0]}
                    </span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-44 bg-ink-800 border border-ink-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-ink-700 flex items-center gap-3">
                      {/* ✅ Avatar also in dropdown */}
                      <Avatar size="w-8 h-8" />
                      <div className="overflow-hidden">
                        {user.name && (
                          <p className="text-sm font-medium text-white truncate">{user.name}</p>
                        )}
                        <p className="text-xs text-ink-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-ink-700 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-ink-300 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-ink-800 py-4 space-y-3">
            {navLink('/', 'Explore')}
            {user && navLink('/dashboard', 'Dashboard')}
            {user && navLink('/requests', 'Requests')}

            <div className="pt-3 border-t border-ink-800 flex flex-col gap-2">
              {user ? (
                <>
                  {/* ✅ Mobile user info with avatar */}
                  <div className="flex items-center gap-3 px-1 pb-2">
                    <Avatar size="w-9 h-9" />
                    <div className="overflow-hidden">
                      {user.name && (
                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                      )}
                      <p className="text-xs text-ink-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link to="/upload" onClick={() => setMenuOpen(false)} className="btn-primary text-center">
                    + New Project
                  </Link>
                  <button onClick={handleLogout} className="btn-danger text-center">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary text-center">Sign In</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-center">Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}