import { useAuthStore } from '../../stores/authStore';

export function Topbar() {
  const { user } = useAuthStore();

  return (
    <header className="h-16 bg-gray-900/40 border-b border-gray-800/50 backdrop-blur-xl flex items-center justify-between px-6 lg:px-8 flex-shrink-0">
      <div />
      {user && (
        <div className="flex items-center gap-3 bg-gray-800/40 border border-gray-700/30 rounded-xl px-3 py-1.5">
          <span className="text-gray-300 text-sm font-medium">{user.username}</span>
          {user.avatar ? (
            <img
              src={`https://cdn.discordapp.com/avatars/${user.userId}/${user.avatar}.png`}
              alt={user.username}
              className="w-7 h-7 rounded-full"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {user.username.charAt(0)}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
