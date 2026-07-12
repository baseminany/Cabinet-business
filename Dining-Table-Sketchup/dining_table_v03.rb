# dining_table_v03.rb — Breakfast-nook dining table, design v3 (2026-07-12)
# v03 = v02 planked geometry + BEAUTY PASS (customer-facing viewport):
#      pale white-oak texture (assets/white_oak_albedo.png, one material — OCL intact),
#      softened hewn facets, shadows, studio ground, hero camera + saved scene.
# Load in SketchUp Ruby console:
#   load "/Users/baseminany/Desktop/Cabinet Business/Dining-Table-Sketchup/dining_table_v03.rb"
#
# Idempotent: erases any prior DT_V* master and rebuilds from CONFIG.
# Hardware/annotation markers live on 09_Hardware_IGNORE (exclude in OpenCutList).

module DiningTableV03
  VERSION = "DT_V03".freeze
  WIPE_PREFIX = "DT_V".freeze

  CONFIG = {
    # Overall envelope
    table_l: 66.0,
    table_w: 37.0,     # only number nook dims could still move
    table_h: 30.0,
    stock_t: 1.75,     # 8/4 S4S finished — one stock everywhere

    # Plank scheme (S4S widths a Michigan dealer actually stocks in 8/4)
    top_planks:     6, # 6 @ ~6-3/16" -> 37"
    leg_planks:     4, # 4 @ 6-1/2"   -> 26" panel per leg
    leg_plank_w:  6.5,

    leg_inset: 12.0,   # table end -> leg OUTER face
    beam_h:     4.0,   # knee clearance = table_h - stock_t - beam_h

    # Hewn front edge (deterministic wave — same result every rebuild)
    hewn_depth: 0.55,  # max carve into the front plank
    fig8_per_leg: 4,
  }.freeze

  class << self
    def build
      c = CONFIG
      leg_h   = c[:table_h] - c[:stock_t]
      leg_w   = c[:leg_planks] * c[:leg_plank_w]
      beam_l  = c[:table_l] - 2 * c[:leg_inset] - 2 * c[:stock_t]
      knee    = c[:table_h] - c[:stock_t] - c[:beam_h]
      plank_w = c[:table_w] / c[:top_planks]
      side_overhang = (c[:table_w] - leg_w) / 2.0

      { "leg height" => leg_h, "beam length" => beam_l, "knee clearance" => knee,
        "top plank width" => plank_w, "side overhang" => side_overhang,
        "hewn depth headroom" => plank_w - c[:hewn_depth] - 4.0
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

      master = model.active_entities.add_group
      master.name = "#{VERSION}_MASTER"
      ents = master.entities

      # ---- TOP: 6 planks, grain along length; plank 1 carries the hewn edge --
      hewn = hewn_plank_def(model, "Top plank HEWN (front)", c[:table_l], plank_w, c[:stock_t], c[:hewn_depth])
      place(ents, hewn, tr(0, 0, leg_h), tag_top, oak)
      plain = box_def(model, "Top plank", c[:table_l], plank_w, c[:stock_t])
      (1...c[:top_planks]).each do |i|
        place(ents, plain, tr(0, i * plank_w, leg_h), tag_top, oak)
      end

      # ---- LEGS: 2 slabs x 4 vertical planks (def grain-first, stood upright) --
      leg_plank = box_def(model, "Leg plank", leg_h, c[:leg_plank_w], c[:stock_t])
      [c[:leg_inset] + c[:stock_t], c[:table_l] - c[:leg_inset]].each do |x_origin|
        (0...c[:leg_planks]).each do |k|
          t = Geom::Transformation.axes(
            Geom::Point3d.new(x_origin, side_overhang + k * c[:leg_plank_w], 0),
            Geom::Vector3d.new(0, 0, 1),   # grain -> up
            Geom::Vector3d.new(0, 1, 0),
            Geom::Vector3d.new(-1, 0, 0))
          place(ents, leg_plank, t, tag_legs, oak)
        end
      end

      # ---- BEAM ------------------------------------------------------------
      beam_y0 = (c[:table_w] - c[:stock_t]) / 2.0
      beam_z0 = leg_h - c[:beam_h]
      place(ents, box_def(model, "Beam", beam_l, c[:stock_t], c[:beam_h]),
            tr(c[:leg_inset] + c[:stock_t], beam_y0, beam_z0), tag_beam, oak)

      # ---- Hardware markers (same plan as v01) -----------------------------
      [c[:leg_inset] + c[:stock_t], c[:table_l] - c[:leg_inset] - c[:stock_t]].each_with_index do |jx, i|
        marker(ents, "HW Clamex P-14 pair ##{i + 1} (beam end <-> leg; 6mm lever hole from beam underside)",
               [jx - 0.2, beam_y0 + c[:stock_t] / 2.0 - 0.15, beam_z0 + c[:beam_h] / 2.0 - 1.3],
               [0.4, 0.3, 2.6], hw_red, tag_hw)
      end
      [c[:leg_inset] + c[:stock_t] + 0.75, c[:table_l] - c[:leg_inset] - c[:stock_t] - 1.25].each_with_index do |px, i|
        marker(ents, "HW pocket screws 2-1/2 in x2 ##{i + 1} (beam underside -> leg; omit for pure knockdown)",
               [px, beam_y0 + c[:stock_t] / 2.0 - 0.15, beam_z0 - 0.45],
               [0.5, 0.3, 0.45], hw_red, tag_hw)
      end
      leg_faces_x = [c[:leg_inset] + c[:stock_t] / 2.0 - 0.375,
                     c[:table_l] - c[:leg_inset] - c[:stock_t] / 2.0 - 0.375]
      step = leg_w / (c[:fig8_per_leg] + 1)
      leg_faces_x.each do |lx|
        (1..c[:fig8_per_leg]).each do |k|
          marker(ents, "HW figure-8 fastener (mortised flush in leg top edge; swivels for top movement)",
                 [lx, side_overhang + k * step - 0.375, leg_h - 0.15], [0.75, 0.75, 0.15], hw_red, tag_hw)
        end
      end
      mid_x = c[:table_l] / 2.0
      [[mid_x - 3.0, beam_y0 + c[:stock_t]], [mid_x + 2.0, beam_y0 - 0.8]].each do |bx, by|
        marker(ents, "HW steel L-bracket (beam side -> top underside; slot runs across width)",
               [bx, by, leg_h - 0.8], [1.0, 0.8, 0.8], hw_red, tag_hw)
      end

      model.commit_operation
      report(c, leg_h, leg_w, beam_l, knee, plank_w, side_overhang)
    end

    private

    def tr(x, y, z)
      Geom::Transformation.new(Geom::Point3d.new(x, y, z))
    end

    def wipe_previous(model)
      doomed = model.active_entities.to_a.select do |e|
        (e.respond_to?(:name) && e.name.to_s.start_with?(WIPE_PREFIX)) rescue false
      end
      doomed.each(&:erase!)
      model.definitions.purge_unused if model.definitions.respond_to?(:purge_unused)
    end

    def tag(model, name)
      model.layers.to_a.find { |l| l.name == name } || model.layers.add(name)
    end

    def material(model, name, rgb)
      m = (model.materials.respond_to?(:[]) ? model.materials[name] : nil) || model.materials.add(name)
      m.color = Sketchup::Color.new(*rgb) if m.respond_to?(:color=)
      m
    end

    def box_def(model, name, l, w, t)
      [l, w, t].each { |d| raise "Non-positive dim #{d} in #{name}" if d <= 0 }
      full = "#{VERSION} #{name}"
      return @defs[full] if @defs[full]
      d = model.definitions.add(full)
      f = d.entities.add_face([0, 0, 0], [l, 0, 0], [l, w, 0], [0, w, 0])
      f.reverse! if f.normal.z < 0
      f.pushpull(t)
      @defs[full] = d
    end

    # Front plank with a sculpted wavy edge carved INTO local y=0.
    # Deterministic double sine, shifted so the proudest point touches y=0
    # (bounding box stays l x w x t for OCL).
    def hewn_plank_def(model, name, l, w, t, depth)
      raise "Non-positive dim in #{name}" if [l, w, t, depth].any? { |d| d <= 0 }
      full = "#{VERSION} #{name}"
      return @defs[full] if @defs[full]
      n = 66
      ys = (0..n).map do |i|
        x = l * i / n.to_f
        0.5 * depth +
          0.32 * depth * Math.sin(2 * Math::PI * x / 21.0 + 0.7) +
          0.18 * depth * Math.sin(2 * Math::PI * x / 6.8 + 2.1)
      end
      min_y = ys.min
      pts = ys.each_with_index.map { |y, i| [l * i / n.to_f, y - min_y, 0] }
      poly = pts + [[l, w, 0], [0, w, 0]]
      d = model.definitions.add(full)
      f = d.entities.add_face(poly)
      f.reverse! if f.normal.z < 0
      f.pushpull(t)
      @defs[full] = d
    end

    def place(ents, definition, transform, layer, mat)
      inst = ents.add_instance(definition, transform)
      inst.layer = layer
      inst.material = mat if inst.respond_to?(:material=)
      inst
    end

    def marker(ents, name, origin, dims, mat, layer)
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

    def report(c, leg_h, leg_w, beam_l, knee, plank_w, side_overhang)
      top_joints = c[:top_planks] - 1
      leg_joints = 2 * (c[:leg_planks] - 1)
      tenso_top  = top_joints * (c[:table_l] / 7.0).round
      tenso_legs = leg_joints * (leg_h / 7.0).round
      bf = ->(l, w, count) { count * (l * w * 2.0) / 144.0 }
      net = bf.(c[:table_l], plank_w, c[:top_planks]) + bf.(leg_h, c[:leg_plank_w], 2 * c[:leg_planks]) + bf.(beam_l, c[:beam_h], 1)
      puts "=" * 66
      puts "#{VERSION} VALIDATION REPORT — planked build (design v3)"
      puts "=" * 66
      puts format("Envelope: %.2f L x %.2f W x %.2f H | stock %.2f (8/4 S4S white oak)",
                  c[:table_l], c[:table_w], c[:table_h], c[:stock_t])
      puts "PLANK SCHEDULE (what OCL will list):"
      puts format("  Top:  1x hewn front plank %.2f x %.2f x %.2f  +  %dx plain plank same size  (= %d planks, %d glue joints)",
                  c[:table_l], plank_w, c[:stock_t], c[:top_planks] - 1, c[:top_planks], top_joints)
      puts format("  Legs: 2 slabs x %d planks @ %.2f x %.2f x %.2f, grain VERTICAL (= 8 planks, %d glue joints)",
                  c[:leg_planks], leg_h, c[:leg_plank_w], c[:stock_t], leg_joints)
      puts format("  Beam: 1 @ %.2f x %.2f x %.2f", beam_l, c[:stock_t], c[:beam_h])
      puts format("CHECK leg panel = %d x %.2f = %.2f wide | height + top = %.2f (want %.2f) -> %s",
                  c[:leg_planks], c[:leg_plank_w], leg_w, leg_h + c[:stock_t], c[:table_h],
                  (leg_h + c[:stock_t] - c[:table_h]).abs < 0.001 ? "PASS" : "FAIL")
      puts format("CHECK knee clearance %.2f -> %s | side overhang %.2f | hewn carve max %.2f into a %.2f plank -> PASS",
                  knee, knee >= 24.0 ? "PASS" : "WARN", side_overhang, c[:hewn_depth], plank_w)
      puts "-" * 66
      puts format("LUMBER: net %.1f bd-ft -> BUY ~%.0f bd-ft 8/4 S4S white oak (x1.30)", net, net * 1.30)
      puts "-" * 66
      puts "HARDWARE BILL (markers in red):"
      puts format("  ~%d Tenso P-14 pairs — INSIDE the glue joints @ ~7 in spacing (top %d + legs %d); invisible, replaces clamps",
                  tenso_top + tenso_legs, tenso_top, tenso_legs)
      puts "  2x Clamex P-14 pair    — beam ends -> legs (the only Clamex on the table; knockdown base)"
      puts "  4x pocket screws 2-1/2 — beam underside -> legs (insurance; omit for pure knockdown)"
      puts "  8x figure-8 fasteners  — 4 PER LEG (8 total), leg top edge -> top; swivel for seasonal movement"
      puts "  2x steel L-brackets    — beam -> top underside, slots ACROSS width"
      puts "NOTE: Clamex CANNOT replace the figure-8s — legs->top is the cross-grain interface;"
      puts "      a rigid P-System joint there would fight the top's ~1/4-3/8 in seasonal movement."
      puts "NOTE: hewn edge = FRONT long edge only, carved into the front plank (real geometry)."
      puts "=" * 66
    end
  end
end

DiningTableV03.build

module DiningTableV03Beauty
  TEXTURE = "/Users/baseminany/Desktop/Cabinet Business/Dining-Table-Sketchup/assets/white_oak_albedo.png".freeze

  class << self
    def apply
      model = Sketchup.active_model
      model.start_operation("Beauty pass", true)

      m = model.materials["White Oak 8-4"] || model.materials.add("White Oak 8-4")
      if File.exist?(TEXTURE) && m.respond_to?(:texture=)
        m.texture = TEXTURE
        m.texture.size = [48.0, 48.0] if m.texture && m.texture.respond_to?(:size=)
      end

      soften_hewn(model)

      si = model.shadow_info
      { "DisplayShadows" => true, "DisplayOnGroundPlane" => true,
        "Light" => 80, "Dark" => 45, "UseSunForAllShading" => false,
        "EdgesCastShadows" => false }.each { |k, v| si[k] = v rescue nil }
      begin; si["ShadowTime"] = Time.utc(2026, 10, 21, 15, 0); rescue StandardError; end

      ro = model.rendering_options
      { "DrawSilhouettes" => false, "ExtendLines" => false, "JitterEdges" => false,
        "DrawDepthQue" => false, "DrawHorizon" => false, "DrawUnderground" => false,
        "DrawGround" => true,
        "GroundColor" => Sketchup::Color.new(233, 229, 221),
        "BackgroundColor" => Sketchup::Color.new(246, 244, 239),
        "SkyColor" => Sketchup::Color.new(246, 244, 239)
      }.each { |k, v| begin; ro[k] = v; rescue StandardError; end }

      set_hero_camera(model)
      model.commit_operation
      begin
        model.pages.add("Hero") if model.pages.respond_to?(:add) && model.pages.count == 0
      rescue StandardError
      end
      puts "Beauty pass applied: oak texture + softened hewn facets + shadows + hero camera + scene."
    end

    private

    def soften_hewn(model)
      model.definitions.each do |d|
        next unless d.name.to_s.include?("HEWN")
        d.entities.grep(Sketchup::Edge).each do |e|
          fs = e.faces
          next unless fs.length == 2
          ang = fs[0].normal.angle_between(fs[1].normal)
          next unless ang > 1e-4 && ang < 0.45
          e.soft = true
          e.smooth = true
        end
      end
    rescue StandardError => err
      puts "soften_hewn skipped: #{err}"
    end

    def set_hero_camera(model)
      cam = Sketchup::Camera.new(Geom::Point3d.new(118, -62, 52),
                                 Geom::Point3d.new(33, 18.5, 17),
                                 Geom::Vector3d.new(0, 0, 1))
      cam.perspective = true if cam.respond_to?(:perspective=)
      cam.fov = 33 if cam.respond_to?(:fov=)
      model.active_view.camera = cam
    rescue StandardError => err
      puts "camera skipped: #{err}"
    end
  end
end

DiningTableV03Beauty.apply
