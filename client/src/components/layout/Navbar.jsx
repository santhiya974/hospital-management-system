import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="h-16 bg-white/80 glass border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-20">
      <div />

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
          <Bell size={18} className="text-slate-500" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-ink leading-tight">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize leading-tight">{user?.role}</p>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-elevated border border-slate-100 py-1.5 animate-scale-in origin-top-right">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-danger transition-colors"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;