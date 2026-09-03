import { asset } from '@/config/site';

/**
 * The one module that touches pdf.js, loaded in the browser only (a dynamic
 * import, so the static export never evaluates it on the server). The worker
 * is bundled from the package; if the browser refuses it, the copy that
 * scripts/pdfjs-assets.mjs puts under /pdfjs/ is the fallback. The wasm
 * decoders and standard fonts always come from that folder.
 */
export interface PdfHandle {
  numPages: number;
  /** Width and height of a page at scale 1, in PDF points. */
  pageSize(pageNumber: number): Promise<{ width: number; height: number }>;
  /** Paints one page into `canvas` at `cssWidth` CSS pixels, sharp for the device. */
  renderPage(pageNumber: number, canvas: HTMLCanvasElement, cssWidth: number): Promise<void>;
  destroy(): void;
}

type PdfJs = typeof import('pdfjs-dist');

let workerReady = false;

function attachWorker(pdfjs: PdfJs): void {
  if (workerReady) return;
  workerReady = true;
  try {
    pdfjs.GlobalWorkerOptions.workerPort = new Worker(
      new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url),
      { type: 'module' },
    );
  } catch {
    pdfjs.GlobalWorkerOptions.workerSrc = asset('/pdfjs/pdf.worker.mjs');
  }
}

export async function loadPdf(url: string): Promise<PdfHandle> {
  const pdfjs = await import('pdfjs-dist');
  attachWorker(pdfjs);
  const task = pdfjs.getDocument({
    url,
    wasmUrl: asset('/pdfjs/wasm/'),
    standardFontDataUrl: asset('/pdfjs/standard_fonts/'),
  });
  const doc = await task.promise;
  return {
    numPages: doc.numPages,
    async pageSize(pageNumber) {
      const page = await doc.getPage(pageNumber);
      const { width, height } = page.getViewport({ scale: 1 });
      return { width, height };
    },
    async renderPage(pageNumber, canvas, cssWidth) {
      const page = await doc.getPage(pageNumber);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: cssWidth / base.width });
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      await page.render({
        canvas,
        viewport,
        transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
      }).promise;
    },
    destroy() {
      void task.destroy();
    },
  };
}
