import { useState, useEffect } from 'react';
import { Loader2, UserPlus, Shield, ShieldCheck, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

interface Admin {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  created_at: string;
}

export function AdminManagementPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'admin' as 'admin' | 'super_admin' });
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError('Failed to load admin list.');
      } else {
        setAdmins(data || []);
      }
    } catch {
      setError('An unexpected error occurred.');
    }
    setIsLoading(false);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password) {
      setCreateError('All fields are required.');
      return;
    }

    if (createForm.password.length < 8) {
      setCreateError('Password must be at least 8 characters.');
      return;
    }

    setIsCreating(true);

    try {
      // Create auth user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: createForm.email.trim().toLowerCase(),
        password: createForm.password,
      });

      if (signUpError) {
        setCreateError(signUpError.message);
        setIsCreating(false);
        return;
      }

      if (!signUpData.user) {
        setCreateError('Failed to create user account.');
        setIsCreating(false);
        return;
      }

      // Create admin record
      const { error: adminError } = await supabase.from('admins').insert({
        user_id: signUpData.user.id,
        name: createForm.name.trim(),
        email: createForm.email.trim().toLowerCase(),
        role: createForm.role,
      });

      if (adminError) {
        setCreateError('User account created but admin record failed. Contact support.');
        setIsCreating(false);
        return;
      }

      setCreateSuccess(`Admin "${createForm.name}" created successfully.`);
      setCreateForm({ name: '', email: '', password: '', role: 'admin' });
      setShowCreateForm(false);
      fetchAdmins();
    } catch {
      setCreateError('An unexpected error occurred.');
    }

    setIsCreating(false);
  };

  const handleDeleteAdmin = async (adminId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('admins')
        .delete()
        .eq('id', adminId);

      if (deleteError) {
        setError('Failed to remove admin.');
      } else {
        setAdmins(admins.filter(a => a.id !== adminId));
        setDeleteConfirm(null);
      }
    } catch {
      setError('An unexpected error occurred.');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Unknown date';
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Admin Management">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" message="Loading admins..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Admin Management">
      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {createSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700">{createSuccess}</p>
          <button onClick={() => setCreateSuccess('')} className="ml-auto text-green-500 hover:text-green-700 text-sm">Dismiss</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-slate-600">{admins.length} admin{admins.length !== 1 ? 's' : ''} registered</p>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center gap-2 bg-blue-900 text-white px-4 py-2.5 rounded-lg hover:bg-blue-950 transition-colors font-medium"
        >
          <UserPlus className="w-5 h-5" />
          Add Admin
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h3 className="font-semibold text-slate-800 mb-4">Create New Admin</h3>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Admin name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Min. 8 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value as 'admin' | 'super_admin' }))}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>

            {createError && (
              <p className="text-sm text-red-600">{createError}</p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isCreating}
                className="inline-flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-950 transition-colors font-medium disabled:opacity-50"
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {isCreating ? 'Creating...' : 'Create Admin'}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreateForm(false); setCreateError(''); }}
                className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admin List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Name</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Email</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Role</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">Added</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">No admins found</p>
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{admin.name}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{admin.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        admin.role === 'super_admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {admin.role === 'super_admin' ? <ShieldCheck className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                        {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{formatDate(admin.created_at)}</td>
                    <td className="px-6 py-4">
                      {deleteConfirm === admin.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteAdmin(admin.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-slate-500 hover:text-slate-700 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(admin.id)}
                          className="text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
