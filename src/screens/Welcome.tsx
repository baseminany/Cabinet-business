import { useStore } from '../store';
import Img from '../components/Img';

const spaces = [
  ['space-pantry.jpg', 'Walk-in pantries', 'Narrow-depth storage, appliance zones, shelves, and usable counters.'],
  ['space-mudroom.jpg', 'Mudrooms', 'Benches, cubbies, tall doors, hooks, and shoe storage.'],
  ['space-small-kitchen.jpg', 'Small kitchens', 'Base runs, uppers, fillers, and finish combinations that feel custom.'],
  ['space-butler-pantry.jpg', 'Butler pantries', 'Coffee bars, walnut storage, glass fronts, and display shelving.'],
  ['space-montessori.jpg', 'Montessori rooms', 'Low shelves, toy storage, baskets, and family-friendly built-ins.'],
  ['space-laundry.jpg', 'Laundry rooms', 'Folding counters, broom storage, uppers, and clean utility zones.'],
] as const;

export default function Welcome() {
  const setStep = useStore((s) => s.setStep);
  const go = () => setStep('entry');

  return (
    <div className="nice-scroll min-h-0 flex-1 overflow-y-auto bg-warmWhite text-ink">
      <section className="relative overflow-hidden border-b border-champagne/25 bg-[linear-gradient(180deg,#fffdf8,#f4eadb)] px-6 sm:px-10 lg:px-14">
        <div className="absolute right-[-18rem] top-[-18rem] h-[42rem] w-[42rem] rounded-full bg-champagne/25 blur-3xl" />
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between py-6">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.28em] text-ink">Studio</div>
            <div className="mt-1 hidden text-[11px] uppercase tracking-[0.22em] text-ink-muted sm:block">Custom cabinetry for real homes</div>
          </div>
          <button onClick={go} className="rounded-full bg-obsidian px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-porcelain shadow-soft transition hover:bg-walnut">Start designing</button>
        </header>

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 pb-16 pt-8 lg:grid-cols-[0.82fr_1.18fr] lg:pb-24 lg:pt-14">
          <div className="max-w-2xl">
            <p className="eyebrow text-brass">Made-to-measure cabinetry</p>
            <h1 className="fade-up mt-5 text-[clamp(3rem,6.4vw,6.4rem)] font-semibold leading-[0.94] tracking-[-0.055em] text-ink">Design built-ins that feel made for your space.</h1>
            <p className="fade-up-2 mt-7 max-w-xl text-base leading-8 text-ink-soft">Start with a room photo, draw a simple space, or build a single piece. Studio keeps the experience visual, editable, and grounded in real cabinet dimensions.</p>
            <div className="fade-up-3 mt-9 flex flex-wrap gap-3">
              <button onClick={go} className="premium-button px-8 py-4 text-sm">Start designing</button>
              <a href="#spaces" className="rounded-full border border-brass/35 bg-warmWhite px-8 py-4 text-sm font-bold text-walnut shadow-sm transition hover:border-walnut hover:bg-porcelain">Explore spaces</a>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1.05fr_0.95fr]">
            <figure className="premium-card overflow-hidden p-3">
              <Img name="project-pantry-hero.jpg" alt="Custom pantry and coffee bar" label="Pantry + coffee bar" className="aspect-[16/11] w-full rounded-[20px]" />
              <figcaption className="flex items-center justify-between px-2 py-3"><span className="text-sm font-black tracking-tight">Pantry + coffee bar</span><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brass">Rift oak / painted</span></figcaption>
            </figure>
            <div className="grid gap-3">
              <MiniProject file="project-mudroom-feature.jpg" title="Mudroom bench" />
              <MiniProject file="project-playroom-feature.jpg" title="Montessori storage" />
            </div>
          </div>
        </div>
      </section>

      <section id="spaces" className="bg-warmWhite px-6 py-20 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="eyebrow text-brass">Start smaller, make it beautiful</p><h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Realistic projects that can grow into a portfolio.</h2></div>
            <button onClick={go} className="self-start rounded-full border border-ink/15 px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] transition hover:border-ink hover:bg-ink hover:text-white sm:self-end">Open studio →</button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {spaces.map(([file, title, copy]) => <SpaceCard key={title} file={file} title={title} copy={copy} />)}
          </div>
        </div>
      </section>

      <section className="border-y border-champagne/25 bg-porcelain px-6 py-20 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl"><p className="eyebrow text-brass">Inspiration</p><div className="mt-4 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]"><LargeTile file="project-kitchen-feature.jpg" title="Small kitchen wall" sub="painted uppers · rift oak bases" /><div className="grid gap-5"><SmallTile file="space-butler-pantry.jpg" title="Walnut butler pantry" /><SmallTile file="space-laundry.jpg" title="Laundry built-ins" /></div></div></div>
      </section>

      <section className="bg-warmWhite px-6 py-20 sm:px-10 lg:px-14">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]"><div><p className="eyebrow text-brass">How it works</p><h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Simple first. Detailed only when needed.</h2><p className="mt-5 max-w-md text-sm leading-7 text-ink-muted">Users can start with a room and only open advanced cabinet details when they are ready.</p></div><div className="grid gap-4 sm:grid-cols-2">{[['01','Choose a space','Photo reference, blank room, or single piece.'],['02','Add constraints','Walls, openings, and measurements stay editable.'],['03','Pick finishes','Named paints, white oak, rift oak, and walnut.'],['04','Review estimate','Starting price before measurement and shipping review.']].map(([n,t,d]) => <div key={t} className="premium-card p-6"><div className="text-3xl font-semibold tracking-[-0.05em] text-brass">{n}</div><h3 className="mt-5 text-xl font-black tracking-tight">{t}</h3><p className="mt-2 text-sm leading-6 text-ink-muted">{d}</p></div>)}</div></div>
      </section>

      <section className="bg-[linear-gradient(180deg,#f4eadb,#fffdf8)] px-6 py-24 text-center sm:px-10 lg:px-14"><p className="eyebrow text-brass">Ready when you are</p><h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-6xl">Start with one wall. Build toward the whole room.</h2><button onClick={go} className="premium-button mt-9 px-9 py-4 text-sm">Begin your design</button></section>
    </div>
  );
}

