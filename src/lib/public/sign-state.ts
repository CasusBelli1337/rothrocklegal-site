import type { SignEnvelopePublic, SignSubmit, SignSubmitResponse, SignatureKind } from './contract';
import { SIGN_COPY } from './copy';
import { signatureImageProblem } from './signature-image';

/**
 * The /sign/ page as a pure state machine: what the link resolved to, how far
 * the person has read, and where the signing request stands. The component
 * only dispatches events and renders the phase.
 */
export type SignPhase =
  | 'loading'
  | 'invalid'
  | 'error'
  | 'ready'
  | 'signing'
  | 'done'
  | 'already-signed';

export interface SignState {
  phase: SignPhase;
  envelope: SignEnvelopePublic | null;
  /** From the PDF once it opened; the envelope's count until then. */
  pagesTotal: number;
  /** The furthest page that has been on screen. */
  pagesSeen: number;
  confirmedRead: boolean;
  result: SignSubmitResponse | null;
  error: string | null;
}

export type SignEvent =
  | { type: 'loaded'; envelope: SignEnvelopePublic }
  | { type: 'invalid' }
  | { type: 'load-failed'; message: string }
  | { type: 'retry' }
  | { type: 'pdf-opened'; pages: number }
  | { type: 'page-seen'; page: number }
  | { type: 'confirm-read' }
  | { type: 'submit' }
  | { type: 'signed'; result: SignSubmitResponse }
  | { type: 'submit-failed'; message: string }
  | { type: 'already-signed' };

export const SIGN_INITIAL: SignState = {
  phase: 'loading',
  envelope: null,
  pagesTotal: 0,
  pagesSeen: 0,
  confirmedRead: false,
  result: null,
  error: null,
};

/** Where a freshly loaded envelope lands: signed ones show the thank-you, dead ones the bad-link card. */
function phaseFor(envelope: SignEnvelopePublic): SignPhase {
  if (envelope.status === 'signed') return 'already-signed';
  if (envelope.status === 'declined' || envelope.status === 'void') return 'invalid';
  return 'ready';
}

export function signReducer(state: SignState, event: SignEvent): SignState {
  switch (event.type) {
    case 'loaded':
      return {
        ...SIGN_INITIAL,
        phase: phaseFor(event.envelope),
        envelope: event.envelope,
        pagesTotal: event.envelope.pages,
      };
    case 'invalid':
      return { ...SIGN_INITIAL, phase: 'invalid' };
    case 'load-failed':
      return { ...SIGN_INITIAL, phase: 'error', error: event.message };
    case 'retry':
      return state.phase === 'error' ? SIGN_INITIAL : state;
    case 'pdf-opened':
      return { ...state, pagesTotal: Math.max(1, event.pages) };
    case 'page-seen':
      return event.page > state.pagesSeen ? { ...state, pagesSeen: event.page } : state;
    case 'confirm-read':
      return { ...state, confirmedRead: true };
    case 'submit':
      return state.phase === 'ready' ? { ...state, phase: 'signing', error: null } : state;
    case 'signed':
      return { ...state, phase: 'done', result: event.result, error: null };
    case 'submit-failed':
      return state.phase === 'signing' ? { ...state, phase: 'ready', error: event.message } : state;
    case 'already-signed':
      return { ...state, phase: 'already-signed', error: null };
  }
}

/** The signature block opens once the last page has been on screen or the person said so. */
export function hasReadToEnd(state: SignState): boolean {
  return state.confirmedRead || (state.pagesTotal > 0 && state.pagesSeen >= state.pagesTotal);
}

/** What the person filled in under the agreement. */
export interface SignatureInput {
  consent: boolean;
  typedName: string;
  kind: SignatureKind;
  /** PNG data URL from the drawing pad; null until they draw. */
  drawnImage: string | null;
}

export const EMPTY_SIGNATURE: SignatureInput = {
  consent: false,
  typedName: '',
  kind: 'typed',
  drawnImage: null,
};

/** The first plain-English problem with the input, or null when it can be sent. */
export function signatureProblem(input: SignatureInput, readToEnd: boolean): string | null {
  if (!readToEnd) return SIGN_COPY.problems.notRead;
  if (!input.typedName.trim()) return SIGN_COPY.problems.name;
  if (input.kind === 'drawn') {
    if (!input.drawnImage) return SIGN_COPY.problems.drawn;
    const problem = signatureImageProblem(input.drawnImage);
    if (problem) return problem;
  }
  if (!input.consent) return SIGN_COPY.problems.consent;
  return null;
}

/** The request body, once `signatureProblem` is null. */
export function buildSubmit(input: SignatureInput): SignSubmit {
  const typedName = input.typedName.trim();
  if (input.kind === 'drawn' && input.drawnImage) {
    return { consent: true, signatureKind: 'drawn', signatureImage: input.drawnImage, typedName };
  }
  return { consent: true, signatureKind: 'typed', signatureText: typedName, typedName };
}
