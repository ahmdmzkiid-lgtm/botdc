import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-gray-700 mb-4">{icon}</div>}
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      {description && <p className="text-gray-400 text-sm mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}
