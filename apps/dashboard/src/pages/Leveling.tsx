import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { toast } from '../components/ui/Toast';
import { useAuthStore } from '../stores/authStore';
import { Zap, Medal, Trophy, Plus, Trash2, RefreshCw, Save, Settings, Crown, Star, Bell, Hash } from 'lucide-react';

interface Channel { id: string; name: string }
interface Role { id: string; name: string; color: number }
interface LevelRole { id: number; level: number; roleId: string; roleName?: string }
interface LeaderboardEntry { rank: number; userId: string; username: string; level: number; xp: number; totalMessages: number }

const tabs = [
  { id: 'xp', label: 'XP Settings', icon: Settings },
  { id: 'rewards', label: 'Level Rewards', icon: Medal },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
] as const;

type TabId = typeof tabs[number]['id'];

export function LevelingPage() {
  const { guildId } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>('xp');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<LevelRole | null>(null);

  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ['guild-config', guildId],
    queryFn: () => api.get(`/api/guilds/${guildId}/config`).then((r) => r.data),
  });

  const { data: channels } = useQuery({
    queryKey: ['channels', guildId],
    queryFn: () => api.get(`/api/guilds/${guildId}/channels`).then((r) => r.data),
  });

  const { data: roles } = useQuery({
    queryKey: ['roles', guildId],
    queryFn: () => api.get(`/api/guilds/${guildId}/roles`).then((r) => r.data),
  });

  const { data: leaderboard, isLoading: lbLoading } = useQuery({
    queryKey: ['leaderboard', guildId, page],
    queryFn: () => api.get(`/api/guilds/${guildId}/leaderboard?limit=10`).then((r) => r.data),
  });

  const { data: levelRoles, isLoading: lrLoading } = useQuery({
    queryKey: ['level-roles', guildId],
    queryFn: () => api.get(`/api/guilds/${guildId}/level-roles`).then((r) => r.data),
  });

  const [xpPerMessage, setXpPerMessage] = useState(10);
  const [xpCooldownSec, setXpCooldownSec] = useState(60);
  const [newLevel, setNewLevel] = useState(1);
  const [newRoleId, setNewRoleId] = useState('');

  const [levelUpEnabled, setLevelUpEnabled] = useState(false);
  const [levelUpChannelId, setLevelUpChannelId] = useState('');
  const [levelUpMessage, setLevelUpMessage] = useState('');

  useEffect(() => {
    if (config) {
      setXpPerMessage(config.xpPerMessage);
      setXpCooldownSec(config.xpCooldownSec);
      setLevelUpEnabled(config.levelUpEnabled ?? false);
      setLevelUpChannelId(config.levelUpChannelId ?? '');
      setLevelUpMessage(config.levelUpMessage ?? '🎉 Selamat {user}, kamu naik ke **Level {level}**!');
    }
  }, [config]);

  const xpMutation = useMutation({
    mutationFn: (data: any) => api.patch(`/api/guilds/${guildId}/xp-config`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild-config', guildId] });
      toast('success', 'Pengaturan XP berhasil disimpan');
    },
    onError: () => toast('error', 'Gagal menyimpan pengaturan XP'),
  });

  const levelUpMutation = useMutation({
    mutationFn: (data: any) => api.patch(`/api/guilds/${guildId}/levelup-config`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild-config', guildId] });
      toast('success', 'Pengaturan level up berhasil disimpan');
    },
    onError: () => toast('error', 'Gagal menyimpan pengaturan level up'),
  });

  const addLevelRoleMutation = useMutation({
    mutationFn: (data: any) => api.post(`/api/guilds/${guildId}/level-roles`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['level-roles', guildId] });
      setNewLevel(1); setNewRoleId('');
      toast('success', 'Level role reward berhasil ditambahkan');
    },
    onError: () => toast('error', 'Gagal menambahkan level role reward'),
  });

  const deleteLevelRoleMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/guilds/${guildId}/level-roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['level-roles', guildId] });
      setDeleteTarget(null);
      toast('success', 'Level role reward berhasil dihapus');
    },
    onError: () => {
      toast('error', 'Gagal menghapus level role reward');
      setDeleteTarget(null);
    },
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRoleName = (roleId: string) => {
    const role = (roles || []).find((r: Role) => r.id === roleId);
    return role?.name || roleId;
  };

  if (configLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-white">Leveling & XP</h1>
        <p className="text-gray-400 text-sm mt-1">Atur sistem level dan experience member</p>
      </div>

      <div className="flex gap-1 bg-gray-800/30 rounded-xl p-1 border border-gray-700/30">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'xp' && (
        <>
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-yellow-500/10 rounded-xl">
                <Zap className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Pengaturan XP</h2>
                <p className="text-gray-500 text-xs mt-0.5">Atur jumlah XP dan cooldown per pesan</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-gray-900/30 rounded-xl p-4 border border-gray-700/30">
                <label className="text-gray-400 text-sm font-medium">XP per pesan</label>
                <div className="flex items-center gap-4 mt-3">
                  <input
                    type="range" min={1} max={100}
                    value={xpPerMessage}
                    onChange={(e) => setXpPerMessage(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-white font-bold text-lg min-w-[3ch] text-right">{xpPerMessage}</span>
                </div>
                <p className="text-gray-600 text-xs mt-2">Jumlah XP yang didapat per pesan (1-100)</p>
              </div>
              <div className="bg-gray-900/30 rounded-xl p-4 border border-gray-700/30">
                <label className="text-gray-400 text-sm font-medium">Cooldown</label>
                <div className="flex items-center gap-4 mt-3">
                  <input
                    type="range" min={0} max={300} step={5}
                    value={xpCooldownSec}
                    onChange={(e) => setXpCooldownSec(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-white font-bold text-lg min-w-[4ch] text-right">{xpCooldownSec}s</span>
                </div>
                <p className="text-gray-600 text-xs mt-2">Waktu tunggu antar pesan (0-300 detik)</p>
              </div>
            </div>
            <button
              onClick={() => xpMutation.mutate({ xpPerMessage, xpCooldownSec })}
              disabled={xpMutation.isPending}
              className="mt-6 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {xpMutation.isPending ? 'Menyimpan...' : 'Simpan Pengaturan XP'}
            </button>
          </div>

          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-green-500/10 rounded-xl">
                <Bell className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Pesan Level Up</h2>
                <p className="text-gray-500 text-xs mt-0.5">Atur notifikasi saat member naik level</p>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer mb-6">
              <div className={`w-11 h-6 rounded-full transition-colors relative ${levelUpEnabled ? 'bg-indigo-600' : 'bg-gray-600'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${levelUpEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </div>
              <span className="text-white text-sm font-medium">Kirim pesan saat level up</span>
              <input type="checkbox" checked={levelUpEnabled} onChange={() => setLevelUpEnabled(!levelUpEnabled)} className="hidden" />
            </label>

            {levelUpEnabled && (
              <div className="space-y-5">
                <div>
                  <label className="text-gray-400 text-sm font-medium">Channel notifikasi</label>
                  <select
                    value={levelUpChannelId}
                    onChange={(e) => setLevelUpChannelId(e.target.value)}
                    className="w-full mt-1.5 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  >
                    <option value="">Pilih channel</option>
                    {(channels || []).map((ch: Channel) => (
                      <option key={ch.id} value={ch.id}>#{ch.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm font-medium">Pesan level up</label>
                  <textarea
                    value={levelUpMessage}
                    onChange={(e) => setLevelUpMessage(e.target.value)}
                    rows={3}
                    className="w-full mt-1.5 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
                  />
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {['{user}', '{level}', '{server}', '{memberCount}'].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setLevelUpMessage((prev) => prev + v)}
                        className="px-2.5 py-1 bg-gray-700/50 border border-gray-600/50 text-gray-300 rounded-lg text-xs hover:border-indigo-500/40 hover:text-white transition-all"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <p className="text-gray-600 text-xs mt-1.5">Klik variable untuk menyisipkan ke pesan</p>
                </div>
              </div>
            )}

            <button
              onClick={() => levelUpMutation.mutate({ levelUpEnabled, levelUpChannelId, levelUpMessage })}
              disabled={levelUpMutation.isPending}
              className="mt-6 flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {levelUpMutation.isPending ? 'Menyimpan...' : 'Simpan Pengaturan Level Up'}
            </button>
          </div>
        </>
      )}

      {activeTab === 'rewards' && (
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-purple-500/10 rounded-xl">
              <Medal className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Level Role Rewards</h2>
              <p className="text-gray-500 text-xs mt-0.5">Role otomatis saat member mencapai level tertentu</p>
            </div>
          </div>

          {lrLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-3">
              {(levelRoles || []).length > 0 ? (
                (levelRoles || []).map((lr: LevelRole, i: number) => (
                  <div
                    key={lr.id}
                    className="flex items-center justify-between bg-gray-900/30 border border-gray-700/30 rounded-xl px-5 py-4 hover:border-gray-600/50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-sm">
                        {lr.level}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-yellow-500" />
                          <span className="text-white font-medium">{getRoleName(lr.roleId)}</span>
                        </div>
                        <p className="text-gray-500 text-xs mt-0.5">Level {lr.level} reward</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setDeleteTarget(lr)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Medal className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500">Belum ada level role rewards</p>
                  <p className="text-gray-600 text-sm mt-1">Tambah reward di bawah</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-700/30">
            <h3 className="text-white text-sm font-medium mb-4">Tambah Reward Baru</h3>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="text-gray-400 text-xs font-medium">Level</label>
                <input
                  type="number" min={1}
                  value={newLevel}
                  onChange={(e) => setNewLevel(Number(e.target.value))}
                  className="mt-1.5 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl px-3 py-2.5 w-24 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>
              <div className="min-w-[200px]">
                <label className="text-gray-400 text-xs font-medium">Role</label>
                <select
                  value={newRoleId}
                  onChange={(e) => setNewRoleId(e.target.value)}
                  className="w-full mt-1.5 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500/50 transition-colors"
                >
                  <option value="">Pilih role</option>
                  {(roles || []).map((r: Role) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => newRoleId && addLevelRoleMutation.mutate({ level: newLevel, roleId: newRoleId })}
                disabled={!newRoleId || addLevelRoleMutation.isPending}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> Tambah
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                <Trophy className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Leaderboard</h2>
                <p className="text-gray-500 text-xs mt-0.5">10 member teratas</p>
              </div>
            </div>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['leaderboard', guildId] })}
              className="flex items-center gap-2 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 text-gray-300 px-4 py-2 rounded-xl text-sm transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {lbLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-3">
              {(leaderboard || []).map((entry: LeaderboardEntry, i: number) => {
                const rank = i + 1 + (page - 1) * 10;
                const isMe = entry.userId === user?.userId;
                return (
                  <div
                    key={entry.userId}
                    className={`flex items-center justify-between rounded-xl px-5 py-4 transition-all border ${
                      isMe
                        ? 'bg-indigo-500/10 border-indigo-500/30'
                        : 'bg-gray-900/30 border-gray-700/30 hover:border-gray-600/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 text-center font-bold text-lg ${rank <= 3 ? '' : 'text-gray-500'}`}>
                        {getRankIcon(rank)}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm text-white font-bold ${
                          isMe
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 ring-2 ring-indigo-400/50'
                            : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                        }`}>
                          {entry.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`font-medium text-sm ${isMe ? 'text-indigo-300' : 'text-white'}`}>
                              {entry.username}
                            </span>
                            {isMe && (
                              <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full font-medium">kamu</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs flex items-center gap-0.5">
                              <Star className="w-3 h-3 text-yellow-500" />
                              <span className="text-yellow-400 font-medium">Lv.{entry.level}</span>
                            </span>
                            <span className="text-gray-600">·</span>
                            <span className="text-gray-500 text-xs">{entry.xp.toLocaleString()} XP</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-400 text-sm font-medium">{entry.totalMessages.toLocaleString()}</div>
                      <div className="text-gray-600 text-xs">pesan</div>
                    </div>
                  </div>
                );
              })}
              {(leaderboard || []).length === 0 && (
                <div className="text-center py-12">
                  <Trophy className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500">Belum ada data leaderboard</p>
                  <p className="text-gray-600 text-sm mt-1">Data akan muncul setelah member aktif mengirim pesan</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-sm text-gray-300 hover:text-white hover:border-gray-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              ← Prev
            </button>
            <span className="text-gray-400 text-sm">Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={(leaderboard || []).length < 10}
              className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-sm text-gray-300 hover:text-white hover:border-gray-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Level Role Reward"
        message={`Apakah kamu yakin ingin menghapus reward Level ${deleteTarget?.level} (${deleteTarget ? getRoleName(deleteTarget.roleId) : ''})?`}
        confirmLabel="Hapus"
        destructive
        onConfirm={() => deleteTarget && deleteLevelRoleMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
