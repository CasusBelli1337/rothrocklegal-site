'use client';

import { useEffect, useRef, useState } from 'react';
import { SIGN_COPY } from '@/lib/public/copy';
import { loadPdf, type PdfHandle } from '@/lib/public/pdf';

interface PdfDocumentProps {
  url: string;
  onOpened(pages: number): void;
  onPageSeen(page: number): void;
  onFailed(): void;
}

interface PageSize {
  width: number;
  height: number;
}

/** Opens the document and reads every page's size, so the boxes exist before any paint. */
function useDocument(url: string, onOpened: (n: number) => void, onFailed: () => void) {
  const [handle, setHandle] = useState<PdfHandle | null>(null);
  const [sizes, setSizes] = useState<PageSize[]>([]);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    let opened: PdfHandle | null = null;
    setHandle(null);
    setSizes([]);
    setFailed(false);
    loadPdf(url)
      .then(async (doc) => {
        opened = doc;
        const numbers = Array.from({ length: doc.numPages }, (_, i) => i + 1);
        const all = await Promise.all(numbers.map((n) => doc.pageSize(n)));
        if (!alive) return;
        setSizes(all);
        setHandle(doc);
        onOpened(doc.numPages);
      })
      .catch(() => {
        if (!alive) return;
        setFailed(true);
        onFailed();
      });
    return () => {
      alive = false;
      opened?.destroy();
    };
  }, [url, onOpened, onFailed]);
  return { handle, sizes, failed };
}

/** The column's width in CSS pixels, in 8px steps so a scrollbar flicker never re-renders. */
function useWidth(ref: React.RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(Math.floor(el.clientWidth / 8) * 8);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

/** Paints the pages one after another and reports how many are done. */
function useSequentialRender(
  handle: PdfHandle | null,
  width: number,
  canvases: React.RefObject<(HTMLCanvasElement | null)[]>,
  onFailed: () => void,
): number {
  const [rendered, setRendered] = useState(0);
  useEffect(() => {
    if (!handle || width === 0) return;
    let alive = true;
    setRendered(0);
    (async () => {
      for (let n = 1; n <= handle.numPages; n++) {
        const canvas = canvases.current[n - 1];
        if (!alive || !canvas) return;
        await handle.renderPage(n, canvas, width);
        if (!alive) return;
        setRendered(n);
      }
    })().catch(() => {
      if (alive) onFailed();
    });
    return () => {
      alive = false;
    };
  }, [handle, width, canvases, onFailed]);
  return rendered;
}

/** Reports the furthest page that has scrolled into view. */
function usePagesSeen(
  ref: React.RefObject<HTMLDivElement | null>,
  ready: boolean,
  onPageSeen: (page: number) => void,
): void {
  useEffect(() => {
    const el = ref.current;
    if (!el || !ready) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const page = Number((entry.target as HTMLElement).dataset.page);
          if (page > 0) onPageSeen(page);
        }
      },
      { threshold: 0.15 },
    );
    el.querySelectorAll<HTMLElement>('[data-page]').forEach((page) => observer.observe(page));
    return () => observer.disconnect();
  }, [ref, ready, onPageSeen]);
}

/** The agreement, every page rendered in the page flow with a progress line while it paints. */
export function PdfDocument({ url, onOpened, onPageSeen, onFailed }: PdfDocumentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvases = useRef<(HTMLCanvasElement | null)[]>([]);
  const { handle, sizes, failed } = useDocument(url, onOpened, onFailed);
  const width = useWidth(containerRef);
  const rendered = useSequentialRender(handle, width, canvases, onFailed);
  usePagesSeen(containerRef, handle !== null, onPageSeen);
  const total = handle?.numPages ?? 0;

  return (
    <div ref={containerRef}>
      {failed ? (
        <p role="alert" className="wizard-alert text-body text-ink">
          {SIGN_COPY.pdf.failed}
        </p>
      ) : (
        <p role="status" aria-live="polite" className="mb-3 min-h-6 text-small text-ink-3">
          {total > 0 && rendered < total ? SIGN_COPY.pdf.preparing(rendered + 1, total) : ''}
        </p>
      )}
      <ol className="space-y-4" aria-label="Agreement pages">
        {sizes.map((size, i) => (
          <li key={i} data-page={i + 1} className="sign-page" style={{ aspectRatio: `${size.width} / ${size.height}` }}>
            <canvas
              ref={(el) => {
                canvases.current[i] = el;
              }}
              aria-label={SIGN_COPY.pdf.pageLabel(i + 1, total)}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
