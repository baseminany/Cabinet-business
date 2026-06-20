// =============================================================================
// SKETCHUP RUBY EXPORT (OpenCutList-friendly)
// =============================================================================
// Generates a .rb script you can paste into SketchUp's Ruby Console (or save as
// a file and load). It rebuilds the cabinet as named component instances with
// tags + materials, ready for OpenCutList, and prints a validation report —
// following the shop conventions in the master prompt.
//
// Coordinate mapping (this app → SketchUp):
//   app x (left→right)  → SU x (red)
//   app z (back→front)  → SU y (green)
//   app y (floor→up)    → SU z (blue, up)
// Dimensions are emitted in inches via `.inch`.
// =============================================================================

import type { BuiltUnit, Part, Unit } from '../model/types';
import { getMaterial } from '../model/materials';
import { pricing } from '../pricing/pricing.config';

const MODULE = 'StudioCabinet_V1';
const MASTER = 'STUDIO_Cabinet_A';

/** Tag (SketchUp layer) for each part role, per the naming conventions. */
function tagFor(role: Part['role']): string {
  switch (role) {
    case 'door':
      return 'Doors_Fronts';
    case 'back':
      return 'Backs';
    case 'shelf':
      return 'Shelves';
    case 'toekick':
      return 'Trim_ToeKick';
    case 'divider':
    case 'side':
    case 'top':
    case 'bottom':
    default:
      return 'Carcasses';
  }
}

/** OCL instance name, e.g. CAB_A_SideL, CAB_A_Shelf_3. */
// Instance name from the (unit-namespaced) part name, e.g. "Base 1 · Side (Left)"
// → "Base_1_Side_Left". Keeps each unit's parts distinct in the model tree.
function instanceName(part: Part): string {
  return part.name.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(',');
}

function r3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

interface RubyPart {
  defKey: string;
  defName: string;
  instName: string;
  tag: string;
  matKey: string;
  // SketchUp dimensions + center (inches)
  sx: number;
  sy: number;
  sz: number;
  cx: number;
  cy: number;
  cz: number;
}

