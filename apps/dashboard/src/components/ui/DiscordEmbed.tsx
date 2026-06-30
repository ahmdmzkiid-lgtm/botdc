interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

interface DiscordEmbedProps {
  title?: string;
  description?: string;
  color?: string;
  author?: { name: string; icon?: string };
  footer?: { text: string; icon?: string };
  thumbnail?: string;
  fields?: EmbedField[];
  timestamp?: boolean;
  content?: string;
}

const EMBED_COLORS: Record<string, string> = {
  indigo: '#6366f1',
  green: '#22c55e',
  red: '#ef4444',
  blue: '#3b82f6',
  yellow: '#eab308',
  purple: '#a855f7',
  orange: '#f97316',
  pink: '#ec4899',
  gray: '#6b7280',
};

export function DiscordEmbed({
  title,
  description,
  color = '#6366f1',
  author,
  footer,
  thumbnail,
  fields,
  timestamp,
  content,
}: DiscordEmbedProps) {
  const hexColor = EMBED_COLORS[color] || color;

  return (
    <div className="bg-[#2b2d31] rounded-lg overflow-hidden max-w-lg w-full border border-[#1e1f22]">
      {content && (
        <div className="px-4 pt-3 pb-1 text-white/80 text-sm whitespace-pre-wrap">
          {content}
        </div>
      )}
      <div className="flex">
        <div className="w-1 flex-shrink-0" style={{ backgroundColor: hexColor }} />
        <div className="flex-1 px-4 py-3 space-y-2 min-w-0">
          {author && (
            <div className="flex items-center gap-2 text-xs">
              {author.icon && (
                <img src={author.icon} alt="" className="w-5 h-5 rounded-full" />
              )}
              <span className="font-medium text-white/80">{author.name}</span>
            </div>
          )}

          {title && (
            <div className="text-white font-semibold text-base leading-snug">{title}</div>
          )}

          {description && (
            <div className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
              {description}
            </div>
          )}

          {fields && fields.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {fields.map((f, i) => (
                <div
                  key={i}
                  className={f.inline ? 'flex-1 min-w-[120px]' : 'w-full'}
                >
                  <div className="text-white/60 text-xs font-medium mb-0.5">{f.name}</div>
                  <div className="text-white/80 text-sm whitespace-pre-wrap">{f.value}</div>
                </div>
              ))}
            </div>
          )}

          {(footer || timestamp) && (
            <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
              {footer?.icon && (
                <img src={footer.icon} alt="" className="w-4 h-4 rounded-full" />
              )}
              {footer?.text && <span>{footer.text}</span>}
              {footer?.text && timestamp && <span>·</span>}
              {timestamp && <span>Now</span>}
            </div>
          )}
        </div>
        {thumbnail && (
          <div className="pr-4 pt-3 flex-shrink-0">
            <img src={thumbnail} alt="" className="w-16 h-16 rounded-lg" />
          </div>
        )}
      </div>
    </div>
  );
}

const presetColors = [
  { name: 'Indigo', value: 'indigo' },
  { name: 'Green', value: 'green' },
  { name: 'Red', value: 'red' },
  { name: 'Blue', value: 'blue' },
  { name: 'Yellow', value: 'yellow' },
  { name: 'Purple', value: 'purple' },
  { name: 'Orange', value: 'orange' },
  { name: 'Pink', value: 'pink' },
  { name: 'Gray', value: 'gray' },
];

interface EmbedBuilderProps {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  color: string;
  setColor: (v: string) => void;
  authorName: string;
  setAuthorName: (v: string) => void;
  footerText: string;
  setFooterText: (v: string) => void;
  showThumbnail: boolean;
  setShowThumbnail: (v: boolean) => void;
  content: string;
  setContent: (v: string) => void;
  hideDescription?: boolean;
}

export function EmbedBuilder({
  title, setTitle,
  description, setDescription,
  color, setColor,
  authorName, setAuthorName,
  footerText, setFooterText,
  showThumbnail, setShowThumbnail,
  content, setContent,
  hideDescription,
}: EmbedBuilderProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-gray-400 text-sm font-medium">Content (plain text di atas embed)</label>
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Teks biasa sebelum embed..."
          className="w-full mt-1.5 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500/50 transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-gray-400 text-sm font-medium">Embed Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Welcome to the server!"
            className="w-full mt-1.5 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
        {!hideDescription && (
          <div>
            <label className="text-gray-400 text-sm font-medium">Embed Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Selamat datang {user}!"
              rows={2}
              className="w-full mt-1.5 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
        )}
      </div>

      <div>
        <label className="text-gray-400 text-sm font-medium">Embed Color</label>
        <div className="flex gap-2 mt-1.5 flex-wrap">
          {presetColors.map((c) => (
            <button
              key={c.value}
              onClick={() => setColor(c.value)}
              className={`w-8 h-8 rounded-lg border-2 transition-all ${
                color === c.value ? 'border-white scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: EMBED_COLORS[c.value] }}
              title={c.name}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-gray-400 text-sm font-medium">Author Name</label>
          <input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Server Name"
            className="w-full mt-1.5 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
        <div>
          <label className="text-gray-400 text-sm font-medium">Footer Text</label>
          <input
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            placeholder="Member since..."
            className="w-full mt-1.5 bg-gray-700/50 border border-gray-600/50 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-gray-300 font-medium text-sm">Tampilkan Server Icon</span>
          <p className="text-gray-500 text-xs mt-0.5">Sebagai thumbnail di embed</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={showThumbnail}
          onClick={() => setShowThumbnail(!showThumbnail)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
            showThumbnail ? 'bg-indigo-600' : 'bg-gray-700'
          } cursor-pointer hover:opacity-80`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
            showThumbnail ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>
    </div>
  );
}
