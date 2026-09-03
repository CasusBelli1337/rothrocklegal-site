/**
 * Rothrock Legal intake – shared contract between the website (client) and the
 * intake API (modules/legion-intake). Copy VERBATIM into
 *   site:   src/lib/intake/contract.ts
 *   module: src/shared/contract.ts
 * Any change happens here first, then in both copies. #seam:rothrock-intake-contract
 */

/** 2 adds spokenText, lookup, resume (Phase 2). Servers answer clients of the same major version. */
export const INTAKE_API_VERSION = 2 as const;

/** The eight situations on the homepage plus "other". Keys match practice-area slugs. */
export const SITUATIONS = [
  {
    key: "trust-contests",
    label: "A trust was changed, and it does not look right",
  },
  {
    key: "trust-accounting-disputes",
    label: "A trustee will not share the accounting or the trust",
  },
  {
    key: "undue-influence-and-capacity",
    label: "A parent signed papers when they could not understand them",
  },
  {
    key: "financial-elder-abuse",
    label: "Someone took money or property from an elderly relative",
  },
  {
    key: "breach-of-fiduciary-duty",
    label: "A trustee or executor is mishandling the estate",
  },
  { key: "will-contests", label: "A will cut us out or does not make sense" },
  {
    key: "estate-property-disputes",
    label: "Assets that belong in the trust or estate are missing",
  },
  {
    key: "for-trustees",
    label: "I am the trustee or executor, and a beneficiary is coming after me",
  },
  {
    key: "complex-estates",
    label: "A large estate: several properties, a business or LLC, many heirs",
  },
  { key: "business-disputes", label: "A business or partnership dispute" },
  { key: "other", label: "Something else" },
] as const;
export type SituationKey = (typeof SITUATIONS)[number]["key"];

export type Relationship =
  | "child"
  | "spouse"
  | "sibling"
  | "grandchild"
  | "other-relative"
  | "beneficiary"
  | "trustee-or-executor"
  | "friend-or-caregiver"
  | "other";

export interface Party {
  name: string;
  role:
    | "decedent"
    | "trustee"
    | "executor"
    | "beneficiary"
    | "family"
    | "caregiver"
    | "lawyer"
    | "other";
  note?: string;
}

export const VALUE_RANGES = [
  "under-100k",
  "100k-500k",
  "500k-1m",
  "1m-5m",
  "over-5m",
  "unsure",
] as const;
export type ValueRange = (typeof VALUE_RANGES)[number];

export const FUNDING_OPTIONS = [
  "hourly",
  "need-alternatives",
  "unsure",
] as const;
export type FundingOption = (typeof FUNDING_OPTIONS)[number];

/** Everything the client enters before the AI evaluation. Every field optional until submit. */
export interface IntakeAnswers {
  contact: {
    fullName: string;
    email: string;
    phone?: string;
    city?: string;
    county?: string;
    replyBy: "email" | "phone";
  };
  situations: SituationKey[];
  relationship?: Relationship;
  parties: Party[];
  story: string; // typed or transcribed
  /**
   * Raw phrases the browser's speech recognition heard, appended with a space
   * as they arrived. Kept even when the person edits the story, so the lawyers
   * can see which parts were spoken and exactly what was heard.
   */
  spokenText?: string;
  voiceNoteFileId?: string; // optional recorded audio
  keyDates: {
    dateOfDeath?: string; // yyyy-mm-dd
    noticeReceived?: string;
    trustCopyReceived?: string;
    willAdmitted?: string;
    otherDeadline?: string;
  };
  valueRange?: ValueRange;
  funding?: FundingOption;
  urgencyNote?: string;
  desiredOutcome?: string;
  /** Document slots the client said they do not have. */
  missingDocuments: string[];
  acknowledgedDisclaimers: boolean;
}