export function cabinetRubyScript(units: Unit[], built: BuiltUnit): string {
  const rubyParts: RubyPart[] = [];
  const matKeys = new Set<string>();

  for (const part of built.parts) {
    const sx = r3(part.size3d.w);
    const sy = r3(part.size3d.d);
    const sz = r3(part.size3d.h);
    const cx = r3(part.position.x);
    const cy = r3(part.position.z);
    const cz = r3(part.position.y);
    const tag = tagFor(part.role);
    // Definition is reused across identical parts → OCL counts quantity.
    const defKey = `${part.name}|${part.material}|${sx}x${sy}x${sz}|${tag}`;
    const defName = `${part.name} ${part.length}x${part.width}x${part.thickness}`.replace(/"/g, 'in');
    matKeys.add(part.material);
    rubyParts.push({
      defKey,
      defName,
      instName: instanceName(part),
      tag,
      matKey: part.material,
      sx,
      sy,
      sz,
      cx,
      cy,
      cz,
    });
  }

  // Material table: id → [display name, "r,g,b"]
  const materialRows = [...matKeys].map((id) => {
    const m = getMaterial(id);
    const note = pricing.materials[id]?.note ?? m.label;
    return `    "${id}" => ["${note.replace(/"/g, "'")}", [${hexToRgb(m.color)}]],`;
  });

  const tagSet = [...new Set(rubyParts.map((p) => p.tag))];
  // Plus the tags we reserve for future/site/reference parts.
  const allTags = [...new Set([...tagSet, 'Trim', 'Environment', 'Site', 'Reference'])];

  const partRows = rubyParts.map(
    (p) =>
      `    {def: "${p.defKey}", dname: "${p.defName}", name: "${p.instName}", tag: "${p.tag}", mat: "${p.matKey}", ` +
      `w: ${p.sx}, d: ${p.sy}, h: ${p.sz}, cx: ${p.cx}, cy: ${p.cy}, cz: ${p.cz}},`
  );

  // ---- Validation report (computed here, printed by the script) ----
  const doors = built.parts.filter((d) => d.role === 'door');
  const reportLines: string[] = [];
  reportLines.push(`Project: ${units.length} unit(s)`);
  units.forEach((u) => reportLines.push(`  ${u.label} [${u.type}]: ${u.overall.width} W x ${u.overall.height} H x ${u.overall.depth} D in`));
  reportLines.push(`Totals: ${doors.length} doors, ${built.parts.filter((p) => p.role === 'shelf').length} shelves`);
  reportLines.push(`Hardware: ${built.hardware.hinges} hinges, ${built.hardware.pulls} pulls, ${built.hardware.shelfPins} shelf pins`);
  const painted = (id: string) => id.startsWith('painted');
  doors.forEach((d, i) => {
    const rec = d.length >= 50 ? 4 : d.length >= 40 ? 3 : 2;
    let msg = `Door ${i + 1}: ${r3(d.length)}" tall -> ${rec} hinges`;
    if (d.length >= 50 && painted(d.material)) msg += '  [WARN: tall painted slab — balance finish, store flat, watch for bow]';
    if (d.width >= 24 && painted(d.material)) msg += '  [WARN: wide painted slab — warp risk]';
    reportLines.push(msg);
  });
  reportLines.push('Backs are 1/4" for squareness (cut later for plumbing if needed).');
  reportLines.push('TBD/site parts not yet in model: wall fillers, scribes, toe-kick levelers, crown/scribe-to-ceiling, reference countertop.');

  const reportPuts = reportLines.map((l) => `  puts "  ${l.replace(/"/g, "'")}"`).join('\n');

  // ---------------------------------------------------------------------------
  // The generated Ruby script. (Ruby uses #{} for interpolation — no clash with
  // this file's ${} template literals.)
  // ---------------------------------------------------------------------------
  return `# =============================================================================
# ${MASTER} — generated by Studio (cabinet configurator)
# Paste into SketchUp's Ruby Console, or save as a .rb and use Plugins > load.
# Idempotent: re-running removes the previous "${MASTER}" group and rebuilds.
# OpenCutList: parts are component instances with tags + materials.
# =============================================================================
module ${MODULE}
  MASTER_NAME = "${MASTER}"

  MATERIALS = {
${materialRows.join('\n')}
  }

  TAGS = [${allTags.map((t) => `"${t}"`).join(', ')}]

  PARTS = [
${partRows.join('\n')}
  ]

  def self.ensure_material(model, id)
    name, rgb = MATERIALS[id]
    name ||= id
    m = model.materials[name] || model.materials.add(name)
    m.color = Sketchup::Color.new(rgb[0], rgb[1], rgb[2]) if rgb
    m
  end

  def self.get_def(model, cache, key, dname, w, d, h)
    return cache[key] if cache[key]
    defn = model.definitions.add(dname)
    ents = defn.entities
    f = ents.add_face([0, 0, 0], [w.inch, 0, 0], [w.inch, d.inch, 0], [0, d.inch, 0])
    f.pushpull(h.inch)
    cache[key] = defn
    defn
  end

  def self.build
    model = Sketchup.active_model
    model.start_operation("Build #{MASTER_NAME}", true)
    begin
      # Idempotent: erase a previous build with the same name.
      model.active_entities.grep(Sketchup::Group).each do |g|
        g.erase! if g.name == MASTER_NAME
      end

      TAGS.each { |t| model.layers.add(t) }

      master = model.active_entities.add_group
      master.name = MASTER_NAME

      cache = {}
      PARTS.each do |p|
        defn = get_def(model, cache, p[:def], p[:dname], p[:w], p[:d], p[:h])
        corner = Geom::Point3d.new((p[:cx] - p[:w] / 2.0).inch,
                                   (p[:cy] - p[:d] / 2.0).inch,
                                   (p[:cz] - p[:h] / 2.0).inch)
        t = Geom::Transformation.translation(corner - defn.bounds.min)
        inst = master.entities.add_instance(defn, t)
        inst.name = p[:name]
        inst.layer = p[:tag]
        inst.material = ensure_material(model, p[:mat])
      end

      model.definitions.purge_unused
      model.commit_operation

      puts "================ ${MASTER} — VALIDATION ================"
${reportPuts}
      puts "  Parts placed: #{PARTS.length}"
      puts "======================================================="
    rescue => e
      model.abort_operation
      puts "BUILD FAILED: #{e.message}"
      puts e.backtrace.join("\\n")
      raise
    end
  end
end

${MODULE}.build
`;
}
