import Link from 'next/link';
import { AiGearIcon, CheckCircleIcon, UploadDocIcon } from '@/components/icons';

const steps = [
  {
    icon: <UploadDocIcon className="h-10 w-10" />,
    title: 'Upload Input Documents',
    body: "You can upload the documents by using Legion's portal.",
  },
  {
    icon: <AiGearIcon className="h-10 w-10" />,
    title: 'Let The AI Work',
    body: 'Our intelligent software will pull out all relevant information and create a first draft.',
  },
  {
    icon: <CheckCircleIcon className="h-10 w-10" />,
    title: 'We Take It To The Finish Line',
    body: 'Our in-house litigation attorneys will polish the work and send it back to you for review.',
  },
];

export function LegionBand() {
  return (
    <section className="hex-band px-6 py-20 text-center text-white">
      <p className="eyebrow">Interested in Legion?</p>
      <h2 className="font-serif-accent mx-auto mt-3 max-w-xl text-3xl font-bold">
        Streamlined Legal Document Drafting Powered By Legion AI
      </h2>
      <div className="mx-auto mt-14 grid max-w-4xl gap-10 sm:grid-cols-3">
        {steps.map((step) => (
          <div key={step.title} className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center border border-gold text-white">
              {step.icon}
            </div>
            <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
            <p className="mt-2 max-w-[240px] text-sm text-white/85">{step.body}</p>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-12 max-w-xl text-[15px] font-semibold text-gold">
        Are you an attorney interested in how you can leverage AI for your own legal practice?
      </p>
      {/* Wix pointed this at a dead Bookings stub; it now goes to Contact (CHANGES.md). */}
      <Link href="/contact/" className="btn-primary mt-6 inline-block">
        Book a Demo
      </Link>
    </section>
  );
}
