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

export type PresetCategory = 'Kids' | 'Entry' | 'Coffee' | 'Storage';

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
  },
  {
    id: 'montessori-tall',
    name: 'Montessori Tall Book Tower',
    category: 'Kids',
    blurb: 'A taller forward-facing tower for bigger collections — still scaled so kids reach the lower ledges.',
    highlights: ['28″ wide × 44″ tall', '4 display ledges', 'Soft white painted finish', 'Anti-tip wall strap included'],
    items: [{ type: 'montessori', patch: { overall: { width: 28, height: 44, depth: 9 }, shelvesPerSection: 4, materials: { carcass: 'sw-alabaster', doors: 'sw-alabaster', back: 'ply-back' }, label: 'Book Tower' } }],
    image: '/images/kids-book-tower.png',
  },
  {
    id: 'learning-tower',
    name: 'Montessori Learning Tower',
    category: 'Kids',
    blurb: 'A safe standing platform so your toddler can reach the counter and help in the kitchen. Easy to build, ships in a box.',
    highlights: ['Adjustable platform grows with your child', 'Enclosed back + front rail — anti-tip', 'Pre-finished birch, smooth rounded edges', 'Folds-flat option for storage'],
    items: [{ type: 'learning-tower', patch: { overall: { width: 16, height: 36, depth: 18 }, materials: { carcass: 'uv-ply-natural', doors: 'uv-ply-natural', back: 'ply-back' }, label: 'Learning Tower' } }],
    image: '/images/kids-learning-tower.png',
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
  },
  {
    id: 'toy-cubby-bench',
    name: 'Toy Cubby Bench',
    category: 'Kids',
    blurb: 'A low three-cubby bench sized for woven baskets — toy storage and a seat in one. Cushion-ready top.',
    highlights: ['Three open cubbies for baskets', 'Cushion-ready bench top', 'Pre-finished birch — wipes clean', 'One-piece, no doors to slam'],
    items: [{ type: 'base', patch: { overall: { width: 48, height: 18, depth: 15 }, sections: 3, shelvesPerSection: 0, door: 'none', toeKick: { enabled: false, height: 0 }, materials: { carcass: 'uv-ply-natural', doors: 'uv-ply-natural', back: 'ply-back' }, label: 'Cubby Bench' } }],
    image: '/images/kids-cubby-bench.png',
  },
  {
    id: 'montessori-play-nook',
    name: 'Montessori Play Nook',
    category: 'Kids',
    blurb: 'A low cubby base for baskets and toys with a forward-facing bookshelf beside it — a complete reading corner.',
    highlights: ['Low 3-cubby toy base, no doors', 'Matching forward-facing bookshelf', 'Everything at child height', 'White oak + soft white'],
    items: [
      { type: 'base', patch: { overall: { width: 48, height: 24, depth: 15 }, sections: 3, shelvesPerSection: 0, door: 'none', toeKick: { enabled: false, height: 0 }, materials: { carcass: 'white-oak', doors: 'sw-alabaster', back: 'ply-back' }, label: 'Toy Cubbies' } },
      { type: 'montessori', patch: { overall: { width: 30, height: 33, depth: 9 }, shelvesPerSection: 3, materials: { carcass: 'white-oak', doors: 'white-oak', back: 'ply-back' }, label: 'Bookshelf' } },
    ],
    image: '/images/kids-play-nook.png',
  },
  {
    id: 'mudroom-lockers',
    name: 'Mudroom Bench + Lockers',
    category: 'Entry',
    blurb: 'The classic drop zone: a seat bench flanked by a tall locker, with a shelf above for baskets and hooks.',
    highlights: ['60″ bench seat with storage', '24″ locker tower for coats', 'Display shelf above for baskets', 'Built in the USA, ships in pieces'],
    items: [
      { type: 'tall', patch: { overall: { width: 24, height: 84, depth: 18 }, label: 'Locker' } },
      { type: 'base', patch: { overall: { width: 60, height: 18, depth: 16 }, door: 'none', label: 'Bench' } },
      { type: 'shelf', patch: { overall: { width: 60, height: 1.5, depth: 10 }, mountHeight: 60, label: 'Top Shelf' } },
    ],
    image: '/images/product-mudroom.png',
  },
  {
    id: 'hall-tree',
    name: 'Entry Hall Tree',
    category: 'Entry',
    blurb: 'A single tidy piece for the entry: a bench to sit on, hooks for coats and bags, and a shelf above for baskets.',
    highlights: ['30″ wide × 66″ tall × 16″ deep', 'Bench seat + open cubby below', 'Coat hooks + upper basket shelf', 'White oak, ships flat'],
    items: [{ type: 'tall', patch: { overall: { width: 30, height: 66, depth: 16 }, sections: 1, shelvesPerSection: 2, door: 'none', toeKick: { enabled: true, height: 3 }, materials: { carcass: 'white-oak', doors: 'white-oak', back: 'ply-back' }, label: 'Hall Tree' } }],
    image: '/images/product-hall-tree.png',
  },
  {
    id: 'coffee-hutch',
    name: 'Coffee Bar Hutch',
    category: 'Coffee',
    blurb: 'Counter-height base for the machine, open shelves above for mugs and beans, finished back panel.',
    highlights: ['48″ counter-height base cabinet', 'Open display shelf for mugs', 'Wall upper for storage', 'Walnut + soft white'],
    items: [
      { type: 'base', patch: { overall: { width: 48, height: 34.5, depth: 20 }, materials: { carcass: 'sw-alabaster', doors: 'sw-alabaster', back: 'ply-back' }, label: 'Coffee Base' } },
      { type: 'shelf', patch: { overall: { width: 48, height: 1.5, depth: 10 }, mountHeight: 48, materials: { carcass: 'walnut', doors: 'walnut', back: 'walnut' }, label: 'Mug Shelf' } },
      { type: 'upper', patch: { overall: { width: 48, height: 24, depth: 12 }, mountHeight: 66, label: 'Upper' } },
    ],
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
  },
  {
    id: 'entry-console',
    name: 'Entryway Console',
    category: 'Entry',
    blurb: 'A slim open console for the entry or hallway — a landing spot for keys and mail up top, baskets and shoes on the shelf below.',
    highlights: ['48″ × 32″ tall × 12″ deep — fits tight halls', 'Open lower shelf for baskets', 'White oak, finished all around', 'Wall-anchored for stability'],
    items: [{ type: 'base', patch: { overall: { width: 48, height: 32, depth: 12 }, sections: 1, shelvesPerSection: 1, door: 'none', toeKick: { enabled: false, height: 0 }, materials: { carcass: 'white-oak', doors: 'white-oak', back: 'ply-back' }, label: 'Entry Console' } }],
    image: '/images/product-console.png',
  },
  {
    id: 'nightstand',
    name: 'Bedside Nightstand',
    category: 'Storage',
    blurb: 'A compact open nightstand sized for real beds — a shelf for books and a spot on top for a lamp and your phone. Order one or a matching pair.',
    highlights: ['18″ × 24″ tall × 16″ deep', 'Open shelf — no drawer to stick', 'Walnut or white oak', 'Ships in one box, assembles in minutes'],
    items: [{ type: 'base', patch: { overall: { width: 18, height: 24, depth: 16 }, sections: 1, shelvesPerSection: 1, door: 'none', toeKick: { enabled: false, height: 0 }, materials: { carcass: 'walnut', doors: 'walnut', back: 'ply-back' }, label: 'Nightstand' } }],
    image: '/images/product-nightstand.png',
  },
  {
    id: 'coffee-station',
    name: 'Compact Coffee Station',
    category: 'Coffee',
    blurb: 'A counter-height base for the machine and a single open shelf above for mugs and beans — the coffee bar for smaller kitchens and offices.',
    highlights: ['36″ counter-height base cabinet', 'Open mug shelf above', 'White oak + soft white', 'Finished back — stands anywhere'],
    items: [
      { type: 'base', patch: { overall: { width: 36, height: 34.5, depth: 18 }, materials: { carcass: 'sw-alabaster', doors: 'sw-alabaster', back: 'ply-back' }, label: 'Coffee Base' } },
      { type: 'shelf', patch: { overall: { width: 36, height: 2, depth: 9 }, mountHeight: 50, materials: { carcass: 'white-oak', doors: 'white-oak', back: 'white-oak' }, label: 'Mug Shelf' } },
    ],
    image: '/images/product-coffee.png',
  },
  {
    id: 'coffee-cabinet',
    name: 'Coffee Wall Cabinet',
    category: 'Coffee',
    blurb: 'A two-door wall cabinet to hang above your coffee station — mugs, beans, filters, and supplies tucked away behind clean fronts.',
    highlights: ['30″ wide × 24″ tall × 12″ deep', 'Two doors, two shelves', 'Soft-close hinges', 'White oak or painted'],
    items: [{ type: 'upper', patch: { overall: { width: 30, height: 24, depth: 12 }, sections: 1, shelvesPerSection: 2, door: 'double', materials: { carcass: 'white-oak', doors: 'white-oak', back: 'ply-back' }, label: 'Coffee Cabinet' } }],
    image: '/images/product-coffee-cabinet.png',
  },
  {
    id: 'shoe-bench',
    name: 'Entry Shoe Bench',
    category: 'Entry',
    blurb: 'A low bench to sit and pull on shoes, with two open shelves underneath for everyday pairs and a basket.',
    highlights: ['36″ × 18″ tall × 15″ deep', 'Two open shoe shelves', 'Cushion-ready top', 'White oak — wipes clean'],
    items: [{ type: 'base', patch: { overall: { width: 36, height: 18, depth: 15 }, sections: 1, shelvesPerSection: 2, door: 'none', toeKick: { enabled: false, height: 0 }, materials: { carcass: 'white-oak', doors: 'white-oak', back: 'ply-back' }, label: 'Shoe Bench' } }],
    image: '/images/product-shoe-bench.png',
  },
  {
    id: 'media-console',
    name: 'Media Console',
    category: 'Storage',
    blurb: 'A low TV console with cabinet doors on the ends for gear and an open center for a soundbar, books, and decor.',
    highlights: ['60″ × 24″ tall × 18″ deep', 'Two door cabinets + open center', 'Cord pass-throughs', 'White oak, ships flat'],
    items: [{ type: 'base', patch: { overall: { width: 60, height: 24, depth: 18 }, sections: 2, shelvesPerSection: 1, door: 'double', toeKick: { enabled: true, height: 3 }, materials: { carcass: 'white-oak', doors: 'white-oak', back: 'ply-back' }, label: 'Media Console' } }],
    image: '/images/product-media-console.png',
  },
  {
    id: 'bookcase',
    name: 'Narrow Bookcase',
    category: 'Storage',
    blurb: 'A tall, slim open bookcase for books, plants, and display — fits the gaps a wide shelf can’t.',
    highlights: ['24″ × 72″ tall × 12″ deep', 'Five adjustable shelves', 'Walnut or white oak', 'Anti-tip wall strap included'],
    items: [{ type: 'tall', patch: { overall: { width: 24, height: 72, depth: 12 }, sections: 1, shelvesPerSection: 5, door: 'none', toeKick: { enabled: true, height: 3 }, materials: { carcass: 'walnut', doors: 'walnut', back: 'ply-back' }, label: 'Bookcase' } }],
    image: '/images/product-bookcase.png',
  },
  {
    id: 'toy-bench',
    name: 'Toy Box Bench',
    category: 'Kids',
    blurb: 'A big open toy box you can also sit on — drop the toys in, put the cushion on top, done. No drawers to pinch fingers.',
    highlights: ['36″ × 18″ tall × 16″ deep', 'One large open bin', 'Soft-close lid option', 'Soft white painted, rounded edges'],
    items: [{ type: 'base', patch: { overall: { width: 36, height: 18, depth: 16 }, sections: 1, shelvesPerSection: 0, door: 'none', toeKick: { enabled: false, height: 0 }, materials: { carcass: 'sw-alabaster', doors: 'sw-alabaster', back: 'ply-back' }, label: 'Toy Bench' } }],
    image: '/images/product-toy-bench.png',
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
