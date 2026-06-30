import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Activity, MessageSquare, Star, Users, Zap, Shield } from 'lucide-react';

export function Dashboard() {
  const { guildId } = useParams();

  const { data: config, isLoading } = useQuery({
    queryKey: ['guild-config', guildId],
    queryFn: () => api.get(`/api/guilds/${guildId}/config`).then((r) => r.data),
  });

  if (isLoading) return <LoadingSpinner />;

  const stats = [
    {
      label: 'XP per Message',
      value: config?.xpPerMessage || 10,
      icon: Zap,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
    {
      label: 'XP Cooldown',
      value: `${config?.xpCooldownSec || 60}s`,
      icon: Activity,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Welcome',
      value: config?.welcomeEnabled ? 'Aktif' : 'Nonaktif',
      icon: Users,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Goodbye',
      value: config?.goodbyeEnabled ? 'Aktif' : 'Nonaktif',
      icon: MessageSquare,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'Anti-Invite',
      value: config?.antiInvite ? 'Aktif' : 'Nonaktif',
      icon: Shield,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    {
      label: 'Anti-Spam',
      value: config?.antiSpam ? 'Aktif' : 'Nonaktif',
      icon: Star,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Ringkasan konfigurasi server</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="group bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 hover:border-gray-600/50 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-lg ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.value === 'Aktif' ? 'text-green-400' : s.value === 'Nonaktif' ? 'text-gray-300' : 'text-white'}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
