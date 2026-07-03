import { useMemo } from 'react';
import { useStore } from '../store';
import Img from '../components/Img';
import { PRESETS, presetPrice, type PresetSpec } from '../model/presets';
import { ProductSketch } from './ShopPrebuilt';

function money(n: number): string { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }); }

const FEATURED_IDS = ['montessori-bookshelf', 'floating-shelves', 'entry-console', 'coffee-open-station'];

const systems = [
  ['product-mudroom.png', 'Mudroom & Entry', 'Bench seats, locker towers, hooks, and shoe cubbies for busy entryways.'],
  ['product-coffee.png', 'Coffee Bar', 'Counter-height base, mug shelves, and storage for your coffee station.'],
  ['kids-montessori-bookshelf.png', 'Kids & Playroom', 'Montessori bookshelves, learning towers, book ledges, and toy storage.'],
  ['product-floating-shelves.png', 'Living & Office', 'Floating shelves, consoles, and display pieces for everyday rooms.'],
  ['product-console.png', 'Entry Console', 'Slim consoles and hall pieces for keys, mail, baskets, and decor.'],
  ['kids-cubby-bench.png', 'Reading & Storage', 'Bench storage, book ledges, nightstands, and cozy shelf modules.'],
] as const;

export default function Welcome() {
  const setStep = useStore((s) => s.setStep);
  const openShop = useStore((s) => s.openShop);
  const openProduct = useStore((s) => s.openProduct);
  const go = () => setStep('entry');
  const featured = useMemo(() => FEATURED_IDS.map((id) => PRESETS.find((p) => p.id === id)).filter(Boolean) as PresetSpec[], []);
  const prices = useMemo(() => Object.fromEntries(PRESETS.map((p) => [p.id, presetPrice(p)])), []);
  const checkout = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('checkout') : null;

  return (
    <div className="nice-scroll min-h-0 flex-1 overflow-y-auto bg-warmWhite text-ink">
      {checkout === 'success' && (
        <div className="bg-deepGreen px-6 py-3 text-center text-sm font-bold text-porcelain">Thank you — your order is in! We'll email your receipt and shipping details shortly.</div>
      )}
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
            <p className="eyebrow text-brass">Modular built-ins for everyday rooms · made in the USA</p>
            <h1 className="fade-up mt-5 text-[clamp(3rem,6.4vw,6.4rem)] font-semibold leading-[0.94] tracking-[-0.055em] text-ink">Small spaces, beautifully built.</h1>
            <p className="fade-up-2 mt-7 max-w-xl text-base leading-8 text-ink-soft">
              Warm, practical built-ins for the rooms you actually live in — mudrooms, coffee bars, reading nooks, laundry, entryways, and kids' playrooms. Designed online to fit your space, shipped flat, with straightforward assembly.
            </p>
            <div className="fade-up-3 mt-9 flex flex-wrap gap-3">
              <button onClick={() => openShop('All')} className="premium-button px-8 py-4 text-sm">Shop ready-made →</button>
              <button onClick={go} className="rounded-full border border-brass/35 bg-warmWhite px-8 py-4 text-sm font-bold text-walnut shadow-sm transition hover:border-walnut hover:bg-porcelain">Design for my space</button>
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
              {['Made to fit', 'Ships flat-pack', 'Real wood, USA-made'].map((item) => (
                <div key={item} className="rounded-2xl border border-champagne/35 bg-white/60 p-4 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted shadow-sm">{item}</div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1.05fr_0.95fr]">
            <figure className="premium-card overflow-hidden p-3">
              <Img name="kids-montessori-bookshelf.png" alt="Montessori forward-facing bookshelf in white oak" label="Montessori Bookshelf" className="aspect-[16/11] w-full rounded-[20px]" />
              <figcaption className="flex items-center justify-between px-2 py-3"><span className="text-sm font-black tracking-tight">Montessori Bookshelf</span><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brass">white oak · forward-facing</span></figcaption>
            </figure>
            <div className="grid gap-3">
              <MiniProject file="product-floating-shelves.png" title="Floating Shelves" />
              <MiniProject file="product-shoe-bench.png" title="Shoe Bench" />
            </div>
          </div>
        </div>
      </section>

      {/* READY TO ORDER — surface the pre-built shop high on the page */}
      <section className="border-b border-champagne/25 bg-warmWhite px-6 py-16 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-brass">Ready to order · ships flat</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Pre-built nooks, priced and ready.</h2>
              <p className="mt-2 max-w-xl text-sm leading-7 text-ink-muted">Order as-is, or open one in the planner to change the size, shelves, and finish. Real starting prices from our shop.</p>
            </div>
            <button onClick={() => openShop('All')} className="self-start rounded-full bg-walnut px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-porcelain shadow-soft transition hover:bg-obsidian sm:self-end">Browse all ready-made →</button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <button key={p.id} onClick={() => openProduct(p.id)} className="group premium-card overflow-hidden p-0 text-left transition hover:shadow-card active:scale-[0.99]">
                <div className="flex h-40 items-center justify-center overflow-hidden bg-[linear-gradient(160deg,#f4ede0,#e8ddc9)]">
                  {p.image ? <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" /> : <ProductSketch type={p.items[0].type} />}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-champagne/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-walnut">{p.category}</span>
                    <span className="text-sm font-black text-ink">{money(prices[p.id])}<span className="ml-1 text-[9px] font-bold uppercase tracking-wide text-ink-muted">from</span></span>
                  </div>
                  <div className="mt-2 text-sm font-black leading-tight tracking-tight text-ink">{p.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="systems" className="bg-warmWhite px-6 py-20 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="eyebrow text-brass">A nook for every room</p><h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Mudroom to playroom, entry to coffee bar — pick a design and make it yours.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-ink-muted">Every product can be customized — size, finish, extra shelves or doors — with the price updating as you go. Need something truly one-of-a-kind? Fully custom built-ins are available by quote.</p></div>
            <button onClick={go} className="self-start rounded-full border border-ink/15 px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] transition hover:border-ink hover:bg-ink hover:text-white sm:self-end">Open planner →</button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {systems.map(([file, title, copy]) => <SystemCard key={title} file={file} title={title} copy={copy} />)}
          </div>
        </div>
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
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-red-400">✗</span>Assembly instructions written for a showroom, not your wall</li>
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
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-amber-300">✓</span>Ships flat-pack — designed for straightforward assembly</li>
                <li className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0 text-amber-300">✓</span>Designed and built in-house in the USA — not imported or prefab</li>
              </ul>
            </div>
          </div>

          {/* Proof stat row */}
          <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-champagne/30 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {[
              ['4–6 weeks', 'From order to your door — not 14'],
              ['To the inch', 'Sized for your actual wall, not a showroom floor'],
              ['See it first', 'Design in 3D before you spend a dollar'],
              ['$2k–$6k', 'The custom look, without the contractor price'],
              ['🇺🇸 Made here', 'Built in-house in the USA — not imported or prefab'],
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

      {/* WHO WE ARE — the maker behind it */}
      <section className="border-y border-champagne/25 bg-porcelain px-6 py-20 sm:px-10 lg:px-14">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_1fr]">
          <figure className="premium-card overflow-hidden p-3">
            <Img name="product-mudroom.png" alt="House of Nook built-in in a real home" label="In-house build" className="aspect-[5/4] w-full rounded-[20px]" />
          </figure>
          <div>
            <p className="eyebrow text-brass">Who we are</p>
            <h2 className="mt-3 text-4xl font-semibold leading-[1.0] tracking-[-0.045em] sm:text-5xl">A real shop, not a warehouse.</h2>
            <div className="mt-5 space-y-4 text-base leading-8 text-ink-soft">
              <p>House of Nook is a small, owner-run woodworking shop in the USA. Every piece is designed, cut, and finished in-house — not imported, not drop-shipped, not assembled from someone else's flat-pack.</p>
              <p>We started it for a simple reason: the furniture for the spaces families actually live in — the mudroom, the playroom, the reading corner — is either cheap and disposable or custom and unaffordable. So we built the in-between: real-wood, built-to-fit pieces you can design online and put together yourself.</p>
              <p>When you order, you're not buying from a faceless catalog. You're working with the person who builds it.</p>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              {['Owner-run', 'Made in the USA 🇺🇸', 'Real wood', 'Built to your measurements'].map((t) => (
                <span key={t} className="rounded-full border border-champagne/40 bg-warmWhite px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SHIPPING & ASSEMBLY — how it gets to your home */}
      <section className="bg-warmWhite px-6 py-20 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow text-brass">Design to doorstep</p>
            <h2 className="mt-4 text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl">Built for your room.<br className="hidden sm:block" /> Shipped to your door.</h2>
            <p className="mt-5 text-base leading-8 text-ink-soft">Every nook is made to the exact measurements of your space — then broken into flat panels that fit through any door and go up in a day.</p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: '01', icon: '📐', title: 'You design it', body: 'Enter your wall dimensions and openings. See it live in 3D before committing to a single piece.' },
              { n: '02', icon: '🪚', title: 'We build it', body: 'Your order goes to our shop. Every panel is cut to your exact measurements — no standard sizes, no filler strips.' },
              { n: '03', icon: '📦', title: 'Ships flat', body: 'Panels arrive flat-packed and labeled. No freight truck, no white-glove delivery fee — standard carrier to your door.' },
              { n: '04', icon: '🔧', title: 'You assemble', body: 'Step-by-step instructions and pre-fitted Lamello connectors — designed to go together with simple hand tools, no power drill.' },
            ].map(({ n, icon, title, body }) => (
              <div key={n} className="relative rounded-3xl border border-champagne/35 bg-[linear-gradient(180deg,#fffdf8,#f7f1e6)] p-7">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{icon}</span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brass">{n}</span>
                </div>
                <h3 className="mt-4 text-xl font-black tracking-tight text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-muted">{body}</p>
              </div>
            ))}
          </div>

          {/* Reassurance strip */}
          <div className="mt-10 flex flex-wrap justify-center gap-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            {['No contractor needed', 'No power tools', 'Shipping reviewed before order', 'Instructions included', 'Made in the USA 🇺🇸'].map((t) => (
              <span key={t} className="flex items-center gap-1.5"><span className="text-brass">✓</span>{t}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#f4eadb,#fffdf8)] px-6 py-24 text-center sm:px-10 lg:px-14"><p className="eyebrow text-brass">Ready when you are</p><h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-6xl">Start with one nook. Build toward a calmer home.</h2><button onClick={go} className="premium-button mt-9 px-9 py-4 text-sm">Begin your plan</button></section>
    </div>
  );
}

function MiniProject({ file, title }: { file: string; title: string }) { return <figure className="premium-card overflow-hidden p-3"><Img name={file} alt={title} label={title} className="aspect-[4/3] w-full rounded-[18px]" /><figcaption className="px-2 py-2 text-sm font-black tracking-tight">{title}</figcaption></figure>; }
function SystemCard({ file, title, copy }: { file: string; title: string; copy: string }) { return <figure className="group premium-card overflow-hidden p-3"><div className="overflow-hidden rounded-[18px] bg-parchment"><Img name={file} alt={title} label={title} className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-[1.035]" /></div><figcaption className="p-3"><div className="text-lg font-black tracking-tight">{title}</div><p className="mt-1 text-sm leading-6 text-ink-muted">{copy}</p></figcaption></figure>; }
