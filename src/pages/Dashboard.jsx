import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import api from '../utils/api';
import { StatCardSkeleton, TaskRowSkeleton } from '../components/Skeleton';

const StatCard = ({ label, value, color, icon }) => (
  <div
    className={`bg-white rounded-lg shadow p-6 border-l-4 ${color} hover:shadow-md transition-shadow duration-200`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">{value ?? 0}</p>
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
);

const statusBadge = (status) => {
  const map = {
    new: 'bg-yellow-100 text-yellow-800',
    assigned: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-orange-100 text-orange-800',
    resolved: 'bg-green-100 text-green-800',
  };
  return map[status] || map.new;
};

const statusLabel = (status) => {
  const map = {
    new: 'New',
    assigned: 'Assigned',
    'in-progress': 'In Progress',
    resolved: 'Resolved',
  };
  return map[status] || status;
};

// chart colors - dashboard ke status colors se match karte hain
const CHART_COLORS = {
  New: '#eab308', // yellow
  Assigned: '#3b82f6', // blue
  'In Progress': '#f97316', // orange
  Resolved: '#22c55e', // green
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setData(data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // skeleton loader - jab tak data load nahi ho jaata
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
          {[...Array(3)].map((_, i) => (
            <TaskRowSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
        Could not load dashboard
      </div>
    );
  }

  const { stats, myTasks, role } = data;

  const isOverdue = (task) =>
    task.dueDate &&
    task.status !== 'resolved' &&
    new Date(task.dueDate) < new Date();

  // chart data - sirf un statuses ko show karte hain jinme tasks hain
  const chartData = [
    { name: 'New', value: stats.new || 0 },
    { name: 'Assigned', value: stats.assigned || 0 },
    { name: 'In Progress', value: stats.inProgress || 0 },
    { name: 'Resolved', value: stats.resolved || 0 },
  ].filter((d) => d.value > 0);

  const hasTasksForChart = chartData.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          {role === 'admin'
            ? 'Overview of all activity'
            : 'Your tasks and projects'}
        </p>
      </div>

      {/* Pending acceptance alert - sirf members ke liye */}
      {role !== 'admin' && stats.pendingAcceptance > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded animate-fadeIn">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🔔</span>
            <div>
              <p className="font-semibold text-yellow-800">
                You have {stats.pendingAcceptance} task
                {stats.pendingAcceptance > 1 ? 's' : ''} pending acceptance
              </p>
              <p className="text-sm text-yellow-700">
                Open the project to accept or reject these tasks.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6 stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Total Tasks"
          value={stats.totalTasks}
          color="border-indigo-500"
          icon="📋"
        />
        <StatCard
          label="New"
          value={stats.new}
          color="border-yellow-500"
          icon="🆕"
        />
        <StatCard
          label="Assigned"
          value={stats.assigned}
          color="border-blue-500"
          icon="📌"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          color="border-orange-500"
          icon="🚧"
        />
        <StatCard
          label="Resolved"
          value={stats.resolved}
          color="border-green-500"
          icon="✅"
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          color="border-red-500"
          icon="⚠️"
        />
      </div>

      {/* Chart + Projects card row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pie chart - 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Task Distribution
          </h2>
          {hasTasksForChart ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={CHART_COLORS[entry.name] || '#94a3b8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <div className="text-5xl mb-3">📊</div>
              <p className="text-sm">
                No tasks yet. Create some to see analytics.
              </p>
            </div>
          )}
        </div>

        {/* Right column - extra stats */}
        <div className="space-y-4">
          <StatCard
            label="Total Projects"
            value={stats.projects}
            color="border-purple-500"
            icon="📁"
          />
          {role !== 'admin' && (
            <StatCard
              label="Pending Your Acceptance"
              value={stats.pendingAcceptance}
              color="border-yellow-500"
              icon="🔔"
            />
          )}
          {role === 'admin' && (
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow p-6 text-white">
              <p className="text-sm opacity-90 font-medium">Completion Rate</p>
              <p className="text-3xl font-bold mt-1">
                {stats.totalTasks > 0
                  ? Math.round((stats.resolved / stats.totalTasks) * 100)
                  : 0}
                %
              </p>
              <p className="text-xs opacity-75 mt-2">
                {stats.resolved} of {stats.totalTasks} tasks resolved
              </p>
            </div>
          )}
        </div>
      </div>

      {/* My Tasks list */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">My Tasks</h2>
          <Link
            to="/projects"
            className="text-indigo-600 text-sm font-medium hover:underline transition-colors"
          >
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
              <div
                key={task._id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
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
                    {task.dueDate &&
                      ` • Due ${new Date(task.dueDate).toLocaleDateString()}`}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge(task.status)}`}
                >
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
