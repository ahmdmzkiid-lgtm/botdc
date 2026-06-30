import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Music, MessageCircle, Trophy, Users } from 'lucide-react';

const features = [
  { icon: Shield, title: 'Auto Moderation', desc: 'Smart anti-spam, anti-invite, and word filtering to keep your server safe.' },
  { icon: Zap, title: 'Leveling System', desc: 'Engage members with XP, levels, and role rewards.' },
  { icon: Music, title: 'Music Player', desc: 'High-quality music playback from YouTube and Spotify.' },
  { icon: MessageCircle, title: 'Custom Commands', desc: 'Create your own slash commands with custom responses.' },
  { icon: Trophy, title: 'Reaction Roles', desc: 'Let members self-assign roles with simple reactions.' },
  { icon: Users, title: 'Welcome System', desc: 'Beautiful welcome messages and auto-role for new members.' },
];

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl">Bot Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Masuk
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-semibold transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/40 via-transparent to-gray-950" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
              Kelola Server Discord-mu
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400"> dengan Mudah</span>
          </h1>
            <p className="text-lg sm:text-xl text-gray-400 mb-10 leading-relaxed">
              Bot serbaguna dengan fitur moderasi, leveling, musik, dan masih banyak lagi.
              Dashboard intuitif untuk mengatur semuanya dalam satu tempat.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-lg font-semibold transition-all hover:scale-105"
              >
                Mulai Sekarang
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-lg font-semibold transition-colors"
              >
                Login dengan Discord
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Fitur Lengkap</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Semua yang kamu butuhkan untuk mengelola server Discord secara profesional.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="group bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-indigo-500/50 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-indigo-600/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-600/20 transition-colors">
                <f.icon className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-900/50 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Siap untuk Memulai?</h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Tambahkan bot ke server Discord-mu dan nikmati kemudahan mengelola semuanya.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-lg font-semibold transition-all hover:scale-105"
          >
            Dashboard
          </button>
        </div>
      </section>

      <footer className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-center">
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Bot Dashboard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
