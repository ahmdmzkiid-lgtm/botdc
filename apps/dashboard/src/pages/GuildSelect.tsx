import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Search, LogOut, Server, Shield } from 'lucide-react';

export function GuildSelect() {
  const navigate = useNavigate();
  const { user, setSelectedGuild, logout } = useAuthStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const filtered = user.guilds.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
              <Server className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Pilih Server</h1>
              <p className="text-gray-400 text-sm">Pilih server Discord yang ingin kamu kelola</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 rounded-xl px-3 py-2">
              <img
                src={`https://cdn.discordapp.com/avatars/${user.userId}/${user.avatar}.png`}
                alt={user.username}
                className="w-7 h-7 rounded-full"
              />
              <span className="text-gray-300 text-sm">{user.username}</span>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="p-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-400 hover:text-red-400 hover:border-red-500/50 transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari server..."
            className="w-full bg-gray-800/60 border border-gray-700/50 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Shield className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Tidak ada server ditemukan</p>
            <p className="text-gray-600 text-sm mt-1">
              Pastikan kamu memiliki izin Administrator di server tersebut
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((guild) => (
              <button
                key={guild.id}
                onClick={() => {
                  setSelectedGuild(guild);
                  navigate(`/guild/${guild.id}`);
                }}
                className="group bg-gray-800/40 hover:bg-gray-800/80 border border-gray-700/50 hover:border-indigo-500/50 rounded-xl p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5 text-left"
              >
                {guild.icon ? (
                  <img
                    src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`}
                    alt={guild.name}
                    className="w-14 h-14 rounded-2xl flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {guild.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-white font-semibold block truncate group-hover:text-indigo-300 transition-colors">
                    {guild.name}
                  </span>
                  <span className="text-gray-500 text-xs">Kelola Server</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
