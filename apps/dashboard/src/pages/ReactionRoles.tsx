import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { toast } from '../components/ui/Toast';
import { reactionTemplates } from '../lib/reactionTemplates';
import { Smile, Plus, Trash2, MessageSquare, LayoutTemplate, X, Check } from 'lucide-react';

interface Channel { id: string; name: string }
interface Role { id: string; name: string; color: number }
interface ReactionRole { id: number; messageId: string; channelId: string; emoji: string; roleId: string; roleName?: string }

export function ReactionRolesPage() {
  const { guildId } = useParams();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [messageId, setMessageId] = useState('');
  const [emoji, setEmoji] = useState('');
  const [channelId, setChannelId] = useState('');
  const [roleId, setRoleId] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ReactionRole | null>(null);

  const { data: reactionRoles, isLoading } = useQuery({
    queryKey: ['reaction-roles', guildId],
    queryFn: () => api.get(`/api/guilds/${guildId}/reaction-roles`).then((r) => r.data),
  });

  const { data: channels } = useQuery({
    queryKey: ['channels', guildId],
    queryFn: () => api.get(`/api/guilds/${guildId}/channels`).then((r) => r.data),
  });

  const { data: roles } = useQuery({
    queryKey: ['roles', guildId],
    queryFn: () => api.get(`/api/guilds/${guildId}/roles`).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post(`/api/guilds/${guildId}/reaction-roles`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reaction-roles', guildId] });
      setShowForm(false); setMessageId(''); setEmoji(''); setChannelId(''); setRoleId('');
      toast('success', 'Reaction role berhasil dibuat');
    },
    onError: () => toast('error', 'Gagal membuat reaction role'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/guilds/${guildId}/reaction-roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reaction-roles', guildId] });
      setDeleteTarget(null);
      toast('success', 'Reaction role berhasil dihapus');
    },
    onError: () => {
      toast('error', 'Gagal menghapus reaction role');
      setDeleteTarget(null);
    },
  });

  const handleSubmit = () => {
    if (!messageId.match(/^\d{17,19}$/)) { toast('error', 'Message ID tidak valid'); return; }
    if (!emoji || !roleId) { toast('error', 'Emoji dan Role harus diisi'); return; }
    createMutation.mutate({ messageId, channelId, emoji, roleId });
  };

  const applyTemplate = (tpl: typeof reactionTemplates[number]) => {
    setEmoji(tpl.emoji);
    setRoleId('');
    setShowTemplates(false);
    setShowForm(true);
  };

  const getRoleName = (roleId: string) => {
    const role = (roles || []).find((r: Role) => r.id === roleId);
    return role?.name || roleId;
  };

  const getChannelName = (channelId: string) => {
    const ch = (channels || []).find((c: Channel) => c.id === channelId);
    return ch ? `#${ch.name}` : channelId;
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reaction Roles</h1>
          <p className="text-gray-400 text-sm mt-1">Role otomatis berdasarkan reaksi pada pesan</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-2 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 text-gray-300 px-5 py-2.5 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <LayoutTemplate className="w-4 h-4" />
            Template
          </button>
          <button
            onClick={() => { setShowForm(!showForm); setShowTemplates(false); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Buat Manual
          </button>
        </div>
      </div>

      <div className="bg-blue-900/20 border border-blue-800/40 rounded-xl p-4 flex items-start gap-3">
        <MessageSquare className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-blue-300 text-sm">
          Aktifkan <strong>Developer Mode</strong> di Discord, lalu klik kanan pesan → <strong>Copy ID</strong>
        </p>
      </div>

      {showTemplates && (
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5 text-indigo-400" />
              Template Reaction Roles
            </h2>
            <button onClick={() => setShowTemplates(false)} className="text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-400 text-sm mb-5">Pilih template, lalu atur Message ID dan Channel-nya secara manual.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {reactionTemplates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => applyTemplate(tpl)}
                className="bg-gray-700/30 hover:bg-gray-700/60 border border-gray-600/30 hover:border-indigo-500/40 rounded-xl p-4 text-center transition-all group"
              >
                <span className="text-3xl block mb-2">{tpl.emoji}</span>
                <p className="text-white text-sm font-medium truncate">{tpl.name.split(' ').slice(1).join(' ')}</p>
                <p className="text-gray-500 text-xs mt-1 truncate">{tpl.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Buat Reaction Role Baru</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div>
            <label className="text-gray-400 text-sm font-medium">Message ID</label>
            <input
              value={messageId}
              onChange={(e) => setMessageId(e.target.value)}
              placeholder="Tempel Message ID dari Discord"
              className="w-full mt-1.5 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm font-medium">Channel</label>
            <select
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              className="w-full mt-1.5 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500/50 transition-colors"
            >
              <option value="">Pilih channel</option>
              {(channels || []).map((ch: Channel) => (
                <option key={ch.id} value={ch.id}>#{ch.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-sm font-medium">Emoji</label>
            <div className="flex gap-3 items-center mt-1.5">
              <input
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder='🎮 atau <:name:id>'
                className="flex-1 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
              {emoji && <span className="text-3xl">{emoji}</span>}
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-sm font-medium">Role</label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="w-full mt-1.5 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500/50 transition-colors"
            >
              <option value="">Pilih role</option>
              {(roles || []).map((r: Role) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 bg-gray-700/50 border border-gray-600/50 text-gray-300 rounded-xl hover:text-white transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(reactionRoles || []).map((rr: ReactionRole) => (
          <div key={rr.id} className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 hover:border-gray-600/50 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">{rr.emoji}</span>
              <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-xs font-medium rounded-full border border-indigo-500/20">
                Baru
              </span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-white font-medium text-sm">{getRoleName(rr.roleId)}</span>
            </div>
            <div className="flex flex-col gap-1.5 text-gray-500 text-xs mb-4">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3" />
                {getChannelName(rr.channelId)}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="font-mono text-[11px] text-gray-600 bg-gray-700/30 px-1.5 py-0.5 rounded">
                  ID: {rr.messageId.slice(0, 12)}...
                </span>
              </span>
            </div>
            <button
              onClick={() => setDeleteTarget(rr)}
              className="w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-400 px-3 py-2 rounded-xl text-sm transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Hapus
            </button>
          </div>
        ))}
        {(reactionRoles || []).length === 0 && !showForm && (
          <div className="col-span-full text-center py-16">
            <Smile className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada reaction role</p>
            <p className="text-gray-600 text-sm mt-1">Klik <strong>"Template"</strong> untuk pilih template cepat atau <strong>"Buat Manual"</strong></p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Reaction Role"
        message={`Apakah kamu yakin ingin menghapus reaction role ${deleteTarget ? getRoleName(deleteTarget.roleId) : ''}?`}
        confirmLabel="Hapus"
        destructive
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
