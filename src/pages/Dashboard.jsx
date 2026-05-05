import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const StatCard = ({ label, value, color, icon }) => (
  <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
);

const statusBadge = (status) => {
  const map = {
    'todo': 'bg-gray-100 text-gray-700',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    'done': 'bg-green-100 text-green-800',
  };
  return map[status] || map.todo;
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setData(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading dashboard...</div>;
  if (error) return <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">{error}</div>;

  const { stats, myTasks, role } = data;

  const isOverdue = (task) =>
    task.dueDate && task.status !== 'done' && new Date(task.dueDate) < new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          {role === 'admin' ? 'Overview of all activity' : 'Your tasks and projects'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Tasks" value={stats.totalTasks} color="border-indigo-500" icon="📋" />
        <StatCard label="To Do" value={stats.todo} color="border-gray-400" icon="⏳" />
        <StatCard label="In Progress" value={stats.inProgress} color="border-yellow-500" icon="🚧" />
        <StatCard label="Done" value={stats.done} color="border-green-500" icon="✅" />
        <StatCard label="Overdue" value={stats.overdue} color="border-red-500" icon="⚠️" />
        <StatCard label="Projects" value={stats.projects} color="border-purple-500" icon="📁" />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">My Tasks</h2>
          <Link to="/projects" className="text-indigo-600 text-sm font-medium hover:underline">
            View all projects →
          </Link>
        </div>

        {myTasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="text-4xl mb-2">🎉</div>
            <p>No tasks assigned to you yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {myTasks.map((task) => (
              <div key={task._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-800">{task.title}</p>
                    {isOverdue(task) && (
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                        OVERDUE
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {task.project?.name}
                    {task.dueDate && ` • Due ${new Date(task.dueDate).toLocaleDateString()}`}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge(task.status)}`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
