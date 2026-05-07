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
    'new': 'bg-yellow-100 text-yellow-800',
    'assigned': 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-orange-100 text-orange-800',
    'resolved': 'bg-green-100 text-green-800',
  };
  return map[status] || map.new;
};

const statusLabel = (status) => {
  const map = {
    'new': 'New',
    'assigned': 'Assigned',
    'in-progress': 'In Progress',
    'resolved': 'Resolved',
  };
  return map[status] || status;
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
    task.dueDate && task.status !== 'resolved' && new Date(task.dueDate) < new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          {role === 'admin' ? 'Overview of all activity' : 'Your tasks and projects'}
        </p>
      </div>

      {/* Pending acceptance alert - sirf members ke liye */}
      {role !== 'admin' && stats.pendingAcceptance > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🔔</span>
            <div>
              <p className="font-semibold text-yellow-800">
                You have {stats.pendingAcceptance} task{stats.pendingAcceptance > 1 ? 's' : ''} pending acceptance
              </p>
              <p className="text-sm text-yellow-700">
                Open the project to accept or reject these tasks.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Tasks" value={stats.totalTasks} color="border-indigo-500" icon="📋" />
        <StatCard label="New" value={stats.new} color="border-yellow-500" icon="🆕" />
        <StatCard label="Assigned" value={stats.assigned} color="border-blue-500" icon="📌" />
        <StatCard label="In Progress" value={stats.inProgress} color="border-orange-500" icon="🚧" />
        <StatCard label="Resolved" value={stats.resolved} color="border-green-500" icon="✅" />
        <StatCard label="Overdue" value={stats.overdue} color="border-red-500" icon="⚠️" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard label="Total Projects" value={stats.projects} color="border-purple-500" icon="📁" />
        {role !== 'admin' && (
          <StatCard
            label="Pending Your Acceptance"
            value={stats.pendingAcceptance}
            color="border-yellow-500"
            icon="🔔"
          />
        )}
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
                    {task.status === 'new' && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-medium">
                        ⏳ AWAITING ACCEPTANCE
                      </span>
                    )}
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
                  {statusLabel(task.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
