import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Archive,
  Award,
  Bookmark,
  Bot,
  Clock,
  Download,
  Eye,
  Flag,
  Flame,
  MapPin,
  MessageSquare,
  RefreshCw,
  Save,
  Search,
  ShieldAlert,
  Sparkles,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react';
import { apiJson } from '../../config/api';
import { localizedPreview } from '../../components/admin/TrilingualField';
import { ALL_STORIES } from '../../data/stories';

export const AdminI18nContext = React.createContext((text) => text);
export const useAdminText = () => React.useContext(AdminI18nContext);

export const formatNumber = (value) => new Intl.NumberFormat('en').format(Number(value || 0));
const text = (value) => localizedPreview(value) || (typeof value === 'string' ? value : '') || '';

export function timeAgo(value) {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  if (Number.isNaN(diff)) return '';
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(value).toLocaleDateString();
}

const formatDuration = (ms) => {
  const value = Number(ms || 0);
  if (!value) return '-';
  return value < 1000 ? `${value} ms` : `${(value / 1000).toFixed(1)} s`;
};

const shortDay = (iso) => {
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('en', { day: 'numeric', month: 'short' });
};

// ── Building blocks ──────────────────────────────────────────────────────────

export function StatTile({ icon: Icon, label, value, note, tone = '' }) {
  const ta = useAdminText();
  return (
    <div className={`adm-tile ${tone ? `adm-tile--${tone}` : ''}`}>
      <div className="adm-tile-top">
        <span>{ta(label)}</span>
        {Icon && <i><Icon size={15} /></i>}
      </div>
      <strong>{value}</strong>
      {note && <small>{note}</small>}
    </div>
  );
}

