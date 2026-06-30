import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  LayoutDashboard,
  MessageCircle,
  Trophy,
  Smile,
  Shield,
  Terminal,
  LogOut,
  Server,
} from 'lucide-react';

const menuItems = [
  { path: '', label: 'Dashboard', icon: LayoutDashboard },
  { path: 'welcome', label: 'Welcome', icon: MessageCircle },
  { path: 'leveling', label: 'Leveling', icon: Trophy },
  { path: 'reaction-roles', label: 'Reaction Roles', icon: Smile },
  { path: 'automod', label: 'Auto-Mod', icon: Shield },
  { path: 'commands', label: 'Commands', icon: Terminal },
];

export function Sidebar() {
  const { selectedGuild, setSelectedGuild } = useAuthStore();
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-gray-900/60 border-r border-gray-800/50 h-screen flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-gray-800/50">
        {selectedGuild && (
          <div className="flex items-center gap-3">
            {selectedGuild.icon ? (
              <img
                src={`https://cdn.discordapp.com/icons/${selectedGuild.id}/${selectedGuild.icon}.png`}
                alt={selectedGuild.name}
                className="w-10 h-10 rounded-xl flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {selectedGuild.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <div className="text-white font-semibold text-sm truncate">{selectedGuild.name}</div>
              <div className="text-gray-500 text-xs">Server</div>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === ''}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/40 border border-transparent'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-800/50 space-y-1">
        <button
          onClick={() => { setSelectedGuild({ id: '', name: '', icon: null }); navigate('/select-guild'); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800/40 transition-all border border-transparent"
        >
          <Server size={18} />
          Ganti Server
        </button>
        <button
          onClick={() => { setSelectedGuild({ id: '', name: '', icon: null }); navigate('/login'); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
