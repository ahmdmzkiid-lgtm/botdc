interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  destructive?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Konfirmasi',
  destructive = true,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 text-gray-300 rounded-xl hover:text-white transition-all"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              destructive
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
