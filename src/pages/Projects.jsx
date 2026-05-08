import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { ProjectCardSkeleton } from '../components/Skeleton';

export default function Projects() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // confirmation modal state - browser confirm() ke replacement ke liye
  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/projects', { name, description });
      toast.success('Project created!');
      setName('');
      setDescription('');
      setShowForm(false);
      loadProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/projects/${confirmDelete._id}`);
      toast.success('Project deleted');
      setConfirmDelete(null);
      loadProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isAdmin
              ? 'Manage all team projects'
              : 'Projects you are a member of'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow transition-all duration-200"
          >
            {showForm ? 'Cancel' : '+ New Project'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 animate-fadeIn">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Create New Project
          </h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Project name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-5xl mb-3">📁</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            No projects yet
          </h3>
          <p className="text-gray-500 text-sm">
            {isAdmin
              ? 'Create your first project to get started'
              : 'Ask an admin to add you to a project'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 overflow-hidden group"
            >
              <div
                onClick={() => navigate(`/projects/${p._id}`)}
                className="p-6 cursor-pointer"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                  {p.name}
                </h3>
                {p.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {p.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>👤 {p.members?.length || 0} members</span>
                  <span>By {p.createdBy?.name || 'Unknown'}</span>
                </div>
              </div>
              {isAdmin && (
                <div className="px-6 py-2 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => setConfirmDelete(p)}
                    className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Custom delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Delete Project
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete{' '}
              <strong>"{confirmDelete.name}"</strong>? All tasks within this
              project will also be deleted. This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
