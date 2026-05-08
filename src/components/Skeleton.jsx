export const StatCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-200 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-12"></div>
      </div>
      <div className="h-8 w-8 bg-gray-200 rounded"></div>
    </div>
  </div>
);

export const ProjectCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow p-6 animate-pulse">
    <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
    <div className="flex justify-between items-center">
      <div className="h-3 bg-gray-200 rounded w-16"></div>
      <div className="h-3 bg-gray-200 rounded w-20"></div>
    </div>
  </div>
);

export const TaskRowSkeleton = () => (
  <div className="px-6 py-4 flex items-center justify-between animate-pulse border-b border-gray-100">
    <div className="flex-1">
      <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-32"></div>
    </div>
    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
  </div>
);

export const KanbanColumnSkeleton = () => (
  <div className="p-4 animate-pulse">
    <div className="h-5 bg-gray-200 rounded w-24 mb-3"></div>
    <div className="space-y-2">
      <div className="bg-gray-100 rounded p-3 h-20"></div>
      <div className="bg-gray-100 rounded p-3 h-20"></div>
    </div>
  </div>
);