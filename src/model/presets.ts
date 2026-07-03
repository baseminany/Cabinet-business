// =============================================================================
// PRE-BUILT PRODUCTS — ready-to-order, fully-configured designs
// =============================================================================
// Each preset is a finished product spec: one or more units with real sizes and
// finishes already chosen. Customers can order one as-is, or load it into the
// planner to customize. Prices are computed live from the same pricing engine
// the planner uses, so "from $X" is never a made-up number.
// =============================================================================

import type { Unit, UnitType } from './types';
import { makeUnit } from './catalog';
import { buildProject } from './buildParts';
import { priceModel } from '../pricing/engine';

export type PresetCategory = 'Kids' | 'Entry' | 'Coffee' | 'Laundry' | 'Storage' | 'Decor';

export interface PresetItem {
  type: UnitType;
  patch?: Partial<Pick<Unit, 'overall' | 'materials' | 'shelvesPerSection' | 'sections' | 'door' | 'toeKick' | 'label' | 'mountHeight'>>;
}

export interface PresetSpec {
  id: string;
  name: string;
  category: PresetCategory;
  blurb: string;
  /** Short list of what's included / why it's good. */
  highlights: string[];
  items: PresetItem[];
  /** Optional real product photo (path under /images). Falls back to a sketch. */
  image?: string;
  /** Extra gallery photos for the product page (finish variants, angles). */
  images?: string[];
  /** Customer width customization, bounded so the MAX still cuts from the same
   *  sheet allowance as the default (never spills into an extra sheet run).
   *  Customers can size DOWN to the inch freely; price scales either way. */
  widthRange?: { min: number; max: number };
}

