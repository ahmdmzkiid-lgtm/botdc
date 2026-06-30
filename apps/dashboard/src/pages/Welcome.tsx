import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Switch } from '../components/ui/Switch';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { toast } from '../components/ui/Toast';
import { DiscordEmbed, EmbedBuilder } from '../components/ui/DiscordEmbed';
import { useAuthStore } from '../stores/authStore';
import { welcomeTemplates, goodbyeTemplates } from '../lib/templates';
import { MessageCircle, LogOut, UserPlus, Save, Eye, Settings2, Sparkles } from 'lucide-react';

interface Channel { id: string; name: string }
interface Role { id: string; name: string; color: number }

function replaceVars(text: string, username: string, memberCount: number) {
  return text
    .replace(/\{user\}/g, `@${username}`)
    .replace(/\{memberCount\}/g, String(memberCount))
    .replace(/\{server\}/g, 'Server Name');
}

function TemplateCard({ template, active, onSelect }: {
  template: typeof welcomeTemplates[0];
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`text-left bg-[#2b2d31] rounded-xl overflow-hidden border transition-all hover:scale-[1.02] ${
        active ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-[#1e1f22] hover:border-gray-600'
      }`}
    >
      <div className="flex">
        <div className="w-1 flex-shrink-0" style={{
          backgroundColor: template.embedColor || '#6366f1'
        }} />
        <div className="flex-1 px-3 py-2.5 min-w-0">
          {template.embedTitle && (
            <div className="text-white font-semibold text-xs truncate">{template.embedTitle}</div>
          )}
          <div className="text-white/60 text-xs mt-0.5 line-clamp-2">
            {template.welcomeMessage.replace(/\{user\}/g, '@member').replace(/\{memberCount\}/g, '42').replace(/\{server\}/g, 'Server')}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            {template.embedMode ? (
              <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] rounded font-medium">EMBED</span>
            ) : (
              <span className="px-1.5 py-0.5 bg-gray-500/20 text-gray-400 text-[10px] rounded font-medium">TEKS</span>
            )}
            <span className="text-white/30 text-[10px] truncate">{template.name}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function GoodbyeTemplateCard({ template, active, onSelect }: {
  template: typeof goodbyeTemplates[0];
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`text-left bg-[#2b2d31] rounded-xl overflow-hidden border transition-all hover:scale-[1.02] ${
        active ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-[#1e1f22] hover:border-gray-600'
      }`}
    >
      <div className="flex">
        <div className="w-1 flex-shrink-0 bg-red-500" />
        <div className="flex-1 px-3 py-2.5 min-w-0">
          <div className="text-white/60 text-xs line-clamp-2">
            {template.goodbyeMessage.replace(/\{user\}/g, '@member').replace(/\{memberCount\}/g, '41').replace(/\{server\}/g, 'Server')}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-white/30 text-[10px] truncate">{template.name}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

export function WelcomePage() {
  const { guildId } = useParams();
  const queryClient = useQueryClient();
  const { selectedGuild } = useAuthStore();

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

  const [welcomeEnabled, setWelcomeEnabled] = useState(false);
  const [welcomeChannelId, setWelcomeChannelId] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [goodbyeEnabled, setGoodbyeEnabled] = useState(false);
  const [goodbyeChannelId, setGoodbyeChannelId] = useState('');
  const [goodbyeMessage, setGoodbyeMessage] = useState('');
  const [autoRoleId, setAutoRoleId] = useState('');

  const [embedMode, setEmbedMode] = useState(false);
  const [embedTitle, setEmbedTitle] = useState('');
  const [embedColor, setEmbedColor] = useState('indigo');
  const [authorName, setAuthorName] = useState('');
  const [footerText, setFooterText] = useState('');
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [embedContent, setEmbedContent] = useState('');

  const [welcomeTemplateId, setWelcomeTemplateId] = useState('');
  const [goodbyeTemplateId, setGoodbyeTemplateId] = useState('');
  const [showWelcomeTemplates, setShowWelcomeTemplates] = useState(false);
  const [showGoodbyeTemplates, setShowGoodbyeTemplates] = useState(false);
  const [editorTab, setEditorTab] = useState<'welcome' | 'goodbye'>('welcome');

  const applyWelcomeTemplate = (t: typeof welcomeTemplates[0]) => {
    setEmbedMode(t.embedMode);
    setWelcomeMessage(t.welcomeMessage);
    setEmbedTitle(t.embedTitle || '');
    setEmbedColor(t.embedColor || 'indigo');
    setAuthorName(t.authorName || '');
    setFooterText(t.footerText || '');
    setShowThumbnail(t.showThumbnail ?? true);
    setEmbedContent(t.embedContent || '');
    setWelcomeTemplateId(t.id);
    setShowWelcomeTemplates(false);
  };

  const applyGoodbyeTemplate = (t: typeof goodbyeTemplates[0]) => {
    setGoodbyeMessage(t.goodbyeMessage);
    setGoodbyeTemplateId(t.id);
    setShowGoodbyeTemplates(false);
  };

  useEffect(() => {
    if (config) {
      setWelcomeEnabled(config.welcomeEnabled);
      setWelcomeChannelId(config.welcomeChannelId || '');
      setWelcomeMessage(config.welcomeMessage || 'Selamat datang {user}!');
      setGoodbyeEnabled(config.goodbyeEnabled);
      setGoodbyeChannelId(config.goodbyeChannelId || '');
      setGoodbyeMessage(config.goodbyeMessage || '{user} telah meninggalkan server.');
      setAutoRoleId(config.autoRoleId || '');
      if (config.embedMode !== undefined) setEmbedMode(config.embedMode);
      if (config.embedTitle !== undefined) setEmbedTitle(config.embedTitle || '');
      if (config.embedColor !== undefined) setEmbedColor(config.embedColor || 'indigo');
      if (config.authorName !== undefined) setAuthorName(config.authorName || '');
      if (config.footerText !== undefined) setFooterText(config.footerText || '');
      if (config.showThumbnail !== undefined) setShowThumbnail(config.showThumbnail !== false);
      if (config.embedContent !== undefined) setEmbedContent(config.embedContent || '');
    }
  }, [config]);

  const welcomeMutation = useMutation({
    mutationFn: (data: any) => api.patch(`/api/guilds/${guildId}/welcome`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild-config', guildId] });
      toast('success', 'Konfigurasi welcome/goodbye berhasil disimpan');
    },
    onError: () => toast('error', 'Gagal menyimpan konfigurasi'),
  });

  const configMutation = useMutation({
    mutationFn: (data: any) => api.patch(`/api/guilds/${guildId}/config`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild-config', guildId] });
      toast('success', 'Auto-role berhasil disimpan');
    },
    onError: () => toast('error', 'Gagal menyimpan auto-role'),
  });

  const serverIcon = selectedGuild?.icon
    ? `https://cdn.discordapp.com/icons/${selectedGuild.id}/${selectedGuild.icon}.png?size=64`
    : undefined;

  const isWelcomeTab = editorTab === 'welcome';

  const previewDesc = replaceVars(isWelcomeTab ? welcomeMessage : goodbyeMessage, 'PenggunaBaru', 42);
  const previewTitle = replaceVars(isWelcomeTab ? embedTitle : '', 'PenggunaBaru', 42);
  const previewAuthor = isWelcomeTab && authorName ? replaceVars(authorName, 'PenggunaBaru', 42) : undefined;
  const previewFooter = isWelcomeTab && footerText ? replaceVars(footerText, 'PenggunaBaru', 42) : undefined;
  const previewContent = isWelcomeTab && embedContent ? replaceVars(embedContent, 'PenggunaBaru', 42) : undefined;
  const previewEmbedMode = isWelcomeTab && embedMode;

  const mutedWelcomeTemplate = welcomeTemplates.find((t) => t.id === welcomeTemplateId);

  if (configLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-white">Welcome & Goodbye</h1>
        <p className="text-gray-400 text-sm mt-1">Atur pesan sambutan dan perpisahan untuk member</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <UserPlus className="w-5 h-5 text-green-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Pesan Sambutan</h2>
            </div>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-300 font-medium">Aktifkan welcome message</span>
                  <p className="text-gray-500 text-xs mt-0.5">Kirim pesan saat member baru bergabung</p>
                </div>
                <Switch checked={welcomeEnabled} onChange={setWelcomeEnabled} />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-900/40 rounded-xl border border-gray-700/30">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <span className="text-gray-300 text-sm font-medium">Mode Embed</span>
                </div>
                <Switch checked={embedMode} onChange={setEmbedMode} />
              </div>

              <div>
                <label className="text-gray-400 text-sm font-medium">Channel</label>
                <select
                  value={welcomeChannelId}
                  onChange={(e) => setWelcomeChannelId(e.target.value)}
                  className="w-full mt-1.5 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500/50 transition-colors"
                >
                  <option value="">Pilih channel</option>
                  {(channels || []).map((ch: Channel) => (
                    <option key={ch.id} value={ch.id}>#{ch.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  onClick={() => setShowWelcomeTemplates(!showWelcomeTemplates)}
                  className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  {mutedWelcomeTemplate ? `Template: ${mutedWelcomeTemplate.name}` : 'Pilih Template'}
                </button>

                {showWelcomeTemplates && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                    {welcomeTemplates.map((t) => (
                      <TemplateCard
                        key={t.id}
                        template={t}
                        active={t.id === welcomeTemplateId}
                        onSelect={() => applyWelcomeTemplate(t)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {embedMode && (
                <div className="space-y-4 border-t border-gray-700/30 pt-4">
                  <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium">
                    <Settings2 className="w-4 h-4" />
                    <span>Embed Configuration</span>
                  </div>
                  <EmbedBuilder
                    title={embedTitle}
                    setTitle={setEmbedTitle}
                    description={welcomeMessage}
                    setDescription={setWelcomeMessage}
                    color={embedColor}
                    setColor={setEmbedColor}
                    authorName={authorName}
                    setAuthorName={setAuthorName}
                    footerText={footerText}
                    setFooterText={setFooterText}
                    showThumbnail={showThumbnail}
                    setShowThumbnail={setShowThumbnail}
                    content={embedContent}
                    setContent={setEmbedContent}
                    hideDescription
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <LogOut className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Pesan Perpisahan</h2>
            </div>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-300 font-medium">Aktifkan goodbye message</span>
                  <p className="text-gray-500 text-xs mt-0.5">Kirim pesan saat member meninggalkan server</p>
                </div>
                <Switch checked={goodbyeEnabled} onChange={setGoodbyeEnabled} />
              </div>
              <div>
                <label className="text-gray-400 text-sm font-medium">Channel</label>
                <select
                  value={goodbyeChannelId}
                  onChange={(e) => setGoodbyeChannelId(e.target.value)}
                  className="w-full mt-1.5 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500/50 transition-colors"
                >
                  <option value="">Pilih channel</option>
                  {(channels || []).map((ch: Channel) => (
                    <option key={ch.id} value={ch.id}>#{ch.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  onClick={() => setShowGoodbyeTemplates(!showGoodbyeTemplates)}
                  className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  {goodbyeTemplateId ? `Template: ${goodbyeTemplates.find((t) => t.id === goodbyeTemplateId)?.name}` : 'Pilih Template'}
                </button>

                {showGoodbyeTemplates && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {goodbyeTemplates.map((t) => (
                      <GoodbyeTemplateCard
                        key={t.id}
                        template={t}
                        active={t.id === goodbyeTemplateId}
                        onSelect={() => applyGoodbyeTemplate(t)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-blue-900/20 border border-blue-800/40 rounded-xl p-3">
                <p className="text-blue-300 text-xs">
                  Edit pesan perpisahan di panel sebelah kanan pada tab <strong>Goodbye</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <UserPlus className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Auto-Role</h2>
            </div>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-300 font-medium">Role otomatis untuk member baru</span>
                  <p className="text-gray-500 text-xs mt-0.5">Memberikan role secara otomatis saat bergabung</p>
                </div>
                <Switch checked={!!autoRoleId} onChange={(v) => setAutoRoleId(v ? (roles?.[0]?.id || '') : '')} />
              </div>
              {autoRoleId && (
                <div>
                  <label className="text-gray-400 text-sm font-medium">Pilih Role</label>
                  <select
                    value={autoRoleId}
                    onChange={(e) => setAutoRoleId(e.target.value)}
                    className="w-full mt-1.5 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  >
                    <option value="">Pilih role</option>
                    {(roles || []).map((r: Role) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <button
                onClick={() => configMutation.mutate({ autoRoleId: autoRoleId || null })}
                disabled={configMutation.isPending}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {configMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>

        <div className="xl:sticky xl:top-8 self-start space-y-6">
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <MessageCircle className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Edit Pesan</h2>
                <p className="text-gray-400 text-xs mt-0.5">Tulis atau edit pesan</p>
              </div>
            </div>

            <div className="flex bg-gray-900/40 rounded-xl p-1 mb-4 border border-gray-700/30">
              <button
                onClick={() => setEditorTab('welcome')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  editorTab === 'welcome'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 inline mr-1.5" />
                Welcome
              </button>
              <button
                onClick={() => setEditorTab('goodbye')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  editorTab === 'goodbye'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <LogOut className="w-3.5 h-3.5 inline mr-1.5" />
                Goodbye
              </button>
            </div>

            <div className="space-y-3">
              <textarea
                key={editorTab}
                value={isWelcomeTab ? welcomeMessage : goodbyeMessage}
                onChange={(e) => {
                  if (isWelcomeTab) setWelcomeMessage(e.target.value);
                  else setGoodbyeMessage(e.target.value);
                }}
                placeholder={isWelcomeTab ? 'Tulis pesan sambutan...' : 'Tulis pesan perpisahan...'}
                rows={5}
                className="w-full bg-gray-700/50 border border-gray-600/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
              />
              <div className="flex flex-wrap gap-1.5">
                {['{user}', '{memberCount}', '{server}'].map((v) => (
                  <button
                    key={v}
                    onClick={() => {
                      if (isWelcomeTab) setWelcomeMessage((prev) => prev + v);
                      else setGoodbyeMessage((prev) => prev + v);
                    }}
                    className="px-2 py-1 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-xs text-indigo-300 font-mono transition-colors"
                  >
                    {v}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  if (isWelcomeTab) {
                    welcomeMutation.mutate({
                      welcomeEnabled, welcomeChannelId, welcomeMessage,
                      embedMode, embedTitle, embedColor, authorName, footerText,
                      showThumbnail, embedContent,
                    });
                  } else {
                    welcomeMutation.mutate({ goodbyeEnabled, goodbyeChannelId, goodbyeMessage });
                  }
                }}
                disabled={welcomeMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {welcomeMutation.isPending ? 'Menyimpan...' : `Simpan ${isWelcomeTab ? 'Welcome' : 'Goodbye'}`}
              </button>
            </div>
          </div>

          <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Eye className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Live Preview</h2>
            </div>

            <div className="bg-[#313338] rounded-lg p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium text-sm">Bot</span>
                  <span className="text-white/40 text-xs">Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {previewEmbedMode ? (
                  <DiscordEmbed
                    title={previewTitle}
                    description={previewDesc}
                    color={embedColor}
                    author={previewAuthor ? { name: previewAuthor } : undefined}
                    footer={previewFooter ? { text: previewFooter } : undefined}
                    thumbnail={showThumbnail ? serverIcon : undefined}
                    content={previewContent}
                    timestamp
                  />
                ) : (
                  <div className="text-white/80 text-sm whitespace-pre-wrap">
                    {previewDesc || '(pesan kosong)'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
