import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = (path) =>
    `px-3 py-2 rounded-md text-sm font-medium transition ${
      location.pathname === path || location.pathname.startsWith(path + '/')
        ? 'bg-indigo-700 text-white'
        : 'text-gray-200 hover:bg-indigo-600 hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-indigo-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <span className="text-white font-bold text-lg">📋 TaskManager</span>
              <div className="flex gap-2">
                <Link to="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
                <Link to="/projects" className={linkClass('/projects')}>Projects</Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-indigo-100 text-sm">
                {user?.name}{' '}
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  isAdmin ? 'bg-yellow-400 text-yellow-900' : 'bg-indigo-200 text-indigo-800'
                }`}>
                  {user?.role}
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="bg-indigo-900 hover:bg-indigo-950 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
