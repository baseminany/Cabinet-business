# dining_table_v01.rb — Breakfast-nook dining table, design v3 (2026-07-11)
# Job: nook-dining-table · spec source: PROJECT_NOTES.md in this folder
# Load in SketchUp Ruby console:
#   load "/Users/baseminany/Desktop/Cabinet Business/Dining-Table-Sketchup/dining_table_v01.rb"
#
# Idempotent: erases any prior DT_V01_MASTER and rebuilds from CONFIG.
# All structural parts are components on OCL-visible tags; hardware/annotation
# markers live on 09_Hardware_IGNORE (exclude that tag in OpenCutList).

module DiningTableV01
  VERSION = "DT_V01".freeze

  CONFIG = {
    # Overall envelope
    table_l: 66.0,     # length
    table_w: 37.0,     # width  (the one number nook dims could still move)
    table_h: 30.0,     # finished height
    stock_t: 1.75,     # 8/4 S4S finished thickness — top, legs, beam all one stock

    # Slab legs (grain VERTICAL, each = 3 boards edge-glued w/ Tensos)
    leg_w:     26.0,   # panel width across the table
    leg_inset: 12.0,   # table end -> leg OUTER face

    # Hidden center beam (grain along length)
    beam_h: 4.0,       # keep <= 4.0: knee clearance = table_h - stock_t - beam_h

    # Hardware markers
    fig8_per_leg: 4,   # figure-8 fasteners mortised into each leg top edge
  }.freeze

  class << self
    def build
      c = CONFIG
      leg_h  = c[:table_h] - c[:stock_t]
      beam_l = c[:table_l] - 2 * c[:leg_inset] - 2 * c[:stock_t]
      knee   = c[:table_h] - c[:stock_t] - c[:beam_h]
      side_overhang = (c[:table_w] - c[:leg_w]) / 2.0

      { "leg height" => leg_h, "beam length" => beam_l,
        "knee clearance" => knee, "side overhang" => side_overhang
      }.each { |k, v| raise "CONFIG error: #{k} = #{v} (must be > 0)" if v <= 0 }

      model = Sketchup.active_model
      model.start_operation("Build #{VERSION}", true)

      wipe_previous(model)
      @defs = {}

      tag_top  = tag(model, "01_Top")
      tag_legs = tag(model, "02_Legs")
      tag_beam = tag(model, "03_Beam")
      tag_hw   = tag(model, "09_Hardware_IGNORE")

      oak    = material(model, "White Oak 8-4", [222, 196, 148])
      hw_red = material(model, "HW Marker",     [200, 60, 40])
      note   = material(model, "Note Marker",   [235, 160, 40])

      master = model.active_entities.add_group
      master.name = "#{VERSION}_MASTER"
      ents = master.entities

      # ---- Structural parts (grain = local X of each definition) ----------
      # Top: grain along table length
      place(ents, box_def(model, "Top", c[:table_l], c[:table_w], c[:stock_t], oak),
            Geom::Transformation.new(Geom::Point3d.new(0, 0, leg_h)), tag_top)

      # Legs: definition drawn grain-first (X = height), instance rotated upright.
      leg_def = box_def(model, "Leg slab", leg_h, c[:leg_w], c[:stock_t], oak)
      [c[:leg_inset] + c[:stock_t],                       # left leg inner face plane
       c[:table_l] - c[:leg_inset]].each do |x_origin|    # right leg outer face plane
        t = Geom::Transformation.axes(
          Geom::Point3d.new(x_origin, side_overhang, 0),
          Geom::Vector3d.new(0, 0, 1),    # local X (grain) -> world +Z
          Geom::Vector3d.new(0, 1, 0),    # local Y (width) -> world +Y
          Geom::Vector3d.new(-1, 0, 0))   # local Z (thickness) -> world -X
        place(ents, leg_def, t, tag_legs)
      end

      # Beam: centered in width, tight under the top
      place(ents, box_def(model, "Beam", beam_l, c[:stock_t], c[:beam_h], oak),
            Geom::Transformation.new(Geom::Point3d.new(
              c[:leg_inset] + c[:stock_t],
              (c[:table_w] - c[:stock_t]) / 2.0,
              leg_h - c[:beam_h])), tag_beam)

      # ---- Hardware / annotation markers (09_Hardware_IGNORE) -------------
      beam_y0 = (c[:table_w] - c[:stock_t]) / 2.0
      beam_z0 = leg_h - c[:beam_h]

      # Clamex P-14: one pair per beam<->leg joint, vertical, centered
      [c[:leg_inset] + c[:stock_t], c[:table_l] - c[:leg_inset] - c[:stock_t]].each_with_index do |jx, i|
        marker(ents, model, "HW Clamex P-14 pair ##{i + 1} (beam end <-> leg, vertical; 6mm access hole from beam underside)",
               [jx - 0.2, beam_y0 + c[:stock_t] / 2.0 - 0.15, beam_z0 + c[:beam_h] / 2.0 - 1.3],
               [0.4, 0.3, 2.6], hw_red, tag_hw)
      end

      # Pocket screws: 2x 2-1/2" per joint from beam underside into leg
      [c[:leg_inset] + c[:stock_t] + 0.75, c[:table_l] - c[:leg_inset] - c[:stock_t] - 1.25].each_with_index do |px, i|
        marker(ents, model, "HW pocket screws 2-1/2 in x2 ##{i + 1} (beam underside -> leg, insurance; omit for pure knockdown)",
               [px, beam_y0 + c[:stock_t] / 2.0 - 0.15, beam_z0 - 0.45],
               [0.5, 0.3, 0.45], hw_red, tag_hw)
      end

      # Figure-8 fasteners: mortised flush into each leg top edge
      leg_faces_x = [c[:leg_inset] + c[:stock_t] / 2.0 - 0.375,
                     c[:table_l] - c[:leg_inset] - c[:stock_t] / 2.0 - 0.375]
      step = c[:leg_w] / (c[:fig8_per_leg] + 1)
      leg_faces_x.each do |lx|
        (1..c[:fig8_per_leg]).each do |k|
          cy = side_overhang + k * step
          marker(ents, model, "HW figure-8 fastener (mortise flush in leg top edge, #8 x 1-1/4 screws; swivels for top movement)",
                 [lx, cy - 0.375, leg_h - 0.15], [0.75, 0.75, 0.15], hw_red, tag_hw)
        end
      end

      # L-brackets: beam side -> top underside, slotted hole ACROSS width
      mid_x = c[:table_l] / 2.0
      [[mid_x - 3.0, beam_y0 + c[:stock_t]], [mid_x + 2.0, beam_y0 - 0.8]].each do |bx, by|
        marker(ents, model, "HW steel L-bracket (beam side -> top underside; slot runs across width)",
               [bx, by, leg_h - 0.8], [1.0, 0.8, 0.8], hw_red, tag_hw)
      end

      # Textured-edge ribbon: FRONT long edge only (one side, per Basem)
      marker(ents, model, "TEXTURED EDGE - hewn/faux-live, FRONT long edge ONLY (jigsaw wave -> drawknife/grinder -> 80-180 grit)",
             [0.0, -0.12, leg_h], [c[:table_l], 0.12, c[:stock_t]], note, tag_hw)

      model.commit_operation
      report(c, leg_h, beam_l, knee, side_overhang)
    end

    private

    def wipe_previous(model)
      doomed = model.active_entities.to_a.select do |e|
        (e.respond_to?(:name) && e.name.to_s.start_with?(VERSION)) rescue false
      end
      doomed.each(&:erase!)
      model.definitions.purge_unused if model.definitions.respond_to?(:purge_unused)
    end

    def tag(model, name)
      layers = model.layers
      layers.to_a.find { |l| l.name == name } || layers.add(name)
    end

    def material(model, name, rgb)
      mats = model.materials
      m = (mats.respond_to?(:[]) ? mats[name] : nil) || mats.add(name)
      m.color = Sketchup::Color.new(*rgb) if m.respond_to?(:color=)
      m
    end

    # def-cached box builder: one definition per unique name, N instances
    def box_def(model, name, l, w, t, mat)
      [l, w, t].each { |d| raise "Non-positive dim #{d} in #{name}" if d <= 0 }
      full = "#{VERSION} #{name}"
      return @defs[full] if @defs[full]
      d = model.definitions.add(full)
      f = d.entities.add_face([0, 0, 0], [l, 0, 0], [l, w, 0], [0, w, 0])
      f.reverse! if f.normal.z < 0
      f.pushpull(t)
      d.entities.grep(Sketchup::Face).each { |face| face.material = mat } if defined?(Sketchup::Face)
      @defs[full] = d
    end

    def place(ents, definition, transform, layer)
      inst = ents.add_instance(definition, transform)
      inst.layer = layer
      inst
    end

    def marker(ents, model, name, origin, dims, mat, layer)
      raise "Non-positive marker dim in #{name}" if dims.any? { |d| d <= 0 }
      g = ents.add_group
      f = g.entities.add_face(
        [origin[0], origin[1], origin[2]],
        [origin[0] + dims[0], origin[1], origin[2]],
        [origin[0] + dims[0], origin[1] + dims[1], origin[2]],
        [origin[0], origin[1] + dims[1], origin[2]])
      f.reverse! if f.normal.z < 0
      f.pushpull(dims[2])
      g.name = name
      g.material = mat if g.respond_to?(:material=)
      g.layer = layer
      g
    end

    def report(c, leg_h, beam_l, knee, side_overhang)
      bf = lambda { |l, w| (l * w * 2.0) / 144.0 }  # buy at 8/4 nominal 2"
      top_bf  = bf.call(c[:table_l], c[:table_w])
      legs_bf = 2 * bf.call(leg_h, c[:leg_w])
      beam_bf = bf.call(beam_l, c[:beam_h])
      net = top_bf + legs_bf + beam_bf
      puts "=" * 64
      puts "#{VERSION} VALIDATION REPORT — breakfast-nook dining table (v3)"
      puts "=" * 64
      puts format("Envelope: %.2f L x %.2f W x %.2f H  | stock %.2f (8/4 S4S white oak)",
                  c[:table_l], c[:table_w], c[:table_h], c[:stock_t])
      puts format("PARTS: Top 1 @ %.2fx%.2fx%.2f | Leg slab 2 @ %.2fx%.2fx%.2f (grain VERTICAL) | Beam 1 @ %.2fx%.2fx%.2f",
                  c[:table_l], c[:table_w], c[:stock_t], leg_h, c[:leg_w], c[:stock_t], beam_l, c[:stock_t], c[:beam_h])
      puts format("CHECK leg_h + stock = %.2f (want %.2f) -> %s", leg_h + c[:stock_t], c[:table_h],
                  (leg_h + c[:stock_t] - c[:table_h]).abs < 0.001 ? "PASS" : "FAIL")
      puts format("CHECK beam spans leg inner faces = %.2f -> %s", beam_l, beam_l > 0 ? "PASS" : "FAIL")
      puts format("CHECK knee clearance under beam = %.2f in -> %s", knee, knee >= 24.0 ? "PASS" : "WARN (<24)")
      puts format("Side overhang past leg = %.2f in each side", side_overhang)
      puts "-" * 64
      puts format("LUMBER (net bd-ft @ 2 in nominal): top %.1f + legs %.1f + beam %.1f = %.1f",
                  top_bf, legs_bf, beam_bf, net)
      puts format("BUY: ~%.0f bd-ft 8/4 S4S white oak (net x1.30 waste/grain matching)", net * 1.30)
      puts "-" * 64
      puts "HARDWARE BILL:"
      puts "  2x  Clamex P-14 pair       — beam ends -> legs (vertical, centered; 6mm lever hole from beam underside)"
      puts "  4x  pocket screws 2-1/2 in — 2 per joint, beam underside -> leg (skip for pure knockdown)"
      puts "  8x  figure-8 fasteners     — 4 per leg, mortised flush in leg top edge, #8 x 1-1/4 up into top"
      puts "  2x  steel L-brackets       — beam sides -> top underside near midspan, slots ACROSS width"
      puts "  0   screws/hardware in any glue-up (Tensos are internal: ~6-8in spacing per joint)"
      puts "NOTE: top attaches so it can MOVE across width — figure-8s swivel, bracket slots across width; nothing glued."
      puts "NOTE: textured edge = FRONT long edge only (orange ribbon marker)."
      puts "=" * 64
    end
  end
end

DiningTableV01.build
