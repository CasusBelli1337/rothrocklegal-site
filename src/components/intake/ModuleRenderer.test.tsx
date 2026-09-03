// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FollowUpAnswer, FollowUpModule } from '@/lib/intake/contract';
import type { UploadBinding } from '@/lib/intake/use-uploads';
import { ModuleRenderer, moduleDomId } from './ModuleRenderer';

const uploads: UploadBinding = {
  files: [
    {
      id: 'f1',
      slot: 'deed-upload',
      name: 'deed.pdf',
      size: 2048,
      mimeType: 'application/pdf',
      uploadedAt: '2026-09-01',
    },
    {
      id: 'f2',
      slot: 'other',
      name: 'elsewhere.pdf',
      size: 10,
      mimeType: 'application/pdf',
      uploadedAt: '2026-09-01',
    },
  ],
  pending: [],
  add: vi.fn(),
  retry: vi.fn(),
  cancel: vi.fn(),
  remove: vi.fn(),
};

function mount(module: FollowUpModule, value?: FollowUpAnswer) {
  const onChange = vi.fn();
  render(<ModuleRenderer module={module} value={value} onChange={onChange} uploads={uploads} />);
  return onChange;
}

afterEach(cleanup);

describe('ModuleRenderer', () => {
  it('info: title and body, no skip control', () => {
    mount({ id: 'i', type: 'info', title: 'One thing first', body: 'We read everything.' });
    expect(screen.getByRole('heading', { name: 'One thing first' })).toBeTruthy();
    expect(screen.getByText('We read everything.')).toBeTruthy();
    expect(screen.queryByText('Skip for now')).toBeNull();
  });

  it('short_text: labeled input, placeholder, "helps most" mark, skip still offered', () => {
    const onChange = mount({
      id: 'name',
      type: 'short_text',
      label: "Trustee's full name",
      why: 'We check it.',
      placeholder: 'First and last name',
      required: true,
    });
    const input = screen.getByLabelText(/Trustee's full name/) as HTMLInputElement;
    expect(input.placeholder).toBe('First and last name');
    expect(screen.getByText('(optional, but it helps most)')).toBeTruthy();
    expect(screen.getByText('Skip for now')).toBeTruthy();
    fireEvent.change(input, { target: { value: 'Pat Smith' } });
    expect(onChange).toHaveBeenCalledWith('Pat Smith');
    expect(screen.getByText('We check it.')).toBeTruthy();
  });

  it('long_text: textarea that reports typing', () => {
    const onChange = mount({
      id: 'more',
      type: 'long_text',
      label: 'What did the letter say?',
      why: 'w',
      required: false,
    });
    const area = screen.getByLabelText(/What did the letter say/) as HTMLTextAreaElement;
    expect(area.tagName).toBe('TEXTAREA');
    fireEvent.change(area, { target: { value: 'It said 120 days.' } });
    expect(onChange).toHaveBeenCalledWith('It said 120 days.');
  });

  it('choice: radios when single, checkboxes when multi', () => {
    const single = mount({
      id: 'who',
      type: 'choice',
      label: 'Who is the trustee?',
      why: 'w',
      options: ['Me', 'My brother'],
      multi: false,
      required: true,
    });
    fireEvent.click(screen.getByLabelText('My brother'));
    expect(single).toHaveBeenCalledWith('My brother');
    cleanup();
    const multi = mount(
      {
        id: 'docs',
        type: 'choice',
        label: 'Which do you have?',
        why: 'w',
        options: ['Trust', 'Will'],
        multi: true,
        required: false,
      },
      ['Trust'],
    );
    expect((screen.getByLabelText('Trust') as HTMLInputElement).type).toBe('checkbox');
    fireEvent.click(screen.getByLabelText('Will'));
    expect(multi).toHaveBeenCalledWith(['Trust', 'Will']);
    fireEvent.click(screen.getByLabelText('Trust'));
    expect(multi).toHaveBeenCalledWith([]);
  });

  it('date: a date input', () => {
    const onChange = mount({
      id: 'd',
      type: 'date',
      label: 'When was the letter mailed?',
      why: 'w',
      required: true,
    });
    const input = screen.getByLabelText(/letter mailed/) as HTMLInputElement;
    expect(input.type).toBe('date');
    fireEvent.change(input, { target: { value: '2026-03-01' } });
    expect(onChange).toHaveBeenCalledWith('2026-03-01');
  });

  it('yes_no: Yes and No as radios yielding booleans', () => {
    const onChange = mount(
      {
        id: 'y',
        type: 'yes_no',
        label: 'Did you get a copy of the trust?',
        why: 'w',
        required: true,
      },
      false,
    );
    expect((screen.getByLabelText('No') as HTMLInputElement).checked).toBe(true);
    fireEvent.click(screen.getByLabelText('Yes'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("upload: a drop zone keyed by the module id, listing only that slot's files", () => {
    mount({
      id: 'deed-upload',
      type: 'upload',
      label: 'The deed',
      why: 'w',
      multiple: true,
      required: true,
    });
    expect(screen.getByText('deed.pdf')).toBeTruthy();
    expect(screen.queryByText('elsewhere.pdf')).toBeNull();
    const input = document.getElementById('upload-deed-upload') as HTMLInputElement;
    expect(input.type).toBe('file');
    const file = new File(['x'], 'deed2.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(uploads.add).toHaveBeenCalledWith('deed-upload', [file]);
    fireEvent.click(screen.getByText('Remove'));
    expect(uploads.remove).toHaveBeenCalledWith('f1');
  });

  it('money_range: a select over the contract value ranges', () => {
    const onChange = mount({
      id: 'm',
      type: 'money_range',
      label: 'About how much is the house worth?',
      why: 'w',
      required: false,
    });
    const select = screen.getByLabelText(/house worth/) as HTMLSelectElement;
    expect([...select.options].map((o) => o.value)).toEqual([
      '',
      'under-100k',
      '100k-500k',
      '500k-1m',
      '1m-5m',
      'over-5m',
      'unsure',
    ]);
    fireEvent.change(select, { target: { value: '1m-5m' } });
    expect(onChange).toHaveBeenCalledWith('1m-5m');
  });

  it('optional modules can be skipped for now and answered again', () => {
    const optional: FollowUpModule = {
      id: 'opt',
      type: 'short_text',
      label: 'Optional thing',
      why: 'w',
      required: false,
    };
    const onChange = mount(optional);
    fireEvent.click(screen.getByText('Skip for now'));
    expect(onChange).toHaveBeenCalledWith(null);
    cleanup();
    const again = mount(optional, null);
    expect(screen.getByText(/Skipped for now/)).toBeTruthy();
    expect(screen.queryByLabelText(/Optional thing/)).toBeNull();
    fireEvent.click(screen.getByText('Answer it'));
    expect(again).toHaveBeenCalledWith(undefined);
  });

  it('sanitizes module ids for DOM use', () => {
    expect(moduleDomId('a b/c')).toBe('fu-a-b-c');
  });
});
