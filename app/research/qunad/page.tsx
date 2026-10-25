import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import Background from "@/components/Background";
import { chip, eyebrow, panel } from "@/components/demos/ui";

export const metadata: Metadata = {
  title: "Machine Learning for Topological Invariants — QuNAD Lab | Shubhika Pradeep",
  description:
    "Research case study: do neural networks learn topological invariants from Hamiltonian representations, or exploit statistical patterns that fail out of distribution?",
};

// Every claim on this page carries one of these labels, so finished work is never confused with a plan.
const STATUS = {
  implemented: { label: "implemented", style: "border-[#9fd1c6]/40 text-[#bfe3da]" },
  reported: { label: "reported finding", style: "border-[#9bbbe0]/40 text-[#c3d6ee]" },
  proposed: { label: "proposed · not completed", style: "border-[#e6d3a8]/45 text-[#e6d3a8]" },
} as const;

function Status({ kind }: { kind: keyof typeof STATUS }) {
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[9px] uppercase tracking-[.22em] ${STATUS[kind].style}`}>
      {STATUS[kind].label}
    </span>
  );
}

function Section({ n, id, title, children }: { n: string; id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-20 max-w-4xl md:mt-28">
      <p className={eyebrow}>{n}</p>
      <h2 id={id} className="mt-3 font-serif text-[clamp(2rem,4.5vw,3.25rem)] leading-[1] tracking-[-.02em] text-[#f4f7f6]">
        {title}
      </h2>
      <div className="mt-8 space-y-5 text-[16px] font-light leading-8 tracking-[.02em] text-[#dce7e5]/88 md:text-[17px]">{children}</div>
    </section>
  );
}

function Equation({ children, caption }: { children: ReactNode; caption: string }) {
  return (
    <figure className="my-6 overflow-x-auto rounded-2xl border border-white/10 bg-[#061c27]/55 px-6 py-5">
      <p className="whitespace-nowrap font-serif text-[20px] italic text-[#f4f7f6] md:text-[24px]">{children}</p>
      <figcaption className="mt-3 text-[12px] font-light tracking-wide text-[#b8ccca]/70">{caption}</figcaption>
    </figure>
  );
}

const MODELS = [
  {
    name: "K-nearest neighbours",
    role: "Distance-based baseline",
    body: "Run on flattened Hamiltonian representations as a non-neural reference point for the neural models, on clean data and in the generalization settings.",
  },
  {
    name: "Multilayer perceptron",
    role: "Fully connected classifier",
    body: "Operates on flattened Hamiltonian inputs: a neural baseline without the spatial inductive bias of convolutions.",
  },
  {
    name: "Convolutional neural network",
    role: "Primary classifier",
    body: "Learns local structure in the Hamiltonian (momentum-space) representations. Performed best of the three on standard clean datasets.",
  },
  {
    name: "Conv1D regression (simplified)",
    role: "Direct winding-number prediction",
    body: "A separate TensorFlow implementation with 32 and 16 convolutional filters followed by dense layers, on 100-point Hamiltonian inputs (10,000 training / 2,000 validation samples). Outputs are rounded to integer winding numbers.",
  },
];

const FINDINGS = [
  {
    title: "Strong clean-data performance",
    body: "On standard clean datasets the CNN performed best of the three classifiers.",
  },
  {
    title: "Unseen winding numbers",
    body: "For models trained on a limited range of winding numbers, performance degraded significantly at |w| = 3 and 4 when those values were outside the training range.",
  },
  {
    title: "Parameter-distribution shift",
    body: "Larger SSH hopping parameters (t, t′) than seen in training reduced accuracy.",
  },
  {
    title: "Model complexity did not predict generalization",
    body: "KNN sometimes generalized better than the MLP or CNN, even though the CNN was strongest on clean data.",
  },
];

export default function QunadCaseStudy() {
  return (
    <main className="relative min-h-screen bg-deep text-ink">
      <Background />

      <div className="relative z-20 px-5 py-5 sm:px-8 md:px-12 md:py-8 lg:px-[7vw]">
        <header className="flex items-center justify-between text-[9px] uppercase tracking-[.34em] text-[#c1d1d0]/70">
          <Link href="/#research" className="inline-flex min-h-[44px] items-center gap-2 transition-colors duration-500 hover:text-white">
            <span aria-hidden="true">←</span> back to research
          </Link>
          <p className="hidden sm:block">Shubhika Pradeep / Research</p>
        </header>

        {/* Title block */}
        <div className="mt-16 max-w-4xl md:mt-24">
          <p className="text-[10px] uppercase tracking-[.42em] text-[#bfd1cf]/70">
            research case study · QuNAD Lab, PES University · Nov 2024 – May 2026
          </p>
          <h1 className="mt-5 font-serif text-[clamp(2.75rem,7vw,5.75rem)] leading-[.92] tracking-[-.04em] text-[#f4f7f6]">
            Do neural networks learn <span className="italic text-white">topology</span> — or the dataset?
          </h1>
          <p className="mt-8 max-w-2xl text-[17px] font-light leading-8 tracking-[.03em] text-[#dce7e5]/90 md:text-[18px]">
            Machine learning for topological invariants: testing whether models classify phases because they capture winding-number
            structure, or because they exploit statistical regularities that disappear once the physics leaves the training distribution.
          </p>
          <ul aria-label="Topics" className="mt-6 flex flex-wrap gap-2">
            {["Python", "TensorFlow", "KNN · MLP · CNN", "SSH model", "AIII class", "Winding number"].map((t) => (
              <li key={t} className={chip}>{t}</li>
            ))}
          </ul>
        </div>

        {/* Reading key + contribution */}
        <div className="mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          <aside aria-label="How to read this page" className={panel}>
            <p className={eyebrow}>how to read this page</p>
            <ul className="mt-4 space-y-3 text-[14px] font-light leading-relaxed text-[#dce7e5]/85">
              <li className="flex flex-wrap items-center gap-3"><Status kind="implemented" /> built and run as part of the project</li>
              <li className="flex flex-wrap items-center gap-3"><Status kind="reported" /> recorded in the lab problem statement</li>
              <li className="flex flex-wrap items-center gap-3"><Status kind="proposed" /> a defined direction, not a finished experiment</li>
            </ul>
          </aside>
          <aside aria-label="My contribution" className={panel}>
            <p className={eyebrow}>my contribution</p>
            <ul className="mt-4 space-y-2 text-[14px] font-light leading-relaxed text-[#dce7e5]/85">
              <li>— Model implementation (KNN, MLP, CNN, Conv1D regression)</li>
              <li>— Physics-informed Hamiltonian data generation</li>
              <li>— Winding-number label computation and SSH validation</li>
              <li>— Benchmarking, generalization testing, phase-diagram analysis</li>
              <li>— Framing the disorder / non-Hermitian research direction</li>
            </ul>
          </aside>
        </div>

        <Section n="01" id="question" title="Research question">
          <p>
            Can machine-learning models genuinely learn topological invariants from Hamiltonian representations, or do they rely on statistical
            patterns that fail when winding numbers, parameter distributions, disorder, or non-Hermitian effects change?
          </p>
          <p>
            The first half of this question was investigated experimentally (winding numbers and parameter distributions). The second half —
            disorder and non-Hermitian effects — is the proposed next stage; see <a href="#next" className="underline underline-offset-4 hover:text-white">next questions</a>.
          </p>
        </Section>

        <Section n="02" id="motivation" title="Motivation">
          <p>
            Zhang et al. (2018), <em>Machine Learning Topological Invariants with Neural Networks</em>, showed that neural networks can be trained to
            recover topological information such as winding numbers. That work was the central reference for this project, and the starting
            point was reproducing and extending ML approaches for classifying topological phases from Hamiltonian-derived inputs.
          </p>
          <p>
            A high test accuracy is not, on its own, evidence that a model has learned the invariant. If the test data come from the same
            distribution as the training data, a model can score well by exploiting regularities of that distribution. A topological invariant
            is defined independently of any sampling distribution, so the sharper test is what happens when the distribution — or the physics —
            changes.
          </p>
        </Section>

        <Section n="03" id="methodology" title="Methodology">
          <h3 className={eyebrow}>physics-informed synthetic data <span className="ml-2 align-middle"><Status kind="implemented" /></span></h3>
          <p>Two complementary generators produced labelled Hamiltonians:</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className={panel}>
              <p className={eyebrow}>fourier-based · general 1D AIII</p>
              <p className="mt-3 text-[14px] leading-relaxed">
                Hamiltonians built from Fourier expansions of the momentum-dependent components h<sub>x</sub>(k) and h<sub>y</sub>(k), using random
                coefficients and normalized vectors. The maximum winding number can be controlled, which makes unseen-winding-number tests possible.
              </p>
            </div>
            <div className={panel}>
              <p className={eyebrow}>su–schrieffer–heeger (ssh)</p>
              <p className="mt-3 text-[14px] leading-relaxed">
                A simpler, interpretable model whose clean topological phase has an analytical criterion. It gives an independent check on the
                numerically computed labels.
              </p>
            </div>
          </div>

          <h3 className={`${eyebrow} pt-4`}>winding-number labels <span className="ml-2 align-middle"><Status kind="implemented" /></span></h3>
          <p>
            The winding number measures how the planar vector (h<sub>x</sub>, h<sub>y</sub>) winds around the origin as momentum traverses the
            Brillouin zone:
          </p>
          <Equation caption="Winding number as the accumulated change of the vector's angle over the Brillouin zone.">
            w = (1/2π) ∮<sub>BZ</sub> dk · d/dk arg[ h<sub>x</sub>(k) + i·h<sub>y</sub>(k) ]
          </Equation>
          <p>
            The discrete implementation approximates this by summing phase changes between sampled momentum points, with phase unwrapping, following
            the winding-number formulation in Zhang et al. Labels are therefore computed from the mathematical structure the models are meant to learn,
            not assigned by hand.
          </p>
          <Equation caption="SSH momentum-space Hamiltonian, as used by the SSH generator.">
            H(k) = (t + t′ cos k) σ<sub>x</sub> + t′ sin k · σ<sub>y</sub>
          </Equation>
          <p>For SSH data, the analytical winding-number criterion is used to validate the numerically generated clean labels.</p>

          <h3 className={`${eyebrow} pt-4`}>models <span className="ml-2 align-middle"><Status kind="implemented" /></span></h3>
          <div className="grid gap-4 md:grid-cols-2">
            {MODELS.map((m) => (
              <div key={m.name} className={panel}>
                <p className={eyebrow}>{m.role}</p>
                <h4 className="mt-2 font-serif text-[24px] leading-tight text-[#f4f7f6]">{m.name}</h4>
                <p className="mt-3 text-[14px] leading-relaxed">{m.body}</p>
              </div>
            ))}
          </div>
          <p>
            Classification and regression are distinct tasks here. Assigning a phase or winding-number class is not the same as estimating an
            arbitrary winding number, and a model that does the first does not automatically do the second. The regression model is a separate
            experiment, not another name for the CNN classifier.
          </p>
        </Section>

        <Section n="04" id="design" title="Experimental design">
          <ol className="space-y-3">
            {[
              "Generate synthetic Hamiltonians (Fourier-based AIII and SSH).",
              "Compute winding-number labels by discrete phase unwrapping; validate clean SSH labels against the analytical criterion.",
              "Build model-ready Hamiltonian representations.",
              "Train KNN, MLP and CNN classifiers, plus the separate Conv1D regression model.",
              "Benchmark on clean data from the training distribution.",
              "Test generalization: winding numbers outside the training range, and shifted parameter ranges.",
              "Compare predictions with the physical reference labels, including as phase diagrams over Hamiltonian parameters.",
            ].map((step, i) => (
              <li key={step} className="flex gap-4">
                <span className="mt-[2px] w-6 shrink-0 text-[11px] tracking-[.2em] text-[#b8ccca]/55">{String(i + 1).padStart(2, "0")}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p>
            The phase diagrams plot model predictions against ground-truth labels derived from winding numbers or the analytical SSH criterion. This
            shows <em>where</em> in parameter space a model fails, rather than only that an aggregate score dropped. <Status kind="implemented" />
          </p>
        </Section>

        <Section n="05" id="findings" title="Findings">
          <p>
            These are the qualitative findings recorded in the lab&apos;s problem statement. No per-model accuracy figures are shown, because a
            complete, verified set of numbers for every historical experiment is not available, and none are being estimated here.
          </p>
          <ul className="grid gap-4 md:grid-cols-2">
            {FINDINGS.map((f) => (
              <li key={f.title} className={panel}>
                <Status kind="reported" />
                <h3 className="mt-4 font-serif text-[24px] leading-tight text-[#f4f7f6]">{f.title}</h3>
                <p className="mt-3 text-[14px] leading-relaxed">{f.body}</p>
              </li>
            ))}
          </ul>
          <p>
            <span className="text-[#f4f7f6]">Interpretation.</span> High accuracy on the winding numbers and parameters seen in training did not
            establish generalization to others, and a more complex model was not necessarily a more general one. This is consistent with the
            hypothesis that the models rely partly on statistical regularities in the generated Hamiltonians instead of fully recovering the
            definition of the winding number.
          </p>
        </Section>

        <Section n="06" id="limitations" title="Limitations">
          <ul className="space-y-3">
            <li>— The results are evidence of generalization limits consistent with statistical-pattern learning. They do not prove what internal representation any model learned; that would need interpretability or probing experiments.</li>
            <li>— Exact per-model metrics, hyperparameters and run-by-run records for the early experiments are not reproduced on this page. The final held-out metrics of the Conv1D regression model are not available in the recovered records.</li>
            <li>— The data are synthetic and one-dimensional, from two generators. Conclusions are not claimed for experimental data or higher dimensions.</li>
            <li>— Disorder and non-Hermitian systems have not been benchmarked as part of the work reported here.</li>
            <li>— No publication or accepted paper from this project is claimed.</li>
          </ul>
        </Section>

        <Section n="07" id="next" title="Next questions">
          <p>
            By May 2026 the work was consolidated into the problem statement <em>Learning Topological Invariants in Disordered and Non-Hermitian
            Systems using Neural Networks</em>. It asks whether a model trained on clean systems still assigns sensible classes once the assumptions
            behind the clean labels are broken. Everything in this section is a research direction, not a result.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className={panel}>
              <Status kind="proposed" />
              <h3 className="mt-4 font-serif text-[24px] leading-tight text-[#f4f7f6]">Disorder</h3>
              <p className="mt-3 text-[14px] leading-relaxed">
                Off-diagonal disorder (random hoppings, which can preserve chiral symmetry) versus diagonal / onsite disorder (random potentials,
                which generally break it). The proposed experiment trains on clean SSH-like systems and evaluates on disordered and extended
                systems, then analyses the failure modes. A complete quantitative sweep has not been established.
              </p>
            </div>
            <div className={panel}>
              <Status kind="proposed" />
              <h3 className="mt-4 font-serif text-[24px] leading-tight text-[#f4f7f6]">Non-Hermitian systems</h3>
              <p className="mt-3 text-[14px] leading-relaxed">
                Asymmetric hopping, non-Hermitian localization and exceptional points. Open questions: does a model trained on Hermitian systems
                generalize, and how should performance be judged when the invariant has no simple analytical criterion like clean SSH?
              </p>
            </div>
          </div>
          <p>Further open challenges named in the problem statement: interpretability, benchmarks suited to disordered systems, and linking learned representations to quantities such as Berry phases or spectral flow.</p>
        </Section>

        <Section n="08" id="references" title="References">
          <ul className="space-y-3 text-[15px]">
            <li>— Zhang et al. (2018). <em>Machine Learning Topological Invariants with Neural Networks.</em> Primary reference.</li>
            <li>— Fukui, Hatsugai &amp; Suzuki (2005). Discretized calculation of topological numbers; cited in the problem statement.</li>
            <li>
              — Preprint on localization in non-Hermitian systems cited in the problem statement:{" "}
              <a href="https://arxiv.org/abs/2511.10156" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-white">
                arXiv:2511.10156 ↗
              </a>
            </li>
          </ul>
        </Section>

        <footer className="mt-24 flex items-center justify-between pb-8 text-[9px] uppercase tracking-[.24em] text-[#bdcccb]/60">
          <Link href="/#research" className="inline-flex min-h-[44px] items-center transition-colors hover:text-white">← back to research</Link>
          <Link href="/#contact" className="inline-flex min-h-[44px] items-center transition-colors hover:text-white">get in touch →</Link>
        </footer>
      </div>
    </main>
  );
}
