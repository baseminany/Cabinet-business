import { useStore } from '../store';
import Img from '../components/Img';

export default function Welcome() {
  const setStep = useStore((s) => s.setStep);
  const go = () => setStep('entry');

  return (
    <div className="nice-scroll min-h-0 flex-1 overflow-y-auto bg-warmWhite text-ink">
      <section className="luxury-shell relative overflow-hidden px-6 text-porcelain sm:px-10 lg:px-14">
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between py-6">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.28em]">Studio</div>
            <div className="mt-1 hidden text-[11px] uppercase tracking-[0.22em] text-porcelain/50 sm:block">Made-to-measure cabinetry</div>
          </div>
          <nav className="hidden items-center gap-8 text-[11px] font-bold uppercase tracking-[0.18em] text-porcelain/55 md:flex">
            <a href="#spaces" className="transition hover:text-champagne">Spaces</a>
            <a href="#process" className="transition hover:text-champagne">Process</a>
            <a href="#work" className="transition hover:text-champagne">Finish</a>
          </nav>
          <button onClick={go} className="premium-button-secondary px-5 py-2.5 text-[11px] uppercase tracking-[0.16em]">Start designing</button>
        </header>

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 pb-20 pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:pb-28 lg:pt-16">
          <div className="max-w-3xl">
            <p className="eyebrow text-champagne">Custom cabinetry, designed around your room</p>
            <h1 className="fade-up mt-6 text-[clamp(3.6rem,8vw,8.2rem)] font-black leading-[0.88] tracking-[-0.055em] text-warmWhite">
              Make your home look built in, not filled in.
            </h1>
            <p className="fade-up-2 mt-7 max-w-xl text-base leading-8 text-porcelain/68">
              Upload your space, shape the room, add cabinetry to exact dimensions, and get a refined starting estimate for made-to-measure pieces shipped to your door.
            </p>
            <div className="fade-up-3 mt-9 flex flex-wrap gap-3">
              <button onClick={go} className="rounded-full bg-porcelain px-8 py-4 text-sm font800 font-bold text-obsidian shadow-premiumGlow transition hover:bg-warmWhite active:scale-[0.98]">
                Start with my room
              </button>
              <button onClick={go} className="premium-button-secondary px-8 py-4 text-sm">Upload a photo</button>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {['Photo-first setup', 'Exact dimensions', 'Live estimate', 'Shop-ready packet'].map((item) => (
                <div key={item} className="rounded-2xl border border-champagne/18 bg-white/[0.035] p-4 text-[11px] font-bold uppercase tracking-[0.16em] text-porcelain/62">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <HeroConfiguratorMock />
        </div>
      </section>

      <section id="spaces" className="editorial-surface border-b border-champagne/30 px-6 py-20 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-brass">Start from a room type</p>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">Designed for real homes.</h2>
            </div>
            <button onClick={go} className="self-start rounded-full border border-ink/15 px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] transition hover:border-ink hover:bg-ink hover:text-white sm:self-end">Open studio →</button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SpaceCard file="space-pantry.jpg" label="Pantry" copy="Narrow depths, tall storage, floating shelves." />
            <SpaceCard file="space-mudroom.jpg" label="Mudroom" copy="Benches, doors, hooks, shoe storage." />
            <SpaceCard file="space-kitchen.jpg" label="Kitchen" copy="Base runs, uppers, fillers, appliance zones." />
            <SpaceCard file="space-office.jpg" label="Office" copy="Built-ins, drawers, shelves, display." />
          </div>
        </div>
      </section>

      <section id="process" className="bg-warmWhite px-6 py-20 sm:px-10 lg:px-14">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="eyebrow text-brass">The experience</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">A design tool that thinks like a cabinetmaker.</h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-ink-muted">
              Every visual choice is tied to real parts, cut dimensions, materials, and pricing logic. Pretty, but still buildable.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['01', 'Map the room', 'Start from a photo or manually shape the walls and openings.'],
              ['02', 'Add pieces', 'Build cabinets, uppers, shelves, and pantry runs by exact size.'],
              ['03', 'Review estimate', 'See an honest starting price before shop review and shipping.'],
              ['04', 'Build packet', 'Maker mode keeps pricing, cut list, and SketchUp exports separate.'],
            ].map(([n, t, d]) => (
              <div key={t} className="premium-card p-6">
                <div className="text-3xl font-black tracking-[-0.05em] text-brass">{n}</div>
                <h3 className="mt-5 text-xl font-black tracking-tight">{t}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="work" className="bg-obsidian px-6 py-20 text-porcelain sm:px-10 lg:px-14">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <Tile file="project-natural.jpg" title="Warm white oak" sub="rift grain · clean reveals" big />
          <div className="grid gap-5">
            <Tile file="project-modern.jpg" title="Painted deep olive" sub="custom color · brass detail" />
            <Tile file="project-wood.jpg" title="Walnut storage wall" sub="integrated · architectural" />
          </div>
        </div>
      </section>

      <section className="bg-warmWhite px-6 py-24 text-center sm:px-10 lg:px-14">
        <p className="eyebrow text-brass">Ready when you are</p>
        <h2 className="mx-auto mt-4 max-w-3xl text-5xl font-black leading-[0.95] tracking-[-0.05em] sm:text-6xl">Start with a room. End with cabinetry that feels permanent.</h2>
        <button onClick={go} className="premium-button mt-9 px-9 py-4 text-sm">Begin your design</button>
      </section>
    </div>
  );
}

function HeroConfiguratorMock() {
  return (
    <div className="fade-up-2 premium-card-dark relative overflow-hidden p-4 sm:p-5">
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-champagne/10 blur-3xl" />
      <div className="rounded-[22px] border border-champagne/16 bg-porcelain p-4 text-ink shadow-darkPanel">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-brass">Live room preview</div>
            <div className="mt-1 text-xl font-black tracking-tight">Pantry wall · 142 in</div>
          </div>
          <div className="rounded-full bg-deepGreen px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-porcelain">Estimate</div>
        </div>
        <div className="relative h-[24rem] overflow-hidden rounded-2xl border border-black/5 bg-[#e9e1d2]">
          <div className="absolute inset-x-0 bottom-0 h-[44%] bg-[linear-gradient(135deg,#c49666,#a87347)]" />
          <div className="absolute bottom-[38%] left-7 right-7 h-2 bg-warmWhite shadow" />
          <div className="absolute bottom-[44%] left-8 flex h-[46%] w-[52%] gap-1.5">
            <div className="w-1/3 rounded-t-sm bg-[#f0ede5] shadow-xl ring-1 ring-black/10" />
            <div className="w-1/3 rounded-t-sm bg-[#f0ede5] shadow-xl ring-1 ring-black/10" />
            <div className="w-1/3 rounded-t-sm bg-[#f0ede5] shadow-xl ring-1 ring-black/10" />
          </div>
          <div className="absolute bottom-[18%] left-8 flex h-[25%] w-[52%] gap-1.5">
            <div className="w-1/2 bg-[#5a3b27] shadow-xl ring-1 ring-black/10" />
            <div className="w-1/2 bg-[#5a3b27] shadow-xl ring-1 ring-black/10" />
          </div>
          <div className="absolute right-8 top-10 h-32 w-24 rounded-sm border-[10px] border-warmWhite bg-blueStone/40 shadow-xl" />
          <div className="absolute bottom-6 right-6 rounded-2xl bg-obsidian/88 p-4 text-porcelain shadow-darkPanel backdrop-blur">
            <div className="text-[10px] uppercase tracking-[0.18em] text-champagne">Starting estimate</div>
            <div className="mt-1 text-3xl font-black tracking-tight">$8.4k</div>
            <div className="mt-1 text-xs text-porcelain/55">measure + shipping review next</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpaceCard({ file, label, copy }: { file: string; label: string; copy: string }) {
  return (
    <figure className="group premium-card overflow-hidden p-3">
      <div className="overflow-hidden rounded-[18px] bg-parchment">
        <Img name={file} alt={label} label={label} className="aspect-[4/5] w-full transition-transform duration-500 group-hover:scale-[1.045]" />
      </div>
      <figcaption className="p-3">
        <div className="text-lg font-black tracking-tight">{label}</div>
        <p className="mt-1 text-sm leading-6 text-ink-muted">{copy}</p>
      </figcaption>
    </figure>
  );
}

function Tile({ file, title, sub, big }: { file: string; title: string; sub: string; big?: boolean }) {
  return (
    <figure className="group relative overflow-hidden rounded-[28px] bg-charcoal ring-1 ring-champagne/18">
      <Img name={file} alt={title} label={title} className={(big ? 'h-full min-h-[28rem] ' : 'aspect-[5/3] ') + 'w-full opacity-90 transition-transform duration-700 group-hover:scale-[1.04]'} />
      <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/70 via-black/22 to-transparent p-5 text-white">
        <span className="text-xl font-black tracking-tight">{title}</span>
        <span className="text-[11px] uppercase tracking-[0.16em] text-white/70">{sub}</span>
      </figcaption>
    </figure>
  );
}