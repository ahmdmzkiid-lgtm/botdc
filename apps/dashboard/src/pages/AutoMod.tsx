import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Switch } from '../components/ui/Switch';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { toast } from '../components/ui/Toast';
import { Shield, Ban, AlertTriangle, Gavel, Save, Filter } from 'lucide-react';

interface ModLogEntry { id: number; userId: string; moderatorId: string; action: string; reason: string | null; createdAt: string }
interface ModLogResponse { data: ModLogEntry[]; total: number; page: number; totalPages: number }

export function AutoModPage() {
  const { guildId } = useParams();
  const queryClient = useQueryClient();
  const [logPage, setLogPage] = useState(1);
  const [logFilter, setLogFilter] = useState('');

  const { data: config, isLoading } = useQuery({
    queryKey: ['automod-config', guildId],
    queryFn: () => api.get(`/api/guilds/${guildId}/automod`).then((r) => r.data),
  });

  const { data: modLogs } = useQuery({
    queryKey: ['mod-logs', guildId, logPage, logFilter],
    queryFn: () =>
      api
        .get(`/api/guilds/${guildId}/mod-logs?page=${logPage}&limit=10${logFilter ? `&action=${logFilter}` : ''}`)
        .then((r) => r.data as ModLogResponse),
  });

  const [antiInvite, setAntiInvite] = useState(false);
  const [antiSpam, setAntiSpam] = useState(false);
  const [spamThreshold, setSpamThreshold] = useState(5);
  const [bannedWordsText, setBannedWordsText] = useState('');
  const [warnThreshold, setWarnThreshold] = useState(3);
  const [muteDuration, setMuteDuration] = useState(60);

  useEffect(() => {
    if (config) {
      setAntiInvite(config.antiInvite || false);
      setAntiSpam(config.antiSpam || false);
      setSpamThreshold(config.spamThreshold || 5);
      setBannedWordsText((config.bannedWords || []).join('\n'));
      setWarnThreshold(config.warnThreshold || 3);
      setMuteDuration(config.muteDurationMin || 60);
    }
  }, [config]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => api.patch(`/api/guilds/${guildId}/automod`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automod-config', guildId] });
      toast('success', 'Konfigurasi auto-mod berhasil disimpan');
    },
    onError: () => toast('error', 'Gagal menyimpan konfigurasi auto-mod'),
  });

  const handleSave = () => {
    saveMutation.mutate({
      antiInvite, antiSpam, spamThreshold,
      bannedWords: bannedWordsText.split('\n').filter((w) => w.trim()),
      warnThreshold, muteDurationMin: muteDuration,
    });
  };

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      WARN: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
      MUTE: 'bg-red-600/20 text-red-400 border-red-600/30',
      UNMUTE: 'bg-green-600/20 text-green-400 border-green-600/30',
      KICK: 'bg-orange-600/20 text-orange-400 border-orange-600/30',
      BAN: 'bg-red-800/20 text-red-300 border-red-800/30',
    };
    return (
      <span className={`${colors[action] || 'bg-gray-600/20 text-gray-400 border-gray-600/30'} px-2.5 py-0.5 rounded-lg text-xs font-medium border`}>
        {action}
      </span>
    );
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-white">Auto-Moderation</h1>
        <p className="text-gray-400 text-sm mt-1">Lindungi server dari spam, invite, dan kata terlarang</p>
      </div>

      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg mt-0.5">
              <Ban className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Anti-Invite</h2>
              <p className="text-gray-400 text-sm mt-0.5">Hapus otomatis pesan yang mengandung link undangan server Discord lain</p>
            </div>
          </div>
          <Switch checked={antiInvite} onChange={setAntiInvite} />
        </div>
      </div>

      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg mt-0.5">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Anti-Spam</h2>
              <p className="text-gray-400 text-sm mt-0.5">Deteksi spam berdasarkan jumlah pesan dalam 5 detik</p>
            </div>
          </div>
          <Switch checked={antiSpam} onChange={setAntiSpam} />
        </div>
        {antiSpam && (
          <div className="ml-14">
            <label className="text-gray-400 text-sm font-medium">Batas pesan (per 5 detik): {spamThreshold}</label>
            <input
              type="range" min={3} max={20}
              value={spamThreshold}
              onChange={(e) => setSpamThreshold(Number(e.target.value))}
              className="w-full mt-2 accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>3</span><span>20</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="p-2 bg-red-500/10 rounded-lg mt-0.5">
            <Ban className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Kata Terlarang</h2>
            <p className="text-gray-400 text-sm mt-0.5">Satu kata per baris. Pesan yang mengandung kata-kata ini akan dihapus.</p>
          </div>
        </div>
        <textarea
          value={bannedWordsText}
          onChange={(e) => setBannedWordsText(e.target.value)}
          className="w-full bg-gray-700/50 border border-gray-600/50 text-white rounded-xl px-3 py-2.5 h-32 focus:outline-none focus:border-indigo-500/50 transition-colors"
          placeholder="kata1&#10;kata2&#10;kata3"
        />
        <p className="text-gray-500 text-xs mt-2">
          {bannedWordsText.split('\n').filter((w) => w.trim()).length} kata diblokir
        </p>
      </div>

      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="p-2 bg-purple-500/10 rounded-lg mt-0.5">
            <Gavel className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Aturan Hukuman</h2>
            <p className="text-gray-400 text-sm mt-0.5">Konfigurasi batas peringatan dan durasi mute otomatis</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-gray-400 text-sm font-medium">Warn sebelum mute (1-10)</label>
            <input
              type="number" min={1} max={10}
              value={warnThreshold}
              onChange={(e) => setWarnThreshold(Number(e.target.value))}
              className="w-full mt-1.5 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm font-medium">Durasi mute</label>
            <select
              value={muteDuration}
              onChange={(e) => setMuteDuration(Number(e.target.value))}
              className="w-full mt-1.5 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500/50 transition-colors"
            >
              <option value={10}>10 menit</option>
              <option value={30}>30 menit</option>
              <option value={60}>1 jam</option>
              <option value={360}>6 jam</option>
              <option value={720}>12 jam</option>
              <option value={1440}>24 jam</option>
              <option value={10080}>7 hari</option>
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saveMutation.isPending}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        {saveMutation.isPending ? 'Menyimpan...' : 'Simpan Konfigurasi'}
      </button>

      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Log Moderasi</h2>
        </div>
        <div className="flex gap-2 mb-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select
              value={logFilter}
              onChange={(e) => { setLogFilter(e.target.value); setLogPage(1); }}
              className="bg-gray-700/50 border border-gray-600/50 text-white rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
            >
              <option value="">Semua aksi</option>
              <option value="WARN">WARN</option>
              <option value="MUTE">MUTE</option>
              <option value="UNMUTE">UNMUTE</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-gray-700/50">
                <th className="pb-3 font-medium">Waktu</th>
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Moderator</th>
                <th className="pb-3 font-medium">Aksi</th>
                <th className="pb-3 font-medium">Alasan</th>
              </tr>
            </thead>
            <tbody>
              {(modLogs?.data || []).map((log: ModLogEntry) => (
                <tr key={log.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                  <td className="py-3 text-gray-400 text-sm">{new Date(log.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 text-white text-sm font-medium">{log.userId.slice(0, 8)}...</td>
                  <td className="py-3 text-white text-sm">{log.moderatorId.slice(0, 8)}...</td>
                  <td className="py-3">{getActionBadge(log.action)}</td>
                  <td className="py-3 text-gray-400 text-sm">{log.reason || '-'}</td>
                </tr>
              ))}
              {(modLogs?.data || []).length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-gray-500 text-center">Belum ada log moderasi</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {modLogs && modLogs.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-5">
            <button
              onClick={() => setLogPage(Math.max(1, logPage - 1))}
              disabled={logPage === 1}
              className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-sm text-gray-300 hover:text-white hover:border-gray-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Prev
            </button>
            <span className="text-gray-400 text-sm">Page {logPage} of {modLogs.totalPages}</span>
            <button
              onClick={() => setLogPage(logPage + 1)}
              disabled={logPage >= modLogs.totalPages}
              className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-sm text-gray-300 hover:text-white hover:border-gray-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
