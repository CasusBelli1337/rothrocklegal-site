import { describe, expect, it } from 'vitest';
import type { SignEnvelopePublic } from './contract';
import {
  EMPTY_SIGNATURE,
  SIGN_INITIAL,
  buildSubmit,
  hasReadToEnd,
  signReducer,
  signatureProblem,
  type SignEvent,
  type SignState,
} from './sign-state';

const envelope: SignEnvelopePublic = {
  documentTitle: 'Engagement Agreement',
  signerName: 'Jane Doe',
  firmName: 'Rothrock Legal',
  status: 'pending',
  pages: 3,
  expiresAt: '2026-09-10T00:00:00.000Z',
};
const PNG = 'data:image/png;base64,iVBORw0KGgo=';

function run(events: SignEvent[], from: SignState = SIGN_INITIAL): SignState {
  return events.reduce(signReducer, from);
}

describe('sign page state machine', () => {
  it('lands on ready for a pending or viewed envelope', () => {
    expect(run([{ type: 'loaded', envelope }]).phase).toBe('ready');
    expect(run([{ type: 'loaded', envelope: { ...envelope, status: 'viewed' } }]).phase).toBe('ready');
    expect(run([{ type: 'loaded', envelope }]).pagesTotal).toBe(3);
  });

  it('shows the thank-you for a signed envelope and the bad-link card for a dead one', () => {
    expect(run([{ type: 'loaded', envelope: { ...envelope, status: 'signed' } }]).phase).toBe('already-signed');
    expect(run([{ type: 'loaded', envelope: { ...envelope, status: 'void' } }]).phase).toBe('invalid');
    expect(run([{ type: 'loaded', envelope: { ...envelope, status: 'declined' } }]).phase).toBe('invalid');
    expect(run([{ type: 'invalid' }]).phase).toBe('invalid');
  });

  it('retries only from a failed load', () => {
    const failed = run([{ type: 'load-failed', message: 'Offline.' }]);
    expect(failed.phase).toBe('error');
    expect(failed.error).toBe('Offline.');
    expect(run([{ type: 'retry' }], failed)).toEqual(SIGN_INITIAL);
    const ready = run([{ type: 'loaded', envelope }]);
    expect(run([{ type: 'retry' }], ready)).toBe(ready);
  });

  it('opens the signature block after the last page or a confirmation, whichever comes first', () => {
    const ready = run([{ type: 'loaded', envelope }, { type: 'pdf-opened', pages: 4 }]);
    expect(ready.pagesTotal).toBe(4);
    expect(hasReadToEnd(ready)).toBe(false);
    const partly = run([{ type: 'page-seen', page: 2 }, { type: 'page-seen', page: 1 }], ready);
    expect(partly.pagesSeen).toBe(2);
    expect(hasReadToEnd(partly)).toBe(false);
    expect(hasReadToEnd(run([{ type: 'page-seen', page: 4 }], partly))).toBe(true);
    expect(hasReadToEnd(run([{ type: 'confirm-read' }], partly))).toBe(true);
  });

  it('walks ready -> signing -> done, and back to ready on a failure', () => {
    const ready = run([{ type: 'loaded', envelope }]);
    const signing = run([{ type: 'submit' }], ready);
    expect(signing.phase).toBe('signing');
    const result = { done: true as const, signedAt: '2026-09-03T23:12:00.000Z', nextSigner: true };
    expect(run([{ type: 'signed', result }], signing)).toMatchObject({ phase: 'done', result });
    const back = run([{ type: 'submit-failed', message: 'Nope.' }], signing);
    expect(back.phase).toBe('ready');
    expect(back.error).toBe('Nope.');
    expect(run([{ type: 'submit' }], SIGN_INITIAL).phase).toBe('loading');
    expect(run([{ type: 'already-signed' }], signing).phase).toBe('already-signed');
  });
});

describe('signature input', () => {
  const ready = { ...EMPTY_SIGNATURE, consent: true, typedName: 'Jane Doe' };

  it('names the first missing piece in plain words', () => {
    expect(signatureProblem(ready, false)).toMatch(/read to the end/);
    expect(signatureProblem({ ...ready, typedName: '  ' }, true)).toMatch(/full legal name/);
    expect(signatureProblem({ ...ready, kind: 'drawn' }, true)).toMatch(/draw your signature/i);
    expect(signatureProblem({ ...ready, kind: 'drawn', drawnImage: 'data:image/jpeg;base64,AAAA' }, true)).toMatch(/draw your signature/i);
    expect(signatureProblem({ ...ready, consent: false }, true)).toMatch(/tick the box/);
    expect(signatureProblem(ready, true)).toBeNull();
    expect(signatureProblem({ ...ready, kind: 'drawn', drawnImage: PNG }, true)).toBeNull();
  });

  it('builds the request the server expects for each method', () => {
    expect(buildSubmit(ready)).toEqual({
      consent: true,
      signatureKind: 'typed',
      signatureText: 'Jane Doe',
      typedName: 'Jane Doe',
    });
    expect(buildSubmit({ ...ready, typedName: ' Jane Doe ', kind: 'drawn', drawnImage: PNG })).toEqual({
      consent: true,
      signatureKind: 'drawn',
      signatureImage: PNG,
      typedName: 'Jane Doe',
    });
  });
});
