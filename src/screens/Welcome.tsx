import { useStore } from '../store';
import Img from '../components/Img';

// Editorial, white, photography-led landing — mirrors the INNERFORM reference:
// crisp near-black bold sans type, generous whitespace, rich image slots.
// Drop real photos into public/images/ (see MANIFEST.md) and they appear here.
export default function Welcome() {
  const setStep = useStore((s) => s.setStep);
  const go = () => setStep('entry');

  return (
    <div className="nice-scroll min-h-0 flex-1 overflow-y-auto bg-white text-ink">
      {/* Nav */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-200 bg-white/90 px-6 py-4 backdrop-blur sm:px-12">
        <span className="text-sm font-extrabold uppercase tracking-[0.22em]">Studio</span>
        <nav className="hidden gap-9 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500 md:flex">
          <a href="#work" className="hover:text-ink">Work</a>
          <a href="#spaces" className="hover:text-ink">Spaces</a>
          <a href="#approach" className="hover:text-ink">Approach</a>
        </nav>
        <button onClick={go} className="rounded-full bg-ink px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-black">Let’s design</button>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pt-14 sm:px-12 sm:pt-20">
        <div className="grid items-end gap-8 lg:grid-cols-[1.3fr_1fr]">
          <h1 className="fade-up text-[clamp(3rem,9vw,7rem)] font-extrabold leading-[0.92] tracking-[-0.03em]">Made to fit.</h1>
          <p className="fade-up-2 max-w-sm text-sm leading-relaxed text-neutral-600">
            We design and build custom cabinetry to your exact measurements — kitchens, pantries,
            vanities, and built-ins — then ship them to your door. Start from a photo or shape your
            room, and watch a real estimate take form as you design.
          </p>
        </div>
        <div className="fade-up-2 mt-10 overflow-hidden rounded-[20px] bg-neutral-100">
          <Img name="hero.jpg" alt="Custom kitchen" label="Hero image — hero.jpg" className="h-[clamp(18rem,46vw,34rem)] w-full" />
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button onClick={go} className="rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-black active:scale-[0.99]">Start your design</button>
          <a href="#approach" className="rounded-full border border-neutral-300 px-7 py-3.5 text-sm font-semibold text-ink transition hover:border-ink">See the process</a>
        </div>
      </section>

      {/* Choose your space */}
      <section id="spaces" className="mx-auto max-w-7xl px-6 py-20 sm:px-12">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Choose your space</h2>
          <button onClick={go} className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500 hover:text-ink">Start designing →</button>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[['space-kitchen.jpg', 'Kitchen'], ['space-pantry.jpg', 'Pantry'], ['space-vanity.jpg', 'Vanity'], ['space-mudroom.jpg', 'Mudroom']].map(([file, label]) => (
            <figure key={label} className="group">
              <div className="overflow-hidden rounded-2xl bg-neutral-100">
                <Img name={file} alt={label} label={label} className="aspect-[4/5] w-full transition-transform duration-500 group-hover:scale-[1.04]" />
              </div>
              <figcaption className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">{label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Purpose + stats */}
      <section className="border-y border-neutral-200 bg-neutral-50 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 sm:px-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-gold-600">Why made-to-measure</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">We build the pieces standard sizes can’t.</h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-neutral-600">
              Every cabinet is cut to your dimensions and finished by hand — so your space is used
              completely, and the result looks like it was always meant to be there.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-6 self-center">
            {[['12', 'Years building'], ['3k+', 'Pieces shipped'], ['48', 'States served']].map(([n, l]) => (
              <div key={l}>
                <div className="text-4xl font-extrabold tracking-tight text-ink">{n}<span className="text-gold-500">.</span></div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-neutral-500">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent work */}
      <section id="work" className="mx-auto max-w-7xl px-6 py-20 sm:px-12">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Recent work</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Tile file="project-natural.jpg" title="Natural luxury" sub="White oak · Denver" big />
          <div className="grid gap-4">
            <Tile file="project-modern.jpg" title="Modern black" sub="Painted · Austin" />
            <Tile file="project-wood.jpg" title="Wood mode" sub="Walnut · Seattle" />
          </div>
        </div>
      </section>

      {/* Approach */}
      <section id="approach" className="border-t border-neutral-200 py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-12">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">From your room to your door</h2>
          <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {[['Design', 'Shape your room from a photo or by hand, then add pieces to your exact sizes.'], ['Estimate', 'A transparent starting price updates live as you design.'], ['Build', 'We cut, assemble, and hand-finish to your dimensions.'], ['Deliver', 'Crated and shipped to your door, nationwide.']].map(([t, d], i) => (
              <div key={t}>
                <div className="text-3xl font-extrabold text-gold-500">0{i + 1}</div>
                <div className="my-3 h-px bg-neutral-200" />
                <h3 className="text-lg font-bold tracking-tight">{t}</h3>
                <p className="mt-1.5 text-sm text-neutral-600">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink px-6 py-24 text-center text-white">
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Design yours today.</h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-white/60">Two minutes to a real starting estimate. No account needed.</p>
        <button onClick={go} className="mt-8 rounded-full bg-white px-9 py-4 text-sm font-semibold text-ink transition hover:bg-neutral-200 active:scale-[0.98]">Begin your design</button>
        <p className="mt-12 text-xs font-semibold uppercase tracking-[0.3em] text-white/40">Studio · Made-to-measure cabinetry</p>
      </section>
    </div>
  );
}

function Tile({ file, title, sub, big }: { file: string; title: string; sub: string; big?: boolean }) {
  return (
    <figure className="group relative overflow-hidden rounded-2xl bg-neutral-100">
      <Img name={file} alt={title} label={title} className={(big ? 'h-full min-h-[20rem] ' : 'aspect-[4/3] ') + 'w-full transition-transform duration-500 group-hover:scale-[1.04]'} />
      <figcaption className="absolute bottom-0 left-0 right-0 flex items-end justify-between bg-gradient-to-t from-black/55 to-transparent p-4 text-white">
        <span className="text-base font-bold">{title}</span>
        <span className="text-[11px] uppercase tracking-[0.14em] text-white/75">{sub}</span>
      </figcaption>
    </figure>
  );
}
