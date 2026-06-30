export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
    </div>
  );
}
