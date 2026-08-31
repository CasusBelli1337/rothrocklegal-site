export function AiLiability() {
  return (
    <section className="px-6 py-14">
      <div className="mx-auto max-w-4xl">
        <h2 className="font-heading text-3xl text-navy-light">AI Liability</h2>
        <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-navy-light">
          <p>
            The rapid proliferation of AI in consumer products and business operations is giving
            rise to complex liability questions. As AI systems become more autonomous and capable
            of causing injury or property damage, courts and litigants are grappling with how to
            apply traditional tort law principles to this novel context.
          </p>
          <p>
            In the absence of AI-specific legislation, plaintiffs have begun to test the waters
            with product liability claims based on theories of negligence, breach of warranty, and
            strict liability. These cases highlight the challenges of assigning fault when an
            AI-powered product is involved.
          </p>
          <p>
            In a recent case involving GPS devices, Cruz v. Raymond Talmadge d/b/a Calvary Coach,
            the plaintiffs alleged that the devices were defectively designed because they directed
            a bus driver to follow a route under a low overpass, causing a collision. The
            plaintiffs claimed that the manufacturers failed to warn of this foreseeable danger and
            could have feasibly incorporated height restriction data. This case illustrates how
            traditional product defect theories may apply where the AI component is relatively
            limited and fault can be traced back to the original design.
          </p>
          <p>
            However, as AI becomes more autonomous, the liability picture becomes murkier. In
            Nilsson v. General Motors, a motorcyclist sued the manufacturer of an autonomous
            vehicle (AV) that allegedly veered into his lane, causing injury. The plaintiff relied
            on a general negligence theory, arguing that the AV itself failed to exercise
            reasonable care in its driving. Intriguingly, the manufacturer admitted that the AV was
            required to use reasonable care, seemingly accepting the premise that the AI system
            could be treated as the negligent actor.
          </p>
          <p>
            The Nilsson case, though settled before a decision on the merits, raises profound
            questions about the future of AI liability. Should the law treat AI as a quasi-person
            capable of negligence? If so, what is the appropriate standard of care – that of a
            reasonable human, or a new “reasonable AI” standard? How do we assess foreseeability
            when AI is designed to act autonomously in complex environments?
          </p>
          <p>
            Moreover, if AI systems themselves can be liable, it remains unclear who should bear
            the cost of compensating victims. Some have suggested that the doctrine of res ipsa
            loquitur, which shifts the burden to defendants to disprove negligence, could provide a
            path to recovery. But this is uncharted territory for the courts.
          </p>
        </div>
      </div>
    </section>
  );
}

export function LegalLandscape() {
  return (
    <section className="hex-band px-6 py-14 text-white">
      <div className="mx-auto max-w-4xl">
        <h2 className="font-heading text-3xl">
          The Legal Landscape of AI Commercial Transactions
        </h2>
        <div className="mt-6 space-y-4 text-[15px] leading-relaxed">
          <p>
            As AI becomes increasingly integrated into business operations, products, and services,
            the legal landscape governing commercial transactions involving AI is evolving rapidly.
            Organizations looking to leverage AI capabilities must navigate a complex web of
            contractual issues, liability concerns, and regulatory uncertainties.
          </p>
          <p>
            At the heart of many AI transactions are software licensing agreements, which may also
            involve the purchase, lease, or licensing of related equipment, services, and data.
            When AI is a central component of the deal, these agreements often raise unique
            negotiation points around risk allocation, data use, and performance guarantees.
          </p>
          <p>
            One key area of focus is the vendor’s representations and warranties regarding the AI
            system’s functionality and output. Given the mission-critical nature of many AI
            implementations, customers will seek robust assurances about the system’s reliability
            and fitness for purpose. Careful drafting is needed to allocate responsibility for any
            failures or errors, particularly where the AI’s decision-making process is opaque.
          </p>
          <p>
            Indemnification provisions are another crucial tool for apportioning liability in AI
            contracts. When an AI system’s autonomous actions cause harm, it may be unclear whether
            fault lies with the AI provider or the user. The parties must thoughtfully negotiate
            indemnity terms to ensure an appropriate balance of risk and responsibility.
          </p>
          <p>
            Limitation of liability clauses also take on heightened importance in the AI context.
            The potential for catastrophic damages from AI failures, such as the shutdown of an
            automated production line or the breach of sensitive user data, means that liability
            caps must be set at levels that properly incentivize performance while providing
            adequate recourse for aggrieved parties.
          </p>
          <p>
            Data rights and usage terms are another key battleground in AI transactions. AI systems
            rely on vast troves of data to train their algorithms and improve their performance
            over time. Vendors often seek broad rights to collect, aggregate, and monetize customer
            data across their user base. Customers, in turn, may resist such data sharing on
            competitiveness or privacy grounds. Finding a mutually acceptable middle ground
            requires careful drafting and attention to applicable data protection laws.
          </p>
          <p>
            The rise of AI-powered consumer products, from smart home devices to self-driving cars,
            adds further wrinkles to the legal analysis. These products often blur the line between
            goods and services, raising questions about the applicability of traditional product
            liability doctrines. Allocation of warranty responsibilities between hardware
            manufacturers and software developers can also be a point of contention. And the
            patchwork of regulatory oversight in this space creates additional compliance
            challenges.
          </p>
          <p>
            As the commercial AI market continues to mature, businesses and their legal counsel
            must stay attuned to the unique risks and opportunities presented by this
            transformative technology. Careful contract drafting, informed by a deep understanding
            of the technical and regulatory landscape, will be essential to unlocking the benefits
            of AI while mitigating potential liabilities. By proactively addressing these issues at
            the dealmaking stage, companies can lay the foundation for successful and sustainable
            AI deployments.
          </p>
        </div>
      </div>
    </section>
  );
}
