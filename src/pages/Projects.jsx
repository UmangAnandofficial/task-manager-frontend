import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Projects() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitError, setSubmitError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitError('');
    try {
      await api.post('/projects', { name, description });
      setName('');
      setDescription('');
      setShowForm(false);
      load();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project? All its tasks will also be deleted.')) return;
    try {
      await api.delete(`/projects/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading projects...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isAdmin ? 'Manage all projects' : 'Projects you are a member of'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            {showForm ? 'Cancel' : '+ New Project'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-6 space-y-3">
          {submitError && (
            <div className="bg-red-50 text-red-700 p-3 rounded text-sm">{submitError}</div>
          )}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Project name"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-medium"
          >
            Create Project
          </button>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          <div className="text-4xl mb-2">📁</div>
          <p>No projects yet.</p>
          {isAdmin && <p className="text-sm mt-2">Click "+ New Project" to create your first one.</p>}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div key={p._id} className="bg-white rounded-lg shadow hover:shadow-md transition p-5">
              <div className="flex items-start justify-between mb-2">
                <Link to={`/projects/${p._id}`} className="text-lg font-semibold text-gray-800 hover:text-indigo-600">
                  {p.name}
                </Link>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                    title="Delete project"
                  >
                    🗑️
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3 min-h-[2.5rem]">
                {p.description || 'No description'}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                <span>👥 {p.members?.length || 0} members</span>
                <Link
                  to={`/projects/${p._id}`}
                  className="text-indigo-600 font-medium hover:underline"
                >
                  Open →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