export interface IntakeFile {
  id: string;
  slot: string; // document slot key or follow-up module id
  name: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

/** Follow-up modules the evaluator may emit and the site must render. #seam:rothrock-intake-modules */
export type FollowUpModule =
  | { id: string; type: "info"; title: string; body: string }
  | {
      id: string;
      type: "short_text";
      label: string;
      why: string;
      placeholder?: string;
      required: boolean;
    }
  | {
      id: string;
      type: "long_text";
      label: string;
      why: string;
      required: boolean;
    }
  | {
      id: string;
      type: "choice";
      label: string;
      why: string;
      options: string[];
      multi: boolean;
      required: boolean;
    }
  | { id: string; type: "date"; label: string; why: string; required: boolean }
  | {
      id: string;
      type: "yes_no";
      label: string;
      why: string;
      required: boolean;
    }
  | {
      id: string;
      type: "upload";
      label: string;
      why: string;
      multiple: boolean;
      required: boolean;
    }
  | {
      id: string;
      type: "money_range";
      label: string;
      why: string;
      required: boolean;
    };

export type FollowUpAnswer = string | string[] | boolean | null;

export interface EvaluationClientView {
  /** Plain-English, no legal advice: what we understood and what would help. */
  headline: string;
  whatWeUnderstood: string;
  modules: FollowUpModule[]; // ≤ 8
}

export type IntakeStatus =
  | "draft"
  | "evaluating"
  | "follow-up"
  | "submitted"
  | "reviewed";

export interface IntakeSession {
  id: string;
  token: string; // capability token; sent as `Authorization: Bearer <token>`
  status: IntakeStatus;
  reference: string; // human reference like RL-2026-000123
}

/* ---- API shapes ------------------------------------------------------- */

export interface CreateIntakeResponse extends IntakeSession {}

export interface SaveAnswersRequest {
  answers: Partial<IntakeAnswers>;
}
export interface SaveAnswersResponse {
  ok: true;
  status: IntakeStatus;
}

export interface UploadFileResponse {
  file: IntakeFile;
}

export interface EvaluateResponse {
  status: "evaluating" | "follow-up";
  evaluation?: EvaluationClientView; // present when status is follow-up
}

export interface FollowUpRequest {
  answers: Record<string, FollowUpAnswer>; // keyed by module id
}

export interface SubmitResponse {
  reference: string;
  status: "submitted";
  nextSteps: string; // plain English shown on the done screen
}

/**
 * "Continue by email." The client asks whether an unfinished request exists
 * for an address. The answer is a single boolean and never more: a typed
 * email must not reveal anything about someone else's request. When the
 * answer is found, the server itself emails that address a link carrying a
 * resume token; the client never receives the token from this call. The
 * client sends its own session bearer token with this request when it has
 * one, so the server can leave out the request being typed right now.
 */
export interface LookupRequest {
  email: string;
}
export interface LookupResponse {
  found: boolean;
}

/** The server has emailed a continue link (a lookup that found a match, or a resend). */
export interface ResumeSentResponse {
  sent: true;
}

/** Exchanges the token from the emailed link for the earlier request. One use; expires. */
export interface ResumeRequest {
  token: string;
}
export interface ResumeResponse {
  session: IntakeSession;
  answers: IntakeAnswers;
  files: IntakeFile[];
  /** The screen the person was on when the link was sent, if known (a site step id). */
  step?: string;
}

export interface ApiError {
  error: string; // plain English, safe to show
  code:
    | "bad-request"
    | "unauthorized"
    | "not-found"
    | "too-large"
    | "unsupported-type"
    | "rate-limited"
    | "server-error";
}

/** Document slots suggested per situation. Shown on the documents step. #seam:rothrock-intake-doc-slots */
export interface DocumentSlot {
  key: string;
  label: string;
  why: string;
  situations: SituationKey[] | "all";
}
export const DOCUMENT_SLOTS: DocumentSlot[] = [
  {
    key: "trust",
    label: "The trust and any amendments",
    why: "The words of the trust decide most disputes.",
    situations: [
      "trust-contests",
      "trust-accounting-disputes",
      "breach-of-fiduciary-duty",
      "undue-influence-and-capacity",
      "estate-property-disputes",
      "for-trustees",
      "complex-estates",
    ],
  },
  {
    key: "trustee-notice",
    label: 'Any letter from the trustee (a "Notification by Trustee")',
    why: "It starts a 120-day clock. The date matters more than the contents.",
    situations: [
      "trust-contests",
      "trust-accounting-disputes",
      "breach-of-fiduciary-duty",
      "undue-influence-and-capacity",
      "for-trustees",
      "complex-estates",
    ],
  },
  {
    key: "will",
    label: "The will and any earlier wills",
    why: "An earlier will shows what changed and who benefited.",
    situations: [
      "will-contests",
      "undue-influence-and-capacity",
      "estate-property-disputes",
    ],
  },
  {
    key: "probate-papers",
    label:
      "Court papers (petition, notice of hearing, order admitting the will)",
    why: "They tell us which deadlines are running.",
    situations: [
      "will-contests",
      "breach-of-fiduciary-duty",
      "estate-property-disputes",
    ],
  },
  {
    key: "accounting",
    label: "Any accounting or financial report you received",
    why: "A report starts a three-year clock and shows what was spent.",
    situations: [
      "trust-accounting-disputes",
      "breach-of-fiduciary-duty",
      "financial-elder-abuse",
      "for-trustees",
      "complex-estates",
    ],
  },
  {
    key: "bank-statements",
    label: "Bank or brokerage statements you have",
    why: "Money movement is the evidence in abuse and fiduciary cases.",
    situations: [
      "financial-elder-abuse",
      "breach-of-fiduciary-duty",
      "estate-property-disputes",
      "for-trustees",
      "complex-estates",
    ],
  },
  {
    key: "deeds",
    label: "Deeds or property records",
    why: "A deed recorded shortly before death is often the whole case.",
    situations: [
      "financial-elder-abuse",
      "estate-property-disputes",
      "undue-influence-and-capacity",
      "for-trustees",
      "complex-estates",
    ],
  },
  {
    key: "medical",
    label: "Medical records or a diagnosis, if you have them",
    why: "Capacity turns on what the doctors saw and when.",
    situations: [
      "undue-influence-and-capacity",
      "trust-contests",
      "will-contests",
    ],
  },
  {
    key: "correspondence",
    label: "Emails, texts, or letters with the trustee or the other side",
    why: "Their own words are the best evidence.",
    situations: "all",
  },
  {
    key: "death-certificate",
    label: "Death certificate",
    why: "It fixes the date most clocks run from.",
    situations: "all",
  },
  {
    key: "agreements",
    label: "Contracts, operating agreements, or partnership papers",
    why: "The agreement sets the rules of the dispute.",
    situations: ["business-disputes", "complex-estates"],
  },
  {
    key: "other-docs",
    label: "Anything else you think matters",
    why: "When in doubt, send it.",
    situations: "all",
  },
];
