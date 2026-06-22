import { useStore } from '../store';
import Img from '../components/Img';

const systems = [
  ['product-mudroom-nook.jpg', 'Mudroom Nook', 'A shippable bench, hooks, shoe cubbies, and optional locker modules for busy entries.'],
  ['product-coffee-nook.jpg', 'Coffee Nook', 'A compact hutch-style coffee bar with base storage, shelves, and a finished back panel.'],
  ['product-playroom-storage.jpg', 'Playroom Nook', 'Low Montessori-inspired shelves, baskets, toy storage, and book display for family rooms.'],
  ['product-reading-nook.jpg', 'Reading Nook', 'Bench storage, pillows, book ledges, and cozy shelf modules for corners and kids rooms.'],
  ['product-laundry-nook.jpg', 'Laundry Nook', 'Utility towers, uppers, folding counters, and shelves for small laundry spaces.'],
  ['product-kids-bed-storage.jpg', 'Storage Bed Nook', 'Low twin bed platforms with drawers, cubbies, and simple book ledges — no bunk complexity yet.'],
] as const;

export default function Welcome() {
  const setStep = useStore((s) => s.setStep);
  const go = () => setStep('entry');

  return (
    <div className="nice-scroll min-h-0 flex-1 overflow-y-auto bg-warmWhite text-ink">
      <section className="relative overflow-hidden border-b border-champagne/25 bg-[linear-gradient(180deg,#fffdf8,#f4eadb)] px-6 sm:px-10 lg:px-14">
        <div className="absolute right-[-18rem] top-[-18rem] h-[42rem] w-[42rem] rounded-full bg-champagne/25 blur-3xl" />
        <div className="absolute left-[-12rem] bottom-[-16rem] h-[34rem] w-[34rem] rounded-full bg-sageStone/10 blur-3xl" />
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between py-6">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.26em] text-ink">House of Nook</div>
            <div className="mt-1 hidden text-[11px] uppercase tracking-[0.22em] text-ink-muted sm:block">Shippable built-ins for everyday rooms</div>
          </div>
          <button onClick={go} className="rounded-full bg-obsidian px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-porcelain shadow-soft transition hover:bg-walnut">Start planning</button>
        </header>

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 pb-16 pt-8 lg:grid-cols-[0.82fr_1.18fr] lg:pb-24 lg:pt-14">
          <div className="max-w-2xl">
            <p className="eyebrow text-brass">Modular nook systems</p>
            <h1 className="fade-up mt-5 text-[clamp(3rem,6.4vw,6.4rem)] font-semibold leading-[0.94] tracking-[-0.055em] text-ink">Small spaces, beautifully built.</h1>
            <p className="fade-up-2 mt-7 max-w-xl text-base leading-8 text-ink-soft">
              Plan warm, practical built-ins that can be made in modules and shipped to real homes: mudrooms, playrooms, laundry nooks, coffee bars, reading corners, and storage beds.
            </p>
            <div className="fade-up-3 mt-9 flex flex-wrap gap-3">
              <button onClick={go} className="premium-button px-8 py-4 text-sm">Build my nook</button>
              <a href="#systems" className="rounded-full border border-brass/35 bg-warmWhite px-8 py-4 text-sm font-bold text-walnut shadow-sm transition hover:border-walnut hover:bg-porcelain">Explore systems</a>
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
              {['Garage-buildable', 'Shippable modules', 'Family-home scale'].map((item) => (
                <div key={item} className="rounded-2xl border border-champagne/35 bg-white/60 p-4 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted shadow-sm">{item}</div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1.05fr_0.95fr]">
            <figure className="premium-card overflow-hidden p-3">
              <Img name="hero-mudroom-nook.jpg" alt="Compact modular mudroom nook" label="Mudroom Nook" className="aspect-[16/11] w-full rounded-[20px]" />
              <figcaption className="flex items-center justify-between px-2 py-3"><span className="text-sm font-black tracking-tight">Mudroom Nook</span><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brass">painted / oak bench</span></figcaption>
            </figure>
            <div className="grid gap-3">
              <MiniProject file="product-coffee-nook.jpg" title="Coffee Nook" />
              <MiniProject file="product-playroom-storage.jpg" title="Playroom Storage" />
            </div>
          </div>
        </div>
      </section>

      <section id="systems" className="bg-warmWhite px-6 py-20 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="eyebrow text-brass">Start with one useful nook</p><h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Modular products that feel custom, without starting with a full remodel.</h2></div>
            <button onClick={go} className="self-start rounded-full border border-ink/15 px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] transition hover:border-ink hover:bg-ink hover:text-white sm:self-end">Open planner →</button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {systems.map(([file, title, copy]) => <SystemCard key={title} file={file} title={title} copy={copy} />)}
          </div>
        </div>
      </section>

      <section className="border-y border-champagne/25 bg-porcelain px-6 py-20 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl"><p className="eyebrow text-brass">Designed for real homes</p><div className="mt-4 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]"><LargeTile file="product-reading-nook.jpg" title="Reading bench with storage" sub="bench · drawers · book ledges" /><div className="grid gap-5"><SmallTile file="product-laundry-nook.jpg" title="Laundry utility nook" /><SmallTile file="product-kids-bed-storage.jpg" title="Storage bed nook" /></div></div></div>
      </section>

      {/* WHY WE EXIST — competitive positioning section */}
      <section className="border-y border-champagne/25 bg-[linear-gradient(180deg,#fdf9f2,#f6ede0)] px-6 py-24 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow text-brass">Why we built this</p>
            <h2 className="mt-4 text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl">The in-between finally exists.</h2>
            <p className="mt-5 text-base leading-8 text-ink-soft">
              For a long time, "custom built-ins" meant picking between two bad options. We built the third one.
            </p>
          </div>

          {/* Three-way contrast cards */}
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {/* IKEA path */}
            <div className="rounded-3xl border border-champagne/30 bg-warmWhite p-7">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-champagne/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">IKEA / big-box</div>
              <div className="text-3xl font-bold text-ink">~$800–$2k</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">+ your weekend + your sanity</div>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-ink-soft">
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-red-400">✗</span>Boxes sized for showrooms, not real walls</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-red-400">✗</span>Missing hardware, misread pictograms, restart from scratch</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-red-400">✗</span>Looks assembled. Feels assembled. Won't last like built-in.</li>
              </ul>
            </div>

            {/* Contractor path */}
            <div className="rounded-3xl border border-champagne/30 bg-warmWhite p-7">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-champagne/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">Custom contractor</div>
              <div className="text-3xl font-bold text-ink">$15k–$60k</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">8–14 week wait, no preview</div>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-ink-soft">
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-red-400">✗</span>You won't see it until it's installed — and priced</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-red-400">✗</span>Material selections from a binder, not a live 3D model</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-red-400">✗</span>Two months of dust, delays, and back-and-forth</li>
              </ul>
            </div>

            {/* House of Nook */}
            <div className="relative rounded-3xl border-2 border-walnut/30 bg-walnut p-7 text-porcelain shadow-lift">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-porcelain/80">House of Nook</div>
              <div className="text-3xl font-bold">$2k–$6k</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-porcelain/60">4–6 weeks, see it before you buy</div>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-porcelain/85">
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-amber-300">✓</span>Custom-fit to your exact wall — to the inch</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-amber-300">✓</span>Design live in 3D before ordering a single piece</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-amber-300">✓</span>Ships flat-pack, assembles in a day — not a month</li>
              </ul>
            </div>
          </div>

          {/* Proof stat row */}
          <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-champagne/30 sm:grid-cols-4">
            {[
              ['4–6 weeks', 'From order to your door — not 14'],
              ['To the inch', 'Sized for your actual wall, not a showroom floor'],
              ['See it first', 'Design in 3D before you spend a dollar'],
              ['$2k–$6k', 'The custom look, without the contractor price'],
            ].map(([stat, desc]) => (
              <div key={stat} className="bg-warmWhite px-6 py-7">
                <div className="text-xl font-black tracking-tight text-ink">{stat}</div>
                <div className="mt-2 text-[12px] leading-5 text-ink-muted">{desc}</div>
              </div>
            ))}
          </div>

          {/* Emotional closer */}
          <div className="mt-14 mx-auto max-w-2xl rounded-3xl border border-brass/20 bg-[#fffbf2] px-8 py-8 text-center">
            <p className="text-lg font-semibold leading-7 text-ink">
              "Your space isn't disorganized because you failed.<br className="hidden sm:block" /> It was just never designed for how your family actually lives."
            </p>
            <p className="mt-4 text-sm text-ink-muted">House of Nook builds the nook your space always needed — without the contractor markup or the IKEA regret.</p>
            <button onClick={go} className="premium-button mt-6 px-8 py-3.5 text-sm">Design my nook →</button>
          </div>
        </div>
      </section>

      <section className="bg-warmWhite px-6 py-20 sm:px-10 lg:px-14">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]"><div><p className="eyebrow text-brass">How it works</p><h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Simple first. Detailed only when needed.</h2><p className="mt-5 max-w-md text-sm leading-7 text-ink-muted">Choose a nook system, adjust size, pick finishes, then review a starting estimate. Advanced construction details stay tucked away until they matter.</p></div><div className="grid gap-4 sm:grid-cols-2">{[['01','Choose a system','Mudroom, coffee, playroom, laundry, reading, or storage bed.'],['02','Fit the space','Enter the wall width, room depth, and major openings.'],['03','Pick finishes','Named paints, white oak, rift oak, and walnut.'],['04','Review estimate','Starting price before measurement and shipping review.']].map(([n,t,d]) => <div key={t} className="premium-card p-6"><div className="text-3xl font-semibold tracking-[-0.05em] text-brass">{n}</div><h3 className="mt-5 text-xl font-black tracking-tight">{t}</h3><p className="mt-2 text-sm leading-6 text-ink-muted">{d}</p></div>)}</div></div>
      </section>

      <section className="bg-[linear-gradient(180deg,#f4eadb,#fffdf8)] px-6 py-24 text-center sm:px-10 lg:px-14"><p className="eyebrow text-brass">Ready when you are</p><h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-6xl">Start with one nook. Build toward a calmer home.</h2><button onClick={go} className="premium-button mt-9 px-9 py-4 text-sm">Begin your plan</button></section>
    </div>
  );
}

function MiniProject({ file, title }: { file: string; title: string }) { return <figure className="premium-card overflow-hidden p-3"><Img name={file} alt={title} label={title} className="aspect-[4/3] w-full rounded-[18px]" /><figcaption className="px-2 py-2 text-sm font-black tracking-tight">{title}</figcaption></figure>; }
function SystemCard({ file, title, copy }: { file: string; title: string; copy: string }) { return <figure className="group premium-card overflow-hidden p-3"><div className="overflow-hidden rounded-[18px] bg-parchment"><Img name={file} alt={title} label={title} className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-[1.035]" /></div><figcaption className="p-3"><div className="text-lg font-black tracking-tight">{title}</div><p className="mt-1 text-sm leading-6 text-ink-muted">{copy}</p></figcaption></figure>; }
function LargeTile({ file, title, sub }: { file: string; title: string; sub: string }) { return <figure className="premium-card overflow-hidden p-3"><Img name={file} alt={title} label={title} className="min-h-[24rem] w-full rounded-[20px]" /><figcaption className="flex flex-wrap items-end justify-between gap-3 px-2 py-3"><span className="text-2xl font-black tracking-tight">{title}</span><span className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">{sub}</span></figcaption></figure>; }
function SmallTile({ file, title }: { file: string; title: string }) { return <figure className="premium-card overflow-hidden p-3"><Img name={file} alt={title} label={title} className="aspect-[3/2] w-full rounded-[18px]" /><figcaption className="px-2 py-3 text-lg font-black tracking-tight">{title}</figcaption></figure>; }
