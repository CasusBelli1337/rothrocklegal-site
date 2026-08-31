/**
 * Minimal, deterministic markdown-to-HTML renderer for blog post bodies.
 * Supports exactly what the migrated Wix posts use: paragraphs, ###
 * subheadings, unordered/ordered lists (with indented continuation lines),
 * and **bold** inline text. No external dependencies.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderInline(text: string): string {
  return escapeHtml(text).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

interface ListState {
  tag: 'ul' | 'ol';
  items: string[];
}

function flushList(list: ListState | null, out: string[]): null {
  if (!list) return null;
  const items = list.items.map((item) => `<li>${item}</li>`).join('');
  out.push(`<${list.tag}>${items}</${list.tag}>`);
  return null;
}

export function renderMarkdown(markdown: string): string {
  const out: string[] = [];
  let list: ListState | null = null;

  for (const raw of markdown.split('\n')) {
    const line = raw.trimEnd();
    if (line.trim() === '') {
      list = flushList(list, out);
    } else if (line.startsWith('### ')) {
      list = flushList(list, out);
      out.push(`<h3>${renderInline(line.slice(4))}</h3>`);
    } else if (line.startsWith('- ')) {
      if (!list || list.tag !== 'ul') list = flushList(list, out);
      list = list ?? { tag: 'ul', items: [] };
      list.items.push(renderInline(line.slice(2)));
    } else if (/^\d+\. /.test(line)) {
      if (!list || list.tag !== 'ol') list = flushList(list, out);
      list = list ?? { tag: 'ol', items: [] };
      list.items.push(renderInline(line.replace(/^\d+\. /, '')));
    } else if (/^\s{2,}/.test(raw) && list) {
      const last = list.items.length - 1;
      list.items[last] += `<br />${renderInline(line.trim())}`;
    } else {
      list = flushList(list, out);
      out.push(`<p>${renderInline(line)}</p>`);
    }
  }
  flushList(list, out);
  return out.join('\n');
}