export const PRESETS: PresetSpec[] = [
  {
    id: 'montessori-bookshelf',
    name: 'Montessori Forward-Facing Bookshelf',
    category: 'Kids',
    blurb: 'Child-height shelf that displays book covers face-out so little ones can choose and reshelve on their own.',
    highlights: ['30″ wide × 33″ tall — toddler reach', '3 display ledges with safety book rails', 'Natural white oak, rounded edges', 'Cuts from a single plywood sheet'],
    items: [{ type: 'montessori', patch: { overall: { width: 30, height: 33, depth: 9 }, shelvesPerSection: 3, materials: { carcass: 'white-oak', doors: 'white-oak', back: 'ply-back' }, label: 'Montessori Bookshelf' } }],
    image: '/images/kids-montessori-bookshelf.png',
    images: ['/images/kids-montessori-bookshelf.png', '/images/kids-montessori-bookshelf-sage.png'],
    widthRange: { min: 24, max: 48 },
  },
  {
    id: 'learning-tower',
    name: 'Montessori Learning Tower',
    category: 'Kids',
    blurb: 'A standing platform that lets your toddler reach the counter and help in the kitchen. Solid birch, ships in a box.',
    highlights: ['Adjustable platform height', 'Enclosed back panel + front rail', 'Solid 3/4″ birch, rounded edges', 'Housed-joint construction with a base stretcher'],
    items: [{ type: 'learning-tower', patch: { overall: { width: 16, height: 36, depth: 18 }, materials: { carcass: 'uv-ply-natural', doors: 'uv-ply-natural', back: 'ply-back' }, label: 'Learning Tower' } }],
    image: '/images/kids-learning-tower.png',
    widthRange: { min: 15, max: 20 },
  },
  {
    id: 'book-ledges',
    name: 'Forward-Facing Book Ledges (Set of 3)',
    category: 'Kids',
    blurb: 'Three wall-mounted ledges that show book covers face-out. The simplest way to add a reading corner to any wall.',
    highlights: ['Three 30″ ledges with a front lip', 'Wall-mounts at child height', 'White oak — warm and durable', 'Ships flat in one small box'],
    items: [
      { type: 'shelf', patch: { overall: { width: 30, height: 2.5, depth: 5 }, mountHeight: 28, materials: { carcass: 'white-oak', doors: 'white-oak', back: 'white-oak' }, label: 'Book Ledge 1' } },
      { type: 'shelf', patch: { overall: { width: 30, height: 2.5, depth: 5 }, mountHeight: 40, materials: { carcass: 'white-oak', doors: 'white-oak', back: 'white-oak' }, label: 'Book Ledge 2' } },
      { type: 'shelf', patch: { overall: { width: 30, height: 2.5, depth: 5 }, mountHeight: 52, materials: { carcass: 'white-oak', doors: 'white-oak', back: 'white-oak' }, label: 'Book Ledge 3' } },
    ],
    image: '/images/kids-book-ledges.png',
    widthRange: { min: 18, max: 32 },
  },
  {
    id: 'toy-cubby-bench',
    name: 'Toy Cubby Bench',
    category: 'Kids',
    blurb: 'A low three-cubby bench sized for woven baskets — toy storage and a seat in one. Cushion-ready top.',
    highlights: ['Three open cubbies for baskets', 'Cushion-ready bench top', 'Pre-finished birch — wipes clean', 'One-piece, no doors to slam'],
    items: [{ type: 'base', patch: { overall: { width: 48, height: 18, depth: 15 }, sections: 3, shelvesPerSection: 0, door: 'none', toeKick: { enabled: false, height: 0 }, materials: { carcass: 'uv-ply-natural', doors: 'uv-ply-natural', back: 'ply-back' }, label: 'Cubby Bench' } }],
    image: '/images/kids-cubby-bench.png',
    widthRange: { min: 30, max: 72 },
  },
  {
    id: 'entry-rail-shelf',
    name: 'Entry Hook Rail + Shelf',
    category: 'Entry',
    blurb: 'A slim wall shelf for keys and a plant, with a row of matte-black hooks below for coats and bags. The one-hour entry upgrade.',
    highlights: ['36″ oak shelf with a solid front edge', 'Five matte-black hooks (in the hardware bag)', 'Mounts to studs — holds real coats', 'Ships in one small box'],
    items: [{ type: 'shelf', patch: { overall: { width: 36, height: 2.5, depth: 6 }, mountHeight: 64, materials: { carcass: 'white-oak', doors: 'white-oak', back: 'white-oak' }, label: 'Entry Rail Shelf' } }],
    image: '/images/product-entry-rail.png',
    widthRange: { min: 24, max: 48 },
  },
  {
    id: 'mail-organizer',
    name: 'Mail + Key Organizer',
    category: 'Entry',
    blurb: 'A small wall box by the door: a slot for mail, a shelf for sunglasses and wallets, and key hooks underneath. Never lose your keys again.',
    highlights: ['16″ × 12″ wall box with divider shelf', 'Four key hooks (in the hardware bag)', 'White oak, finished all around', 'Mounts with two screws into a stud'],
    items: [{ type: 'upper', patch: { overall: { width: 16, height: 12, depth: 5 }, sections: 1, shelvesPerSection: 1, door: 'none', mountHeight: 58, materials: { carcass: 'white-oak', doors: 'white-oak', back: 'ply-back' }, label: 'Mail Organizer' } }],
    image: '/images/product-mail-organizer.png',
    widthRange: { min: 12, max: 20 },
  },
  {
    id: 'floating-shelves',
    name: 'Floating Wall Shelves (Set of 3)',
    category: 'Storage',
    blurb: 'Three clean solid-wood ledges for the living room, office, or hallway — books, plants, frames, and everyday display.',
    highlights: ['Three 36″ × 8″ deep solid shelves', 'Hidden bracket — floats off the wall', 'Walnut or white oak', 'Ships flat in one small box'],
    items: [
      { type: 'shelf', patch: { overall: { width: 36, height: 2, depth: 8 }, mountHeight: 30, materials: { carcass: 'walnut', doors: 'walnut', back: 'walnut' }, label: 'Floating Shelf 1' } },
      { type: 'shelf', patch: { overall: { width: 36, height: 2, depth: 8 }, mountHeight: 44, materials: { carcass: 'walnut', doors: 'walnut', back: 'walnut' }, label: 'Floating Shelf 2' } },
      { type: 'shelf', patch: { overall: { width: 36, height: 2, depth: 8 }, mountHeight: 58, materials: { carcass: 'walnut', doors: 'walnut', back: 'walnut' }, label: 'Floating Shelf 3' } },
    ],
    image: '/images/product-floating-shelves.png',
    widthRange: { min: 24, max: 48 },
  },
  {
    id: 'entry-console',
    name: 'Entryway Console',
    category: 'Entry',
    blurb: 'A slim open console for the entry or hallway — a landing spot for keys and mail up top, baskets and shoes on the shelf below.',
    highlights: ['48″ × 32″ tall × 12″ deep — fits tight halls', 'Open lower shelf for baskets', 'White oak, finished all around', 'Wall-anchored for stability'],
    items: [{ type: 'base', patch: { overall: { width: 48, height: 32, depth: 12 }, sections: 1, shelvesPerSection: 1, door: 'none', toeKick: { enabled: false, height: 0 }, materials: { carcass: 'white-oak', doors: 'white-oak', back: 'ply-back' }, label: 'Entry Console' } }],
    image: '/images/product-console.png',
    widthRange: { min: 30, max: 72 },
  },
  {
    id: 'nightstand',
    name: 'Bedside Nightstand',
    category: 'Storage',
    blurb: 'A compact open nightstand sized for real beds — a shelf for books and a spot on top for a lamp and your phone. Order one or a matching pair.',
    highlights: ['18″ × 24″ tall × 16″ deep', 'Open shelf — no drawer to stick', 'Walnut or white oak', 'Ships in one box, assembles in minutes'],
    items: [{ type: 'base', patch: { overall: { width: 18, height: 24, depth: 16 }, sections: 1, shelvesPerSection: 1, door: 'none', toeKick: { enabled: false, height: 0 }, materials: { carcass: 'walnut', doors: 'walnut', back: 'ply-back' }, label: 'Nightstand' } }],
    image: '/images/product-nightstand.png',
    widthRange: { min: 14, max: 30 },
  },
  {
    id: 'coffee-open-station',
    name: 'Open Coffee Station',
    category: 'Coffee',
    blurb: 'A counter-height open station: the machine lives on top, mugs, beans, and gear sit in two open bays below. No doors — grab and go.',
    highlights: ['36″ counter-height, open bays', 'No doors — everything in reach', 'White oak, finished all around', 'Fast to build, fast to ship'],
    items: [{ type: 'base', patch: { overall: { width: 36, height: 34.5, depth: 18 }, sections: 2, shelvesPerSection: 1, door: 'none', toeKick: { enabled: true, height: 3 }, materials: { carcass: 'white-oak', doors: 'white-oak', back: 'ply-back' }, label: 'Coffee Station' } }],
    image: '/images/product-coffee-open.png',
    widthRange: { min: 28, max: 48 },
  },
  {
    id: 'coffee-shelf-set',
    name: 'Coffee Wall Shelf Set',
    category: 'Coffee',
    blurb: 'Two solid walnut shelves for above the coffee counter — mugs on one, beans and gear on the other. The one-morning coffee corner.',
    highlights: ['Two 30″ × 8″ deep shelves', 'Hidden brackets — clean float', 'Walnut or white oak', 'Ships in one small box'],
    items: [
      { type: 'shelf', patch: { overall: { width: 30, height: 2, depth: 8 }, mountHeight: 50, materials: { carcass: 'walnut', doors: 'walnut', back: 'walnut' }, label: 'Coffee Shelf 1' } },
      { type: 'shelf', patch: { overall: { width: 30, height: 2, depth: 8 }, mountHeight: 64, materials: { carcass: 'walnut', doors: 'walnut', back: 'walnut' }, label: 'Coffee Shelf 2' } },
    ],
    image: '/images/product-coffee-shelves.png',
    widthRange: { min: 20, max: 40 },
  },
  {
    id: 'mug-rack',
    name: 'Mug Rack Shelf',
    category: 'Coffee',
    blurb: 'A small oak shelf with a row of hooks below — your favorite mugs on display, beans and a plant up top. The 10-minute coffee corner.',
    highlights: ['24″ shelf + five mug hooks', 'Hooks in the hardware bag — no screws into wood', 'White oak or walnut', 'Ships in one small box'],
    items: [{ type: 'shelf', patch: { overall: { width: 24, height: 2, depth: 6 }, mountHeight: 54, materials: { carcass: 'white-oak', doors: 'white-oak', back: 'white-oak' }, label: 'Mug Rack' } }],
    image: '/images/product-mug-rack.png',
    widthRange: { min: 18, max: 36 },
  },
  {
    id: 'counter-riser',
    name: 'Coffee Counter Riser',
    category: 'Coffee',
    blurb: 'A low riser that lifts the machine and jars onto their own stage — and tucks a tray, filters, or a scale in the open bay below.',
    highlights: ['28″ × 7″ tall × 11″ deep', 'Open bay below for trays + filters', 'Sits on any counter — no mounting', 'Built from premium offcuts — priced to match'],
    items: [{ type: 'base', patch: { overall: { width: 28, height: 7, depth: 11 }, sections: 1, shelvesPerSection: 0, door: 'none', toeKick: { enabled: false, height: 0 }, materials: { carcass: 'white-oak', doors: 'white-oak', back: 'ply-back' }, label: 'Counter Riser' } }],
    image: '/images/product-counter-riser.png',
    widthRange: { min: 18, max: 36 },
  },
  {
    id: 'shoe-bench',
    name: 'Entry Shoe Bench',
    category: 'Entry',
    blurb: 'A low bench to sit and pull on shoes, with two open shelves underneath for everyday pairs and a basket.',
    highlights: ['36″ × 18″ tall × 15″ deep', 'Two open shoe shelves', 'Cushion-ready top', 'White oak — wipes clean'],
    items: [{ type: 'base', patch: { overall: { width: 36, height: 18, depth: 15 }, sections: 1, shelvesPerSection: 2, door: 'none', toeKick: { enabled: false, height: 0 }, materials: { carcass: 'white-oak', doors: 'white-oak', back: 'ply-back' }, label: 'Shoe Bench' } }],
    image: '/images/product-shoe-bench.png',
    widthRange: { min: 24, max: 48 },
  },
  {
    id: 'media-console-open',
    name: 'Open Media Console',
    category: 'Storage',
    blurb: 'A low open console for the TV wall — three clean bays for the soundbar, consoles, books, and decor. No doors, no hinges, no fuss.',
    highlights: ['60″ × 20″ tall × 16″ deep', 'Three open bays, cords drop behind', 'White oak or walnut', 'Sized to the inch up to 94″'],
    items: [{ type: 'base', patch: { overall: { width: 60, height: 20, depth: 16 }, sections: 3, shelvesPerSection: 0, door: 'none', toeKick: { enabled: true, height: 3 }, materials: { carcass: 'white-oak', doors: 'white-oak', back: 'ply-back' }, label: 'Media Console' } }],
    image: '/images/product-media-open.png',
    widthRange: { min: 40, max: 94 },
  },
  {
    id: 'bookcase',
    name: 'Narrow Bookcase',
    category: 'Storage',
    blurb: 'A tall, slim open bookcase for books, plants, and display — fits the gaps a wide shelf can’t.',
    highlights: ['24″ × 72″ tall × 12″ deep', 'Five adjustable shelves', 'Walnut or white oak', 'Anti-tip wall strap included'],
    items: [{ type: 'tall', patch: { overall: { width: 24, height: 72, depth: 12 }, sections: 1, shelvesPerSection: 5, door: 'none', toeKick: { enabled: true, height: 3 }, materials: { carcass: 'walnut', doors: 'walnut', back: 'ply-back' }, label: 'Bookcase' } }],
    image: '/images/product-bookcase.png',
    widthRange: { min: 18, max: 36 },
  },
  {
    id: 'toy-bench',
    name: 'Toy Box Bench',
    category: 'Kids',
    blurb: 'A big open toy box you can also sit on — drop the toys in, put the cushion on top, done. No drawers to pinch fingers.',
    highlights: ['36″ × 18″ tall × 16″ deep', 'One large open bin', 'Soft-close lid option', 'Soft white painted, rounded edges'],
    items: [{ type: 'base', patch: { overall: { width: 36, height: 18, depth: 16 }, sections: 1, shelvesPerSection: 0, door: 'none', toeKick: { enabled: false, height: 0 }, materials: { carcass: 'sw-alabaster', doors: 'sw-alabaster', back: 'ply-back' }, label: 'Toy Bench' } }],
    image: '/images/product-toy-bench.png',
    widthRange: { min: 24, max: 48 },
  },
  {
    id: 'step-stool',
    name: 'Toddler Step Stool',
    category: 'Kids',
    blurb: 'A sturdy two-step stool so little ones can reach the sink and counter on their own. The easiest add-on gift.',
    highlights: ['16″ × 14″ tall × 12″ deep', 'Two steps, rounded edges', 'Pre-finished birch — wipes clean', 'Ships in one small box'],
    items: [{ type: 'base', patch: { overall: { width: 16, height: 14, depth: 12 }, sections: 1, shelvesPerSection: 1, door: 'none', toeKick: { enabled: false, height: 0 }, materials: { carcass: 'uv-ply-natural', doors: 'uv-ply-natural', back: 'ply-back' }, label: 'Step Stool' } }],
    image: '/images/product-step-stool.png',
  },
  {
    id: 'reading-bench',
    name: 'Window Reading Bench',
    category: 'Storage',
    blurb: 'A simple cushion-ready bench with cubbies below — perfect under a window or in a hallway nook.',
    highlights: ['54″ bench, cushion-ready top', '3 open cubbies for baskets', 'White oak natural', 'One-piece, ships assembled-ready'],
    items: [{ type: 'base', patch: { overall: { width: 54, height: 18, depth: 16 }, sections: 3, shelvesPerSection: 0, door: 'none', toeKick: { enabled: true, height: 3 }, materials: { carcass: 'white-oak', doors: 'white-oak', back: 'ply-back' }, label: 'Reading Bench' } }],
    image: '/images/product-reading-bench.png',
    widthRange: { min: 36, max: 94 },
  },
  {
    id: 'laundry-tower',
    name: 'Laundry Shelf Tower',
    category: 'Laundry',
    blurb: 'A tall open shelving tower beside the machines — detergent, towels, and baskets all in reach. Pre-finished so it wipes clean.',
    highlights: ['24″ × 72″ tall × 16″ deep', 'Four adjustable shelves', 'Pre-finished birch — wipes clean', 'Anti-tip wall strap included'],
    items: [{ type: 'tall', patch: { overall: { width: 24, height: 72, depth: 16 }, sections: 1, shelvesPerSection: 4, door: 'none', toeKick: { enabled: true, height: 3 }, materials: { carcass: 'uv-ply-natural', doors: 'uv-ply-natural', back: 'ply-back' }, label: 'Laundry Tower' } }],
    image: '/images/product-laundry-tower.png',
    widthRange: { min: 18, max: 30 },
  },
  {
    id: 'laundry-shelf',
    name: 'Over-Machine Shelf',
    category: 'Laundry',
    blurb: 'One long, deep shelf that spans above the washer and dryer — detergent, baskets, and towels off the machines and out of the way.',
    highlights: ['60″ × 12″ deep — spans both machines', 'Hidden heavy-duty brackets', 'White oak or pre-finished birch', 'The single best laundry upgrade'],
    items: [{ type: 'shelf', patch: { overall: { width: 60, height: 2, depth: 12 }, mountHeight: 76, materials: { carcass: 'white-oak', doors: 'white-oak', back: 'white-oak' }, label: 'Over-Machine Shelf' } }],
    image: '/images/product-laundry-shelf.png',
    widthRange: { min: 40, max: 94 },
  },
  {
    id: 'hamper-bench',
    name: 'Hamper Bench',
    category: 'Laundry',
    blurb: 'Two open bays sized for laundry baskets, with a folding-height top. Sort below, fold on top — one piece, no doors.',
    highlights: ['40″ × 20″ tall — two basket bays', 'Flat top for folding', 'Pre-finished birch — wipes clean', 'No doors, no hardware to break'],
    items: [{ type: 'base', patch: { overall: { width: 40, height: 20, depth: 18 }, sections: 2, shelvesPerSection: 0, door: 'none', toeKick: { enabled: false, height: 0 }, materials: { carcass: 'uv-ply-natural', doors: 'uv-ply-natural', back: 'ply-back' }, label: 'Hamper Bench' } }],
    image: '/images/product-hamper-bench.png',
    widthRange: { min: 32, max: 48 },
  },
  {
    id: 'drying-rail',
    name: 'Drying Rail + Shelf',
    category: 'Laundry',
    blurb: 'A wall shelf with a hanging rod below — air-dry shirts straight from the machine, supplies up top. Saves a drying rack\'s floor space.',
    highlights: ['36″ shelf + hanging rod below', 'Rod + brackets in the hardware bag', 'Mounts to studs — holds wet laundry', 'White oak, sealed for humidity'],
    items: [{ type: 'shelf', patch: { overall: { width: 36, height: 2, depth: 10 }, mountHeight: 68, materials: { carcass: 'white-oak', doors: 'white-oak', back: 'white-oak' }, label: 'Drying Rail' } }],
    image: '/images/product-drying-rail.png',
    widthRange: { min: 24, max: 48 },
  },
  {
    id: 'art-ledges',
    name: 'Art Ledge Set (Set of 3)',
    category: 'Decor',
    blurb: 'Three narrow picture ledges for any blank wall — lean frames, prints, and small plants, and swap them whenever you like. Gallery wall, no nail holes in your art.',
    highlights: ['Three 36″ × 4″ ledges with a front lip', 'Layer frames — no hanging hardware per piece', 'Walnut or white oak', 'Ships flat in one small box'],
    items: [
      { type: 'shelf', patch: { overall: { width: 36, height: 2, depth: 4 }, mountHeight: 40, materials: { carcass: 'walnut', doors: 'walnut', back: 'walnut' }, label: 'Art Ledge 1' } },
      { type: 'shelf', patch: { overall: { width: 36, height: 2, depth: 4 }, mountHeight: 52, materials: { carcass: 'walnut', doors: 'walnut', back: 'walnut' }, label: 'Art Ledge 2' } },
      { type: 'shelf', patch: { overall: { width: 36, height: 2, depth: 4 }, mountHeight: 64, materials: { carcass: 'walnut', doors: 'walnut', back: 'walnut' }, label: 'Art Ledge 3' } },
    ],
    image: '/images/product-art-ledges.png',
    widthRange: { min: 24, max: 48 },
  },
  {
    id: 'wall-boxes',
    name: 'Wall Display Boxes (Set of 3)',
    category: 'Decor',
    blurb: 'Three open oak boxes that mount in a staggered cluster — plants, candles, and ceramics get a stage instead of a shelf.',
    highlights: ['Three 14″ × 14″ × 6″ open boxes', 'Arrange them any way you like', 'White oak, finished inside and out', 'Keyhole mounts — no visible hardware'],
    items: [
      { type: 'upper', patch: { overall: { width: 14, height: 14, depth: 6 }, sections: 1, shelvesPerSection: 0, door: 'none', mountHeight: 42, materials: { carcass: 'white-oak', doors: 'white-oak', back: 'ply-back' }, label: 'Display Box 1' } },
      { type: 'upper', patch: { overall: { width: 14, height: 14, depth: 6 }, sections: 1, shelvesPerSection: 0, door: 'none', mountHeight: 56, materials: { carcass: 'white-oak', doors: 'white-oak', back: 'ply-back' }, label: 'Display Box 2' } },
      { type: 'upper', patch: { overall: { width: 14, height: 14, depth: 6 }, sections: 1, shelvesPerSection: 0, door: 'none', mountHeight: 48, materials: { carcass: 'white-oak', doors: 'white-oak', back: 'ply-back' }, label: 'Display Box 3' } },
    ],
    image: '/images/product-wall-boxes.png',
    widthRange: { min: 10, max: 18 },
  },
  {
    id: 'monitor-riser',
    name: 'Monitor Riser',
    category: 'Decor',
    blurb: 'Lift the monitor to eye level and slide the keyboard underneath at the end of the day. The desk suddenly looks intentional.',
    highlights: ['24″ × 5″ tall × 9″ deep', 'Keyboard tucks in the open bay', 'White oak or walnut', 'Built from premium offcuts — priced to match'],
    items: [{ type: 'base', patch: { overall: { width: 24, height: 5, depth: 9 }, sections: 1, shelvesPerSection: 0, door: 'none', toeKick: { enabled: false, height: 0 }, materials: { carcass: 'white-oak', doors: 'white-oak', back: 'ply-back' }, label: 'Monitor Riser' } }],
    image: '/images/product-monitor-riser.png',
    widthRange: { min: 20, max: 36 },
  },
];

/** Build real Unit objects from a preset spec (fresh ids each call). */
export function instantiatePreset(spec: PresetSpec): Unit[] {
  return spec.items.map((item) => {
    const u = makeUnit(item.type);
    if (item.patch) {
      const p = item.patch;
      if (p.overall) u.overall = { ...u.overall, ...p.overall };
      if (p.materials) u.materials = { ...u.materials, ...p.materials };
      if (p.toeKick) u.toeKick = { ...u.toeKick, ...p.toeKick };
      if (p.sections != null) u.sections = p.sections;
      if (p.shelvesPerSection != null) u.shelvesPerSection = p.shelvesPerSection;
      if (p.door != null) u.door = p.door;
      if (p.mountHeight != null) u.mountHeight = p.mountHeight;
      if (p.label) u.label = p.label;
    }
    return u;
  });
}

/** "From" price for a preset, using the same engine as the planner. */
export function presetPrice(spec: PresetSpec): number {
  const units = instantiatePreset(spec);
  return priceModel(buildProject(units)).customerPrice;
}
