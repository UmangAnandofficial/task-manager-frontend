import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const statusBadge = (status) => {
  const map = {
    'todo': 'bg-gray-100 text-gray-700',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    'done': 'bg-green-100 text-green-800',
  };
  return map[status] || map.todo;
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Task form state
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskAssignedTo, setTaskAssignedTo] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskError, setTaskError] = useState('');

  // Member form state
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [memberToAdd, setMemberToAdd] = useState('');
  const [memberError, setMemberError] = useState('');

  const loadAll = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?project=${id}`),
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);

      if (isAdmin) {
        const usersRes = await api.get('/users');
        setAllUsers(usersRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setTaskError('');
    try {
      await api.post('/tasks', {
        title: taskTitle,
        description: taskDescription,
        project: id,
        assignedTo: taskAssignedTo || null,
        dueDate: taskDueDate || null,
      });
      setTaskTitle('');
      setTaskDescription('');
      setTaskAssignedTo('');
      setTaskDueDate('');
      setShowTaskForm(false);
      loadAll();
    } catch (err) {
      setTaskError(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberError('');
    try {
      await api.post(`/projects/${id}/members`, { userId: memberToAdd });
      setMemberToAdd('');
      setShowMemberForm(false);
      loadAll();
    } catch (err) {
      setMemberError(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member from the project?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove');
    }
  };

  const canChangeStatus = (task) => {
    if (isAdmin) return true;
    return task.assignedTo && task.assignedTo._id === user._id;
  };

  const isOverdue = (task) =>
    task.dueDate && task.status !== 'done' && new Date(task.dueDate) < new Date();

  const availableUsersToAdd = allUsers.filter(
    (u) => !project?.members?.some((m) => m._id === u._id)
  );

  const groupedTasks = {
    todo: tasks.filter((t) => t.status === 'todo'),
    'in-progress': tasks.filter((t) => t.status === 'in-progress'),
    done: tasks.filter((t) => t.status === 'done'),
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
      {error}
      <button onClick={() => navigate('/projects')} className="ml-3 underline">Back to projects</button>
    </div>
  );
  if (!project) return null;

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate('/projects')} className="text-indigo-600 text-sm hover:underline mb-2">
          ← Back to projects
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
        {project.description && <p className="text-gray-500 mt-1">{project.description}</p>}
        <p className="text-xs text-gray-400 mt-2">
          Created by {project.createdBy?.name || 'Unknown'}
        </p>
      </div>

      {/* Members section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Members ({project.members?.length || 0})</h2>
          {isAdmin && availableUsersToAdd.length > 0 && (
            <button
              onClick={() => setShowMemberForm(!showMemberForm)}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              {showMemberForm ? 'Cancel' : '+ Add member'}
            </button>
          )}
        </div>

        {showMemberForm && (
          <form onSubmit={handleAddMember} className="mb-4 flex gap-2">
            {memberError && <div className="text-red-600 text-sm">{memberError}</div>}
            <select
              value={memberToAdd}
              onChange={(e) => setMemberToAdd(e.target.value)}
              required
              className="flex-1 px-3 py-2 border border-gray-300 rounded"
            >
              <option value="">Select a user...</option>
              {availableUsersToAdd.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email}) {u.role === 'admin' ? '👑' : ''}
                </option>
              ))}
            </select>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded">
              Add
            </button>
          </form>
        )}

        {project.members?.length === 0 ? (
          <p className="text-gray-500 text-sm">No members yet</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {project.members.map((m) => (
              <div key={m._id} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                <span>{m.name}</span>
                {m.role === 'admin' && <span className="text-yellow-600 text-xs">👑</span>}
                {isAdmin && (
                  <button
                    onClick={() => handleRemoveMember(m._id)}
                    className="text-red-500 hover:text-red-700 text-xs ml-1"
                    title="Remove member"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tasks section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Tasks ({tasks.length})</h2>
          {isAdmin && (
            <button
              onClick={() => setShowTaskForm(!showTaskForm)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium"
            >
              {showTaskForm ? 'Cancel' : '+ New Task'}
            </button>
          )}
        </div>

        {showTaskForm && (
          <form onSubmit={handleCreateTask} className="p-6 border-b border-gray-200 space-y-3 bg-gray-50">
            {taskError && <div className="bg-red-50 text-red-700 p-2 rounded text-sm">{taskError}</div>}
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
              placeholder="Task title"
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Description (optional)"
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                value={taskAssignedTo}
                onChange={(e) => setTaskAssignedTo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded"
              >
                <option value="">-- Unassigned --</option>
                {project.members?.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-medium">
              Create Task
            </button>
          </form>
        )}

        {tasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p>No tasks yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x divide-gray-200">
            {Object.entries(groupedTasks).map(([status, statusTasks]) => (
              <div key={status} className="p-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${statusBadge(status)}`}>
                    {status}
                  </span>
                  <span className="text-gray-400">({statusTasks.length})</span>
                </h3>
                <div className="space-y-2">
                  {statusTasks.map((task) => (
                    <div key={task._id} className={`bg-gray-50 rounded p-3 border ${isOverdue(task) ? 'border-red-300' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-medium text-gray-800 text-sm">{task.title}</p>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="text-red-400 hover:text-red-600 text-xs ml-2"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      {task.description && <p className="text-xs text-gray-500 mb-2">{task.description}</p>}
                      <div className="text-xs text-gray-500 space-y-1">
                        {task.assignedTo && (
                          <div>👤 {task.assignedTo.name}</div>
                        )}
                        {task.dueDate && (
                          <div className={isOverdue(task) ? 'text-red-600 font-medium' : ''}>
                            📅 {new Date(task.dueDate).toLocaleDateString()}
                            {isOverdue(task) && ' (OVERDUE)'}
                          </div>
                        )}
                      </div>
                      {canChangeStatus(task) && (
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task._id, e.target.value)}
                          className="mt-2 w-full text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      )}
                    </div>
                  ))}
                  {statusTasks.length === 0 && (
                    <p className="text-xs text-gray-400 italic">No tasks</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
