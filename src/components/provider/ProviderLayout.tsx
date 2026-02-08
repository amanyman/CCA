import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Tutorial } from './Tutorial';

interface ProviderLayoutProps {
  children: React.ReactNode;
  title: string;
}

const navItems = [
  { path: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/provider/referrals', label: 'Referrals', icon: FileText },
  { path: '/provider/profile', label: 'Agency Profile', icon: Settings },
];

export function ProviderLayout({ children, title }: ProviderLayoutProps) {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/provider/login');
    } catch {
      navigate('/provider/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/">
            <img
              src="/california-care-alliance-logo-clean.png"
              alt="California Care Alliance"
              className="h-8 w-auto"
            />
          </Link>
          <div className="w-10" />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-900/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-4 py-6 border-b border-slate-100">
            <Link to="/">
              <img
                src="/california-care-alliance-logo-clean.png"
                alt="California Care Alliance"
                className="h-10 w-auto"
              />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/provider/dashboard' && location.pathname.startsWith(item.path));
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-900 font-medium'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* Tutorial & Sign Out */}
          <div className="px-3 py-4 border-t border-slate-100 space-y-1">
            <button
              onClick={() => {
                setShowTutorial(true);
                setSidebarOpen(false);
              }}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              <span>Tutorial</span>
            </button>
            <button
              onClick={() => setShowSignOutConfirm(true)}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">{title}</h1>
          {children}
        </div>
      </main>

      {/* Tutorial Modal */}
      <Tutorial isOpen={showTutorial} onClose={() => setShowTutorial(false)} />

      {/* Sign Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50">
          <div className="bg-white rounded-xl shadow-xl p-6 mx-4 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Sign Out</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to sign out?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
