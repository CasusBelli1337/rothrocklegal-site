import { describe, expect, it } from 'vitest';
import type { FollowUpModule, IntakeFile } from './contract';
import { withUploadAnswers } from './follow-up';

const modules: FollowUpModule[] = [
  { id: 'deed', type: 'upload', label: 'The deed', why: 'w', multiple: true, required: false },
  { id: 'q', type: 'yes_no', label: 'Q', why: 'w', required: false },
];
const file = (id: string, slot: string): IntakeFile => ({
  id,
  slot,
  name: `${id}.pdf`,
  size: 1,
  mimeType: 'application/pdf',
  uploadedAt: 'now',
});

describe('withUploadAnswers', () => {
  it('answers upload modules with the ids of the files sent to their slot', () => {
    const answers = withUploadAnswers(modules, { q: true }, [
      file('f1', 'deed'),
      file('f2', 'documents'),
    ]);
    expect(answers).toEqual({ q: true, deed: ['f1'] });
  });

  it('leaves an upload module unanswered when nothing was sent to it', () => {
    expect(withUploadAnswers(modules, { deed: null }, [])).toEqual({ deed: null });
  });
});