function MiniProject({ file, title }: { file: string; title: string }) { return <figure className="premium-card overflow-hidden p-3"><Img name={file} alt={title} label={title} className="aspect-[4/3] w-full rounded-[18px]" /><figcaption className="px-2 py-2 text-sm font-black tracking-tight">{title}</figcaption></figure>; }
function SpaceCard({ file, title, copy }: { file: string; title: string; copy: string }) { return <figure className="group premium-card overflow-hidden p-3"><div className="overflow-hidden rounded-[18px] bg-parchment"><Img name={file} alt={title} label={title} className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-[1.035]" /></div><figcaption className="p-3"><div className="text-lg font-black tracking-tight">{title}</div><p className="mt-1 text-sm leading-6 text-ink-muted">{copy}</p></figcaption></figure>; }
function LargeTile({ file, title, sub }: { file: string; title: string; sub: string }) { return <figure className="premium-card overflow-hidden p-3"><Img name={file} alt={title} label={title} className="min-h-[24rem] w-full rounded-[20px]" /><figcaption className="flex flex-wrap items-end justify-between gap-3 px-2 py-3"><span className="text-2xl font-black tracking-tight">{title}</span><span className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">{sub}</span></figcaption></figure>; }
function SmallTile({ file, title }: { file: string; title: string }) { return <figure className="premium-card overflow-hidden p-3"><Img name={file} alt={title} label={title} className="aspect-[3/2] w-full rounded-[18px]" /><figcaption className="px-2 py-3 text-lg font-black tracking-tight">{title}</figcaption></figure>; }