export function Card({ title, aside, children, className = '' }) {
  const ta = useAdminText();
  return (
    <section className={`adm-card ${className}`}>
      {(title || aside) && (
        <header className="adm-card-head">
          <h3>{ta(title)}</h3>
          {aside && <span>{typeof aside === 'string' ? ta(aside) : aside}</span>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Empty({ title, body }) {
  const ta = useAdminText();
  return (
    <div className="adm-empty">
      <strong>{ta(title)}</strong>
      {body && <span>{ta(body)}</span>}
    </div>
  );
}

export function BarList({ rows = [], format = formatNumber, emptyTitle = 'No data yet', emptyBody }) {
  const max = Math.max(1, ...rows.map((row) => Number(row.value || 0)));
  if (!rows.length || rows.every((row) => !Number(row.value))) return <Empty title={emptyTitle} body={emptyBody} />;
  return (
    <div className="adm-barlist">
      {rows.map((row, index) => (
        <div className="adm-barlist-row" key={`${row.label}-${index}`}>
          <div><span>{row.label}</span><strong>{format(row.value)}</strong></div>
          <p><i style={{ width: `${Math.max(3, (Number(row.value || 0) / max) * 100)}%` }} /></p>
        </div>
      ))}
    </div>
  );
}

export function DailyBars({ rows = [], valueKey = 'value', secondaryKey, labelKey = 'label', emptyTitle = 'No activity yet', emptyBody }) {
  const max = Math.max(1, ...rows.map((row) => Number(row[valueKey] || 0)));
  if (!rows.length || rows.every((row) => !Number(row[valueKey]))) return <Empty title={emptyTitle} body={emptyBody} />;
  const step = Math.ceil(rows.length / 7);
  return (
    <div className={`adm-bars ${secondaryKey ? '' : 'adm-bars--single'}`} role="img" aria-label="Daily activity chart">
      {rows.map((row, index) => {
        const total = Number(row[valueKey] || 0);
        const secondary = secondaryKey ? Number(row[secondaryKey] || 0) : 0;
        const label = /^\d{4}-\d{2}-\d{2}$/.test(row[labelKey]) ? shortDay(row[labelKey]) : row[labelKey];
        return (
          <div className="adm-bars-col" key={`${row[labelKey]}-${index}`} title={`${label}: ${total}${secondaryKey ? ` (${secondary} answered)` : ''}`}>
            <div className="adm-bars-track">
              <span style={{ height: `${total ? Math.max(4, (total / max) * 100) : 0}%` }}>
                {secondaryKey && total > 0 && <em style={{ height: `${(secondary / total) * 100}%` }} />}
              </span>
            </div>
            <small>{index % step === 0 || index === rows.length - 1 ? label : ''}</small>
          </div>
        );
      })}
    </div>
  );
}

export function LiveTable({ title, aside, columns, rows = [], searchKeys = [], searchPlaceholder = 'Search...', empty, pageSize = 25 }) {
  const ta = useAdminText();
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(pageSize);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => searchKeys.some((key) => text(typeof key === 'function' ? key(row) : row[key]).toLowerCase().includes(q)));
  }, [query, rows, searchKeys]);
  useEffect(() => { setLimit(pageSize); }, [query, pageSize]);

  return (
    <section className="adm-card adm-table-card">
      <header className="adm-card-head">
        <h3>{ta(title)}</h3>
        <div className="adm-table-tools">
          {aside && <span>{aside}</span>}
          {searchKeys.length > 0 && (
            <label className="adm-search">
              <Search size={13} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={ta(searchPlaceholder)} aria-label={ta(searchPlaceholder)} />
            </label>
          )}
        </div>
      </header>
      {filtered.length === 0 ? (
        query ? <Empty title="No matches" body={`Nothing matches "${query}".`} /> : (empty || <Empty title="No records yet" />)
      ) : (
        <>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr>{columns.map((col) => <th key={col.label}>{ta(col.label)}</th>)}</tr></thead>
              <tbody>
                {filtered.slice(0, limit).map((row, index) => (
                  <tr key={row.id ?? `${index}-${row.title || row.name || ''}`}>
                    {columns.map((col) => <td key={col.label}>{col.render ? col.render(row) : text(row[col.key]) || '-'}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <footer className="adm-table-foot">
            <span>{ta('Showing')} {Math.min(limit, filtered.length)} / {formatNumber(filtered.length)}</span>
            {filtered.length > limit && <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setLimit((n) => n + pageSize)}>{ta('Show more')}</button>}
          </footer>
        </>
      )}
    </section>
  );
}

const ACTIVITY_ICONS = { user: UserPlus, contribution: Archive, report: Flag, news: MessageSquare, ai: Bot };

export function RecentActivity({ items = [] }) {
  return (
    <Card title="Recent Activity" aside="Live from the database">
      {items.length ? (
        <ul className="adm-activity">
          {items.map((item, index) => {
            const Icon = ACTIVITY_ICONS[item.kind] || Activity;
            return (
              <li key={`${item.kind}-${item.at}-${index}`}>
                <i className={`adm-activity-icon adm-activity-icon--${item.kind}`}><Icon size={14} /></i>
                <div><strong>{item.title}</strong><span>{item.detail}</span></div>
                <time dateTime={item.at}>{timeAgo(item.at)}</time>
              </li>
            );
          })}
        </ul>
      ) : <Empty title="No activity yet" body="Sign-ups, contributions, reports and AI alerts will appear here as they happen." />}
    </Card>
  );
}

export function TopLearners({ rows = [] }) {
  return (
    <Card title="Top Learners" aside="By XP">
      {rows.length ? (
        <ol className="adm-leaders">
          {rows.slice(0, 6).map((row, index) => (
            <li key={row.id}>
              <b>{index + 1}</b>
              <div><strong>{row.name || 'Unnamed user'}</strong><span>Level {row.level || 1} · {row.current_streak || 0}-day streak</span></div>
              <em>{formatNumber(row.xp)} XP</em>
            </li>
          ))}
        </ol>
      ) : <Empty title="No learners yet" body="Users appear here once they start earning XP." />}
    </Card>
  );
}

// ── Engagement overview (dashboard tab) ──────────────────────────────────────

export function EngagementStrip({ engagement }) {
  const t = engagement?.totals || {};
  return (
    <section className="adm-tiles adm-tiles--5">
      <StatTile icon={Zap} label="XP earned" value={formatNumber(t.total_xp)} note={`Avg level ${t.avg_level || 0}`} />
      <StatTile icon={Flame} label="On a streak" value={formatNumber(t.on_streak)} note={`Best streak ${t.best_streak || 0} days`} />
      <StatTile icon={Eye} label="Content views" value={formatNumber(t.views)} note={`${formatNumber(t.views7)} this week`} />
      <StatTile icon={Bookmark} label="Saved items" value={formatNumber(t.saves)} note="Bookmarked by users" />
      <StatTile icon={Award} label="Badges earned" value={formatNumber(t.badges)} note="Across all users" />
    </section>
  );
}

// ── AI assistant ─────────────────────────────────────────────────────────────

const STATUS_TONE = { ok: 'green', error: 'red', blocked: 'red', not_configured: 'gold', disabled: 'gold', limited: 'gold' };
const STATUS_LABEL = { ok: 'Answered', error: 'Error', blocked: 'Blocked', not_configured: 'Not configured', disabled: 'Disabled', limited: 'Limit reached' };
const LANG_LABEL = { en: 'English', rw: 'Kinyarwanda', fr: 'Français' };

export function AiSection({ data, error, reload, goTab }) {
  const ta = useAdminText();
  const [onlyFlagged, setOnlyFlagged] = useState(false);
  if (error) {
    return (
      <Card title="AI Assistant">
        <div className="adm-alert adm-alert--red"><AlertTriangle size={15} /> {error}
          <button type="button" className="admin-btn admin-btn-ghost" onClick={reload}><RefreshCw size={13} /> {ta('Retry')}</button>
        </div>
      </Card>
    );
  }
  if (!data) return <Card title="AI Assistant"><Empty title="Loading AI usage" /></Card>;

  const { config = {}, summary = {}, daily = [], byLanguage = [], byStatus = [], topUsers = [], recent = [] } = data;
  const total = Number(summary.total || 0);
  const successRate = total ? Math.round((Number(summary.answered || 0) / total) * 100) : 0;
  const recentRows = onlyFlagged ? recent.filter((row) => row.flagged) : recent;

  return (
    <div className="adm-stack">
      {!config.configured && (
        <div className="adm-alert adm-alert--gold">
          <AlertTriangle size={15} />
          <span><b>{ta('The AI key is missing on the server.')}</b> {ta('Add GEMINI_API_KEY to the backend environment (Render) and redeploy. Until then users see a friendly "not set up yet" message, and their attempts are counted below.')}</span>
        </div>
      )}
      {config.configured && !config.enabled && (
        <div className="adm-alert adm-alert--gold">
          <AlertTriangle size={15} />
          <span>{ta('The assistant is switched off in Settings, so users cannot ask questions right now.')}</span>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={() => goTab('settings')}>{ta('Open Settings')}</button>
        </div>
      )}

      <section className="adm-tiles adm-tiles--5">
        <StatTile icon={Sparkles} label="Questions asked" value={formatNumber(total)} note={`${formatNumber(summary.today)} today · ${formatNumber(summary.last7)} this week`} tone="brand" />
        <StatTile icon={Users} label="People using AI" value={formatNumber(summary.users)} note={`${formatNumber(summary.users7)} in the last 7 days`} />
        <StatTile icon={Activity} label="Answer rate" value={`${successRate}%`} note={`${formatNumber(summary.failed)} not answered`} />
        <StatTile icon={Clock} label="Avg response" value={formatDuration(summary.avg_latency)} note={`${formatNumber(Number(summary.input_tokens || 0) + Number(summary.output_tokens || 0))} tokens used`} />
        <StatTile icon={ShieldAlert} label="Sensitive flags" value={formatNumber(summary.flagged)} note="Questions to review" tone={Number(summary.flagged) ? 'red' : ''} />
      </section>

      <div className="adm-grid adm-grid--2-1">
        <Card title="Questions per day" aside={<span className="adm-legend"><i /> {ta('Asked')} <i className="alt" /> {ta('Answered')}</span>}>
          <DailyBars rows={daily} valueKey="total" secondaryKey="answered" labelKey="day" emptyTitle="No questions yet" emptyBody="Once users chat with Umuco, daily usage appears here." />
        </Card>
        <Card title="Assistant status">
          <dl className="adm-dl">
            <div><dt>{ta('Server key')}</dt><dd className={config.configured ? 'ok' : 'warn'}>{config.configured ? ta('Configured') : ta('Missing')}</dd></div>
            <div><dt>{ta('Assistant')}</dt><dd className={config.enabled ? 'ok' : 'warn'}>{config.enabled ? ta('On') : ta('Off')}</dd></div>
            <div><dt>{ta('Model')}</dt><dd>{config.model || '-'}</dd></div>
            <div><dt>{ta('Daily limit per user')}</dt><dd>{config.dailyLimit}</dd></div>
            <div><dt>{ta('Question logging')}</dt><dd>{config.logPrompts ? ta('On') : ta('Off')}</dd></div>
            <div><dt>{ta('Last question')}</dt><dd>{summary.last_at ? timeAgo(summary.last_at) : '-'}</dd></div>
          </dl>
          <button type="button" className="admin-btn admin-btn-ghost adm-full" onClick={() => goTab('settings')}>{ta('Change AI settings')}</button>
        </Card>
      </div>

      <div className="adm-grid adm-grid--3">
        <Card title="By language"><BarList rows={byLanguage.map((row) => ({ label: LANG_LABEL[row.label] || row.label, value: row.value }))} /></Card>
        <Card title="By outcome"><BarList rows={byStatus.map((row) => ({ label: ta(STATUS_LABEL[row.label] || row.label), value: row.value }))} /></Card>
        <Card title="Most active users">
          {topUsers.length ? (
            <ol className="adm-leaders">
              {topUsers.slice(0, 5).map((row, index) => (
                <li key={row.id}><b>{index + 1}</b><div><strong>{row.name || 'Unnamed user'}</strong><span>{timeAgo(row.last_at)}</span></div><em>{formatNumber(row.queries)}</em></li>
              ))}
            </ol>
          ) : <Empty title="No users yet" />}
        </Card>
      </div>

      <LiveTable
        title="Recent questions"
        aside={(
          <label className="adm-check">
            <input type="checkbox" checked={onlyFlagged} onChange={(e) => setOnlyFlagged(e.target.checked)} /> {ta('Flagged only')}
          </label>
        )}
        rows={recentRows}
        searchKeys={['prompt', 'user_name', 'user_email', 'status']}
        searchPlaceholder="Search questions or users"
        empty={<Empty title="No questions yet" body="Questions people ask the assistant are listed here (the latest 50)." />}
        columns={[
          { label: 'When', render: (row) => <span className="adm-nowrap" title={new Date(row.created_at).toLocaleString()}>{timeAgo(row.created_at)}</span> },
          { label: 'User', render: (row) => <><div className="adm-strong">{row.user_name || 'Deleted user'}</div><div className="adm-sub">{row.user_email || ''}</div></> },
          { label: 'Question', render: (row) => <div className="adm-question">{row.flagged && <span className="admin-badge admin-badge-red">{ta('Flagged')}</span>} {row.prompt || <em className="adm-sub">{ta('Not stored (logging off)')}</em>}</div> },
          { label: 'Language', render: (row) => LANG_LABEL[row.language] || row.language || '-' },
          { label: 'Outcome', render: (row) => <span className={`admin-badge admin-badge-${STATUS_TONE[row.status] || 'muted'}`} title={row.error || ''}>{ta(STATUS_LABEL[row.status] || row.status)}</span> },
          { label: 'Time', render: (row) => formatDuration(row.latency_ms) },
        ]}
      />
    </div>
  );
}

// ── Analytics ────────────────────────────────────────────────────────────────

export function AnalyticsSection({ stats = {}, analytics = {}, engagement, aiUsage }) {
  const t = engagement?.totals || {};
  const monthlyUsers = (analytics.monthlyUsers || []).map((row) => ({ label: row.label, value: row.value }));
  return (
    <div className="adm-stack">
      <section className="adm-tiles">
        <StatTile icon={Users} label="Registered users" value={formatNumber(stats.users)} note={`${formatNumber(t.new7)} joined this week`} tone="brand" />
        <StatTile icon={Activity} label="Active last 7 days" value={formatNumber(t.active7)} note={`${formatNumber(t.active30)} in 30 days`} />
        <StatTile icon={Eye} label="Content views" value={formatNumber(t.views)} note={`${formatNumber(t.views7)} this week`} />
        <StatTile icon={Sparkles} label="AI questions" value={formatNumber(aiUsage?.summary?.total ?? t.aiTotal)} note={`${formatNumber(t.aiToday)} today`} />
      </section>
      <div className="adm-grid adm-grid--2">
        <Card title="Daily logins" aside="Last 14 days">
          <DailyBars rows={engagement?.dailyLogins || []} emptyTitle="No logins recorded yet" emptyBody="Daily logins are recorded when users open their dashboard." />
        </Card>
        <Card title="New sign-ups" aside="Last 6 months">
          <BarList rows={monthlyUsers} emptyTitle="No sign-ups yet" />
        </Card>
        <Card title="Most viewed content">
          <BarList rows={(engagement?.topViewed || []).map((row) => ({ label: `${row.title} (${row.type})`, value: row.views }))} emptyTitle="No views yet" emptyBody="Views are recorded when users open stories, places and audio." />
        </Card>
        <Card title="Views per month" aside="Last 6 months">
          <BarList rows={engagement?.monthlyViews || []} emptyTitle="No views yet" />
        </Card>
        <Card title="Users by level">
          <BarList rows={(engagement?.levels || []).map((row) => ({ label: `${row.level}. ${row.name}`, value: row.users }))} emptyTitle="No levels yet" />
        </Card>
        <Card title="Explorer types">
          <BarList rows={engagement?.explorerTypes || []} emptyTitle="No explorer types yet" />
        </Card>
        <Card title="Content mix">
          <BarList rows={analytics.contentMix || []} emptyTitle="No content yet" />
        </Card>
        <Card title="User roles">
          <BarList rows={analytics.roleBreakdown || []} emptyTitle="No users yet" />
        </Card>
      </div>
    </div>
  );
}

// ── Community & contributors ─────────────────────────────────────────────────

const CONTRIB_TONE = { verified: 'green', pending: 'gold', active: 'red', rejected: 'muted' };

export function CommunitySection({ contributions = [], goTab }) {
  const ta = useAdminText();
  const [filter, setFilter] = useState('all');
  const rows = contributions.filter((row) => filter === 'all' || (filter === 'reports' ? row.type === 'report' : row.type !== 'report'));
  const open = contributions.filter((row) => row.status === 'pending' || (row.type === 'report' && row.status === 'active')).length;
  return (
    <div className="adm-stack">
      <section className="adm-tiles">
        <StatTile icon={Archive} label="Submissions" value={formatNumber(contributions.filter((row) => row.type !== 'report').length)} note="Photos, audio, stories..." tone="brand" />
        <StatTile icon={Flag} label="Reports" value={formatNumber(contributions.filter((row) => row.type === 'report').length)} note="Content flagged by users" />
        <StatTile icon={Clock} label="Waiting for review" value={formatNumber(open)} note={<button type="button" className="adm-link" onClick={() => goTab('review')}>{ta('Open Review Queue')}</button>} />
      </section>
      <div className="adm-chips" role="tablist">
        {[['all', 'All'], ['submissions', 'Submissions'], ['reports', 'Reports']].map(([key, label]) => (
          <button key={key} type="button" role="tab" aria-selected={filter === key} className={filter === key ? 'active' : ''} onClick={() => setFilter(key)}>{ta(label)}</button>
        ))}
      </div>
      <LiveTable
        title="Community activity"
        rows={rows}
        searchKeys={['title', 'name', 'email', 'type', 'description', 'status']}
        searchPlaceholder="Search community records"
        empty={<Empty title="Nothing from the community yet" body="Contributions and reports sent from the app appear here." />}
        columns={[
          { label: 'Type', render: (row) => <span className="adm-cap">{String(row.type || '').replace('_', ' ')}</span> },
          { label: 'Title', render: (row) => <><div className="adm-strong">{text(row.title) || 'Untitled'}</div><div className="adm-sub adm-clamp">{row.description || ''}</div></> },
          { label: 'From', render: (row) => <><div>{row.name || 'Anonymous'}</div><div className="adm-sub">{row.email || ''}</div></> },
          { label: 'Status', render: (row) => <span className={`admin-badge admin-badge-${CONTRIB_TONE[row.status] || 'muted'}`}>{row.type === 'report' && row.status === 'active' ? ta('open') : row.status}</span> },
          { label: 'Date', render: (row) => <span className="adm-nowrap">{row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'}</span> },
        ]}
      />
    </div>
  );
}

export function ContributorsSection({ engagement }) {
  const rows = engagement?.contributors || [];
  return (
    <LiveTable
      title="Contributors"
      aside={`${formatNumber(rows.length)} people`}
      rows={rows}
      searchKeys={['name', 'email']}
      searchPlaceholder="Search contributors"
      empty={<Empty title="No contributors yet" body="People who submit content or reports from the app are listed here." />}
      columns={[
        { label: 'Name', render: (row) => <><div className="adm-strong">{row.name || 'Anonymous'}</div><div className="adm-sub">{row.email || ''}</div></> },
        { label: 'Submissions', render: (row) => formatNumber(row.submissions) },
        { label: 'Approved', render: (row) => formatNumber(row.approved) },
        { label: 'Pending', render: (row) => formatNumber(row.pending) },
        { label: 'Rejected', render: (row) => formatNumber(row.rejected) },
        { label: 'Reports', render: (row) => formatNumber(row.reports) },
        { label: 'Last active', render: (row) => timeAgo(row.last_at) },
      ]}
    />
  );
}

// ── Records (archive, stories, collections, national, map) ───────────────────

const dateCell = (row) => <span className="adm-nowrap">{row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'}</span>;

export function RecordsSection({ kind, content = {}, goTab }) {
  const ta = useAdminText();
  const manage = <button type="button" className="admin-btn admin-btn-primary" onClick={() => goTab('content')}>{ta('Open Content Registry')}</button>;

  if (kind === 'archive') {
    const groups = [['heritage', 'Heritage'], ['audio', 'Audio'], ['videos', 'Video'], ['collections', 'Collection'], ['proverbs', 'Imigani'], ['exercises', 'Exercise'], ['news', 'News']];
    const rows = groups.flatMap(([key, label]) => (content[key] || []).map((item) => ({ ...item, id: `${key}-${item.id}`, _type: label })))
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    return (
      <div className="adm-stack">
        <section className="adm-tiles adm-tiles--auto">
          {groups.map(([key, label]) => <StatTile key={key} label={label} value={formatNumber((content[key] || []).length)} />)}
        </section>
        <LiveTable title="All archive records" aside={manage} rows={rows} searchKeys={['_type', 'title', 'text', 'category', 'region']} searchPlaceholder="Search the archive"
          columns={[
            { label: 'Type', render: (row) => row._type },
            { label: 'Title', render: (row) => <span className="adm-strong">{text(row.title || row.text) || 'Untitled'}</span> },
            { label: 'Category', render: (row) => text(row.category) || row.status || '-' },
            { label: 'Added', render: dateCell },
          ]} />
      </div>
    );
  }

  if (kind === 'stories') {
    const builtIn = ALL_STORIES.map((story) => ({ id: story.id, title: text(story.title), category: text(story.category), location: text(story.location), xp: story.xpReward }));
    return (
      <div className="adm-stack">
        <LiveTable title="Stories & legends in the app" aside={`${builtIn.length} ${ta('stories')}`} rows={builtIn} searchKeys={['title', 'category', 'location']}
          searchPlaceholder="Search stories"
          columns={[
            { label: 'Title', render: (row) => <span className="adm-strong">{row.title}</span> },
            { label: 'Category', key: 'category' },
            { label: 'Location', key: 'location' },
            { label: 'XP reward', render: (row) => `+${row.xp || 50}` },
          ]} />
        <LiveTable title="Imigani (proverbs) in the database" aside={manage} rows={content.proverbs || []} searchKeys={['text', 'meaning', 'category']}
          searchPlaceholder="Search imigani"
          empty={<Empty title="No imigani yet" body="Add proverbs in Content Registry > Imigani." />}
          columns={[
            { label: 'Proverb', render: (row) => <span className="adm-strong">{text(row.text)}</span> },
            { label: 'Meaning', render: (row) => <span className="adm-clamp">{text(row.meaning || row.translation)}</span> },
            { label: 'Category', render: (row) => text(row.category) || '-' },
            { label: 'Added', render: dateCell },
          ]} />
      </div>
    );
  }

  if (kind === 'collections') {
    return (
      <LiveTable title="Collections" aside={manage} rows={content.collections || []} searchKeys={['title', 'category', 'curated_by']} searchPlaceholder="Search collections"
        empty={<Empty title="No collections yet" body="Create collections in Content Registry > Collections." />}
        columns={[
          { label: 'Title', render: (row) => <span className="adm-strong">{text(row.title)}</span> },
          { label: 'Category', render: (row) => text(row.category) || '-' },
          { label: 'Curated by', key: 'curated_by' },
          { label: 'Added', render: dateCell },
        ]} />
    );
  }

  const heritage = content.heritage || [];
  if (kind === 'map') {
    const mapped = heritage.filter((row) => row.lat != null && row.lng != null && row.lat !== '' && row.lng !== '');
    return (
      <div className="adm-stack">
        <section className="adm-tiles">
          <StatTile icon={MapPin} label="Mapped places" value={formatNumber(mapped.length)} tone="brand" />
          <StatTile label="Without coordinates" value={formatNumber(heritage.length - mapped.length)} note="Add latitude/longitude to show them on the map" />
        </section>
        <LiveTable title="Places on the cultural map" aside={manage} rows={mapped} searchKeys={['title', 'region', 'location']} searchPlaceholder="Search places"
          empty={<Empty title="No mapped places yet" body="Add latitude and longitude to heritage records." />}
          columns={[
            { label: 'Place', render: (row) => <span className="adm-strong">{text(row.title)}</span> },
            { label: 'Region', render: (row) => row.region || '-' },
            { label: 'Coordinates', render: (row) => <a className="adm-link" href={`https://www.openstreetmap.org/?mlat=${row.lat}&mlon=${row.lng}#map=13/${row.lat}/${row.lng}`} target="_blank" rel="noreferrer">{Number(row.lat).toFixed(4)}, {Number(row.lng).toFixed(4)}</a> },
          ]} />
      </div>
    );
  }

  // national
  return (
    <LiveTable title="National heritage records" aside={manage} rows={heritage} searchKeys={['title', 'category', 'region', 'era', 'location']} searchPlaceholder="Search heritage"
      empty={<Empty title="No heritage records yet" body="Add heritage records in Content Registry > Heritage." />}
      columns={[
        { label: 'Title', render: (row) => <span className="adm-strong">{text(row.title)}</span> },
        { label: 'Category', render: (row) => text(row.category) || '-' },
        { label: 'Region', render: (row) => row.region || '-' },
        { label: 'Era', render: (row) => row.era || '-' },
        { label: 'On map', render: (row) => (row.lat != null && row.lng != null ? <span className="admin-badge admin-badge-green">{ta('Yes')}</span> : <span className="admin-badge admin-badge-muted">{ta('No')}</span>) },
      ]} />
  );
}

// ── Settings (persisted in the backend) ──────────────────────────────────────

function Switch({ checked, onChange, label }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`admin-toggle ${checked ? '' : 'off'}`} onClick={() => onChange(!checked)} />;
}

export function SettingsPanel({ showToast, onExport, onSaved }) {
  const ta = useAdminText();
  const [settings, setSettings] = useState(null);
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setError('');
    try {
      const data = await apiJson('/api/admin/settings');
      setSettings(data.settings);
      setSaved(data.settings);
    } catch (err) {
      setError(err.message || 'Settings could not be loaded.');
    }
  };
  useEffect(() => { load(); }, []);

  const dirty = settings && saved && JSON.stringify(settings) !== JSON.stringify(saved);
  const set = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));
  const save = async () => {
    setSaving(true);
    try {
      const data = await apiJson('/api/admin/settings', { method: 'PUT', body: JSON.stringify({ ...settings, ai_daily_limit: Number(settings.ai_daily_limit) }) });
      setSettings(data.settings);
      setSaved(data.settings);
      showToast(ta('Settings saved.'));
      onSaved?.();
    } catch (err) {
      showToast(err.message || 'Settings could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const rows = [
    ['ai_enabled', 'AI assistant', 'Let signed-in users chat with Umuco about Rwandan culture.'],
    ['ai_log_prompts', 'Store questions', 'Keep the text of each question so admins can review it. Counts are kept either way.'],
    ['ai_flag_sensitive', 'Flag sensitive questions', 'Mark questions about the genocide, violence or ethnicity for review.'],
  ];

  return (
    <div className="adm-grid adm-grid--2">
      <Card title="AI Assistant settings" aside={dirty ? ta('Unsaved changes') : ''}>
        {error && <div className="adm-alert adm-alert--red"><AlertTriangle size={15} /> {error} <button type="button" className="admin-btn admin-btn-ghost" onClick={load}>{ta('Retry')}</button></div>}
        {!settings && !error && <Empty title="Loading settings" />}
        {settings && (
          <>
            {rows.map(([key, label, desc]) => (
              <div className="adm-setting" key={key}>
                <div><strong>{ta(label)}</strong><span>{ta(desc)}</span></div>
                <Switch checked={!!settings[key]} onChange={(value) => set(key, value)} label={ta(label)} />
              </div>
            ))}
            <div className="adm-setting">
              <div><strong>{ta('Daily questions per user')}</strong><span>{ta('Protects your AI quota. Between 1 and 1000.')}</span></div>
              <input className="adm-number" type="number" min="1" max="1000" value={settings.ai_daily_limit} onChange={(e) => set('ai_daily_limit', e.target.value)} aria-label={ta('Daily questions per user')} />
            </div>
            <div className="adm-actions">
              <button type="button" className="admin-btn admin-btn-primary" onClick={save} disabled={!dirty || saving}><Save size={13} /> {saving ? ta('Saving...') : ta('Save Changes')}</button>
              {dirty && <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setSettings(saved)}>{ta('Discard')}</button>}
            </div>
          </>
        )}
      </Card>
      <Card title="Data">
        <div className="adm-setting">
          <div><strong>{ta('Export admin data')}</strong><span>{ta('Download the users, content, engagement and AI usage currently loaded, as a JSON file.')}</span></div>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onExport}><Download size={13} /> {ta('Export')}</button>
        </div>
        <div className="adm-setting">
          <div><strong>{ta('AI key')}</strong><span>{ta('The Gemini key is set as GEMINI_API_KEY on the backend server, never in the website. It cannot be changed from here.')}</span></div>
        </div>
      </Card>
    </div>
  );
}
