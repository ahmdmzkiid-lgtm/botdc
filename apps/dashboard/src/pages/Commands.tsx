import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { toast } from '../components/ui/Toast';
import { commandTemplates } from '../lib/commandTemplates';
import { Terminal, Plus, Pencil, Trash2, Save, X, Info, LayoutTemplate } from 'lucide-react';

interface Command { id: number; name: string; description: string; response: string }

export function CommandsPage() {
  const { guildId } = useParams();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [response, setResponse] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Command | null>(null);

  const { data: commands, isLoading } = useQuery({
    queryKey: ['commands', guildId],
    queryFn: () => api.get(`/api/guilds/${guildId}/commands`).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post(`/api/guilds/${guildId}/commands`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands', guildId] });
      resetForm();
      toast('success', 'Command berhasil ditambahkan');
    },
    onError: () => toast('error', 'Gagal menambahkan command'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.patch(`/api/guilds/${guildId}/commands/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands', guildId] });
      resetForm();
      toast('success', 'Command berhasil diperbarui');
    },
    onError: () => toast('error', 'Gagal memperbarui command'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/guilds/${guildId}/commands/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands', guildId] });
      setDeleteTarget(null);
      toast('success', 'Command berhasil dihapus');
    },
    onError: () => {
      toast('error', 'Gagal menghapus command');
      setDeleteTarget(null);
    },
  });

  const resetForm = () => { setShowForm(false); setEditId(null); setName(''); setDescription(''); setResponse(''); };

  const handleEdit = (cmd: Command) => {
    setEditId(cmd.id); setName(cmd.name); setDescription(cmd.description); setResponse(cmd.response); setShowForm(true);
  };

  const handleSubmit = () => {
    if (!name || !description || !response) { toast('error', 'Semua field harus diisi'); return; }
    if (nameError) { toast('error', 'Format nama command tidak valid'); return; }
    const data = { name, description, response };
    if (editId) updateMutation.mutate({ id: editId, data });
    else createMutation.mutate(data);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const nameError = name && !/^[a-z0-9-]{1,32}$/.test(name);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Custom Commands</h1>
          <p className="text-gray-400 text-sm mt-1">
            {(commands || []).length} dari 100 commands digunakan
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setShowTemplates(!showTemplates); resetForm(); }}
            className="flex items-center gap-2 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 text-gray-300 px-5 py-2.5 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <LayoutTemplate className="w-4 h-4" />
            Template
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(!showForm); setShowTemplates(false); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Tambah Command
          </button>
        </div>
      </div>

      <div className="bg-blue-900/20 border border-blue-800/40 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-blue-300 text-sm">
          Setelah menyimpan, command akan langsung aktif di server Discord dalam beberapa detik
        </p>
      </div>

      {showTemplates && (
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5 text-indigo-400" />
              Template Command
            </h2>
            <button onClick={() => setShowTemplates(false)} className="text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-400 text-sm mb-5">Pilih template, lalu sesuaikan dengan kebutuhan server kamu.</p>
          {['Informasi', 'Fun', 'Moderasi', 'Sosial'].map((cat) => {
            const items = commandTemplates.filter((t) => t.category === cat);
            return (
              <div key={cat} className="mb-6 last:mb-0">
                <h3 className="text-gray-300 text-sm font-medium mb-3">{cat}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {items.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => {
                        setName(tpl.name);
                        setDescription(tpl.desc);
                        setResponse(tpl.response);
                        setShowTemplates(false);
                        setShowForm(true);
                      }}
                      className="bg-gray-700/30 hover:bg-gray-700/60 border border-gray-600/30 hover:border-indigo-500/40 rounded-xl p-4 text-left transition-all group"
                    >
                      <p className="text-white text-sm font-medium font-mono">/{tpl.name}</p>
                      <p className="text-gray-500 text-xs mt-1">{tpl.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 space-y-5 animate-fade-in">
          <h2 className="text-lg font-semibold text-white">
            {editId ? 'Edit Command' : 'Tambah Command Baru'}
          </h2>
          <div>
            <label className="text-gray-400 text-sm font-medium">Nama Command</label>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-gray-500 text-lg font-mono">/</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase())}
                placeholder="nama-command"
                className="flex-1 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
            {name && !nameError && (
              <p className="text-gray-500 text-xs mt-1.5">Preview: <span className="text-indigo-400">/{name}</span></p>
            )}
            {nameError && (
              <p className="text-red-400 text-xs mt-1.5">Hanya huruf kecil, angka, dan tanda hubung (1-32 karakter)</p>
            )}
          </div>
          <div>
            <label className="text-gray-400 text-sm font-medium">Deskripsi ({description.length}/100)</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 100))}
              placeholder="Deskripsi singkat command"
              className="w-full mt-1.5 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm font-medium">Respons ({response.length}/2000)</label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value.slice(0, 2000))}
              placeholder="Teks respons bot"
              className="w-full mt-1.5 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl px-3 py-2.5 h-24 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={!name || !description || !response || !!nameError || isPending}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isPending ? 'Menyimpan...' : editId ? 'Update' : 'Simpan'}
            </button>
            <button
              onClick={resetForm}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-700/50 border border-gray-600/50 text-gray-300 rounded-xl hover:text-white transition-colors"
            >
              <X className="w-4 h-4" /> Batal
            </button>
          </div>
        </div>
      )}

      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-700/50">
              <th className="px-5 py-3.5 font-medium">Command</th>
              <th className="px-5 py-3.5 font-medium">Deskripsi</th>
              <th className="px-5 py-3.5 font-medium hidden md:table-cell">Respons</th>
              <th className="px-5 py-3.5 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {(commands || []).map((cmd: Command) => (
              <tr key={cmd.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                <td className="px-5 py-3.5">
                  <span className="text-indigo-400 font-mono font-medium">/{cmd.name}</span>
                </td>
                <td className="px-5 py-3.5 text-gray-300 text-sm">{cmd.description}</td>
                <td className="px-5 py-3.5 text-gray-500 text-sm hidden md:table-cell">
                  {cmd.response.length > 60 ? cmd.response.slice(0, 60) + '...' : cmd.response}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(cmd)}
                      className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-sm px-2.5 py-1.5 rounded-lg hover:bg-indigo-500/10 transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(cmd)}
                      className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-sm px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {(commands || []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center">
                  <Terminal className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500">Belum ada command</p>
                  <p className="text-gray-600 text-sm mt-1">Klik "+ Tambah Command" untuk membuat yang baru</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Command"
        message={`Apakah kamu yakin ingin menghapus command /${deleteTarget?.name}? Aksi ini tidak bisa dibatalkan.`}
        confirmLabel="Hapus"
        destructive
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
