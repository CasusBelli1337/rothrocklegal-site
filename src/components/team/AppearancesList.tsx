import { firstName, type AppearanceKind, type TeamMember } from '@/config/team';

const KIND_LABELS: Record<AppearanceKind, string> = {
  talk: 'Speaking',
  article: 'Publication',
  press: 'Press',
  podcast: 'Podcast',
};

const linkClass = 'underline underline-offset-3 transition-colors hover:text-maroon-700';

function PodcastLine({ member }: { member: TeamMember }) {
  const podcast = member.podcast;
  if (!podcast) return null;
  const name = podcast.url ? (
    <a href={podcast.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {podcast.name}
    </a>
  ) : (
    podcast.name
  );
  return (
    <p className="max-w-[60ch] text-body-lg text-ink-2">
      {firstName(member)} {podcast.role === 'Host' ? 'hosts' : podcast.role} <em>{name}</em>,{' '}
      {podcast.description}.
    </p>
  );
}

/** Curated talks, articles, and press, newest first; links only where the dossier has a URL. */
export function AppearancesList({ member }: { member: TeamMember }) {
  const items = [...member.appearances].sort((a, b) => (a.sortDate < b.sortDate ? 1 : -1));
  return (
    <div className="space-y-8">
      <PodcastLine member={member} />
      {items.length > 0 && (
        <ol className="divide-y divide-line border-y border-line">
          {items.map((item) => (
            <li
              key={`${item.sortDate}-${item.title}`}
              className="grid gap-1 py-5 sm:grid-cols-[10rem_1fr] sm:gap-8"
            >
              <div>
                <p className="text-meta text-ink-3">{item.date}</p>
                <p className="eyebrow mt-1.5">{KIND_LABELS[item.kind]}</p>
              </div>
              <div>
                <p className="font-sans text-body font-semibold text-ink">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      {item.title}
                    </a>
                  ) : (
                    item.title
                  )}
                </p>
                <p className="mt-1 text-small text-ink-2">
                  {item.outlet}
                  {item.role && <span className="text-ink-3"> &middot; {item.role}</span>}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
