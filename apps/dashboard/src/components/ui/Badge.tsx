interface BadgeProps {
  children: React.ReactNode;
  color?: string;
}

export function Badge({ children, color }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border"
      style={{
        backgroundColor: color ? `${color}15` : undefined,
        color: color || undefined,
        borderColor: color ? `${color}30` : undefined,
      }}
    >
      {children}
    </span>
  );
}
