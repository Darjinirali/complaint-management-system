export const StatusBadge = ({ status }) => {
  const map = {
    'Pending': 'badge-pending',
    'Assigned': 'badge-assigned',
    'In Progress': 'badge-inprogress',
    'Resolved': 'badge-resolved',
    'Closed': 'badge-closed',
    'Rejected': 'badge-rejected',
  };
  return <span className={`badge ${map[status] || 'badge-pending'}`}>{status}</span>;
};

export const PriorityBadge = ({ priority }) => {
  const map = {
    'Low': 'badge-low',
    'Medium': 'badge-medium',
    'High': 'badge-high',
    'Critical': 'badge-critical',
  };
  return <span className={`badge ${map[priority] || 'badge-medium'}`}>{priority}</span>;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};