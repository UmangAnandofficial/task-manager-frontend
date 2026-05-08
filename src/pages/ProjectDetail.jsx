import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

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

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskAssignedTo, setTaskAssignedTo] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  const [showMemberForm, setShowMemberForm] = useState(false);
  const [memberToAdd, setMemberToAdd] = useState('');

  const [rejectingTaskId, setRejectingTaskId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const [reassigningTaskId, setReassigningTaskId] = useState(null);
  const [reassignTo, setReassignTo] = useState('');

  // confirmation modals - browser confirm() ke replacement
  const [confirmDeleteTask, setConfirmDeleteTask] = useState(null);
  const [confirmRemoveMember, setConfirmRemoveMember] = useState(null);

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
    try {
      await api.post('/tasks', {
        title: taskTitle,
        description: taskDescription,
        project: id,
        assignedTo: taskAssignedTo || null,
        dueDate: taskDueDate || null,
      });
      toast.success('Task created!');
      setTaskTitle('');
      setTaskDescription('');
      setTaskAssignedTo('');
      setTaskDueDate('');
      setShowTaskForm(false);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success(`Task moved to ${statusLabel(newStatus)}`);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleAccept = async (taskId) => {
    try {
      await api.post(`/tasks/${taskId}/accept`);
      toast.success('Task accepted! 🎉');
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept');
    }
  };

  const handleReject = async () => {
    try {
      await api.post(`/tasks/${rejectingTaskId}/reject`, {
        reason: rejectReason,
      });
      toast.success('Task rejected. Admin will reassign it.');
      setRejectingTaskId(null);
      setRejectReason('');
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };

  const handleReassign = async () => {
    try {
      await api.put(`/tasks/${reassigningTaskId}`, {
        assignedTo: reassignTo,
      });
      toast.success('Task reassigned!');
      setReassigningTaskId(null);
      setReassignTo('');
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reassign');
    }
  };

  const handleDeleteTask = async () => {
    if (!confirmDeleteTask) return;
    try {
      await api.delete(`/tasks/${confirmDeleteTask}`);
      toast.success('Task deleted');
      setConfirmDeleteTask(null);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
      setConfirmDeleteTask(null);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, { userId: memberToAdd });
      toast.success('Member added!');
      setMemberToAdd('');
      setShowMemberForm(false);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async () => {
    if (!confirmRemoveMember) return;
    try {
      await api.delete(`/projects/${id}/members/${confirmRemoveMember._id}`);
      toast.success(`${confirmRemoveMember.name} removed from project`);
      setConfirmRemoveMember(null);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove');
      setConfirmRemoveMember(null);
    }
  };

  const isAssignedToMe = (task) =>
    task.assignedTo && task.assignedTo._id === user._id;

  const isOverdue = (task) =>
    task.dueDate &&
    task.status !== 'resolved' &&
    new Date(task.dueDate) < new Date();

  const availableUsersToAdd = allUsers.filter(
    (u) => !project?.members?.some((m) => m._id === u._id)
  );

  const groupedTasks = {
    new: tasks.filter((t) => t.status === 'new'),
    assigned: tasks.filter((t) => t.status === 'assigned'),
    'in-progress': tasks.filter((t) => t.status === 'in-progress'),
    resolved: tasks.filter((t) => t.status === 'resolved'),
  };

  // skeleton loader
  if (loading)
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
          <div className="h-7 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-24 mb-4"></div>
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 rounded-full w-32"></div>
            <div className="h-8 bg-gray-200 rounded-full w-32"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-24 mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
        {error}
        <button
          onClick={() => navigate('/projects')}
          className="ml-3 underline"
        >
          Back to projects
        </button>
      </div>
    );
  if (!project) return null;

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate('/projects')}
          className="text-indigo-600 text-sm hover:underline mb-2 transition-colors"
        >
          ← Back to projects
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
        {project.description && (
          <p className="text-gray-500 mt-1">{project.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-2">
          Created by {project.createdBy?.name || 'Unknown'}
        </p>
      </div>

      {/* Members section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Members ({project.members?.length || 0})
          </h2>
          {isAdmin && availableUsersToAdd.length > 0 && (
            <button
              onClick={() => setShowMemberForm(!showMemberForm)}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors"
            >
              {showMemberForm ? 'Cancel' : '+ Add member'}
            </button>
          )}
        </div>

        {showMemberForm && (
          <form
            onSubmit={handleAddMember}
            className="mb-4 flex gap-2 animate-fadeIn"
          >
            <select
              value={memberToAdd}
              onChange={(e) => setMemberToAdd(e.target.value)}
              required
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select a user...</option>
              {availableUsersToAdd.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email}) {u.role === 'admin' ? '👑' : ''}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-lg transition-colors"
            >
              Add
            </button>
          </form>
        )}

        {project.members?.length === 0 ? (
          <p className="text-gray-500 text-sm">No members yet</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {project.members.map((m) => (
              <div
                key={m._id}
                className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2 text-sm hover:bg-gray-200 transition-colors"
              >
                <span>{m.name}</span>
                {m.role === 'admin' && (
                  <span className="text-yellow-600 text-xs">👑</span>
                )}
                {isAdmin && (
                  <button
                    onClick={() => setConfirmRemoveMember(m)}
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
          <h2 className="text-lg font-semibold text-gray-800">
            Tasks ({tasks.length})
          </h2>
          {isAdmin && (
            <button
              onClick={() => setShowTaskForm(!showTaskForm)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow transition-all"
            >
              {showTaskForm ? 'Cancel' : '+ New Task'}
            </button>
          )}
        </div>

        {showTaskForm && (
          <form
            onSubmit={handleCreateTask}
            className="p-6 border-b border-gray-200 space-y-3 bg-gray-50 animate-fadeIn"
          >
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
              placeholder="Task title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Description (optional)"
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                value={taskAssignedTo}
                onChange={(e) => setTaskAssignedTo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Create Task
            </button>
            <p className="text-xs text-gray-500">
              ℹ️ Task starts in <strong>"new"</strong> status. The assignee
              must accept it before work can begin.
            </p>
          </form>
        )}

        {tasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="text-5xl mb-3">📝</div>
            <p className="text-lg font-medium text-gray-700 mb-1">
              No tasks yet
            </p>
            <p className="text-sm">
              {isAdmin
                ? 'Create your first task to get started'
                : 'No tasks have been assigned to this project'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 lg:divide-x divide-gray-200">
            {Object.entries(groupedTasks).map(([status, statusTasks]) => (
              <div
                key={status}
                className="p-4 border-b lg:border-b-0 border-gray-200"
              >
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${statusBadge(status)}`}
                  >
                    {statusLabel(status)}
                  </span>
                  <span className="text-gray-400">({statusTasks.length})</span>
                </h3>
                <div className="space-y-2">
                  {statusTasks.map((task) => {
                    const pendingAcceptance =
                      task.status === 'new' && isAssignedToMe(task);
                    return (
                      <div
                        key={task._id}
                        className={`bg-gray-50 rounded-lg p-3 border transition-all duration-200 hover:shadow-sm ${
                          pendingAcceptance
                            ? 'border-yellow-400 ring-2 ring-yellow-200'
                            : isOverdue(task)
                              ? 'border-red-300'
                              : 'border-gray-200'
                        }`}
                      >
                        {pendingAcceptance && (
                          <div className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded mb-2 text-center">
                            🔔 PENDING YOUR ACCEPTANCE
                          </div>
                        )}

                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium text-gray-800 text-sm">
                            {task.title}
                          </p>
                          {isAdmin && (
                            <button
                              onClick={() => setConfirmDeleteTask(task._id)}
                              className="text-red-400 hover:text-red-600 text-xs ml-2 transition-colors"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-gray-500 mb-2">
                            {task.description}
                          </p>
                        )}

                        <div className="text-xs text-gray-500 space-y-1 mb-2">
                          {task.assignedTo ? (
                            <div>👤 {task.assignedTo.name}</div>
                          ) : (
                            <div className="text-orange-600">⚠️ Unassigned</div>
                          )}
                          {task.dueDate && (
                            <div
                              className={
                                isOverdue(task)
                                  ? 'text-red-600 font-medium'
                                  : ''
                              }
                            >
                              📅 {new Date(task.dueDate).toLocaleDateString()}
                              {isOverdue(task) && ' (OVERDUE)'}
                            </div>
                          )}
                          {task.rejectionReason && (
                            <div className="text-red-600 italic mt-1 p-1.5 bg-red-50 rounded border border-red-100">
                              <span className="font-semibold">
                                Previously rejected:
                              </span>{' '}
                              {task.rejectionReason}
                            </div>
                          )}
                        </div>

                        {!isAdmin && isAssignedToMe(task) && (
                          <div className="space-y-1">
                            {task.status === 'new' && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleAccept(task._id)}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-1.5 rounded font-medium transition-colors"
                                >
                                  ✓ Accept
                                </button>
                                <button
                                  onClick={() => setRejectingTaskId(task._id)}
                                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-1.5 rounded font-medium transition-colors"
                                >
                                  ✕ Reject
                                </button>
                              </div>
                            )}
                            {task.status === 'assigned' && (
                              <button
                                onClick={() =>
                                  handleStatusChange(task._id, 'in-progress')
                                }
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs py-1.5 rounded font-medium transition-colors"
                              >
                                ▶ Start Working
                              </button>
                            )}
                            {task.status === 'in-progress' && (
                              <button
                                onClick={() =>
                                  handleStatusChange(task._id, 'resolved')
                                }
                                className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-1.5 rounded font-medium transition-colors"
                              >
                                ✓ Mark Resolved
                              </button>
                            )}
                            {task.status === 'resolved' && (
                              <div className="text-center text-xs text-green-700 font-medium py-1">
                                ✓ Completed
                              </div>
                            )}
                          </div>
                        )}

                        {isAdmin && !task.assignedTo && (
                          <div>
                            {reassigningTaskId === task._id ? (
                              <div className="space-y-1">
                                <select
                                  value={reassignTo}
                                  onChange={(e) =>
                                    setReassignTo(e.target.value)
                                  }
                                  className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                                >
                                  <option value="">Select member...</option>
                                  {project.members?.map((m) => (
                                    <option key={m._id} value={m._id}>
                                      {m.name}
                                    </option>
                                  ))}
                                </select>
                                <div className="flex gap-1">
                                  <button
                                    onClick={handleReassign}
                                    disabled={!reassignTo}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white text-xs py-1 rounded transition-colors"
                                  >
                                    Assign
                                  </button>
                                  <button
                                    onClick={() => {
                                      setReassigningTaskId(null);
                                      setReassignTo('');
                                    }}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-xs py-1 rounded transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setReassigningTaskId(task._id)}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1.5 rounded font-medium transition-colors"
                              >
                                Reassign
                              </button>
                            )}
                          </div>
                        )}

                        {isAdmin && task.assignedTo && (
                          <select
                            value={task.status}
                            onChange={(e) =>
                              handleStatusChange(task._id, e.target.value)
                            }
                            className="mt-1 w-full text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="new">New</option>
                            <option value="assigned">Assigned</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        )}
                      </div>
                    );
                  })}
                  {statusTasks.length === 0 && (
                    <p className="text-xs text-gray-400 italic text-center py-4">
                      No tasks
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject modal */}
      {rejectingTaskId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Reject Task
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              The task will go back to admin for reassignment. Please share why
              you're rejecting (optional).
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)"
              rows="3"
              maxLength="300"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setRejectingTaskId(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete task confirmation */}
      {confirmDeleteTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Delete Task
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this task? This action cannot be
              undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDeleteTask(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTask}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove member confirmation */}
      {confirmRemoveMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Remove Member
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Remove <strong>{confirmRemoveMember.name}</strong> from this
              project? Their assigned tasks will become unassigned.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmRemoveMember(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveMember}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
