# LINDA LAUNDRY ROOM - V02 Room Shell  (honors every measured wall length)
# =============================================================================
# WHY V02 (fixes from V01 review):
#   1. VENT was drawn 1/2" oversized on every side, so its visible cover sat 1/2"
#      proud of the given dims (read 9-3/4 off wall 2 / 6-7/8 off floor instead of
#      10-1/4 / 7-3/8). Now the register is modeled EXACTLY 11.5 x 7.25 at 10-1/4
#      off wall 2 and 7-3/8 off the floor - measure any edge and it reads true.
#   2. V01 forced a clean rectangle and reused wall 1's 84.5 for wall 3 (you saw
#      84-1/2). WRONG. V02 models the true quadrilateral from all FOUR measured
#      wall lengths - each wall reads its own number.
#   3. Each wall is on its OWN tag (+ a floating label) so you can hide one wall
#      and "walk through" the room. All tags are *_IGNORE (never hit OpenCutList).
#
# OUT-OF-SQUARE: with 4 unequal wall lengths and no diagonals, the room can't be a
#   rectangle. V02 anchors the WALL-2 datum corner (wall1 <-> wall2) square - since
#   every feature is dimensioned off wall 2 + the floor - and lets the far (wall-4)
#   corner carry the ~1/4-3/8" out-of-square. Walls 1 & 2 come out axis-aligned;
#   walls 3 & 4 tilt < 0.25 deg (invisible, but each reads its true length).
#   >>> Two room DIAGONALS (corner-to-corner) would pin the exact skew - quick tape
#       pull whenever you're back in the room. Lengths are already exact regardless.
#
# ORIENTATION (locked): stand in the door (wall 3), face wall 1, turn RIGHT ->
#   W1 back (window + vent), W2 right (the "off wall 2" datum), W3 front/door,
#   W4 left. +X = wall4->wall2 (right), +Y = door->back, +Z up.
# =============================================================================

module LindaLaundry_V02_Shell
  extend self

  MASTER_NAME    = "Linda_Laundry_V02_Shell"
  PREVIOUS_NAMES = ["Linda_Laundry_V01_Shell", "LINDA_LAUNDRY_V02", "LINDA_LAUNDRY_V01",
                    "LINDA_LAUNDRY", "Linda_Laundry_Shell"].freeze

  # ---- MEASURED WALL LENGTHS (inches) ----------------------------------------
  W1 = 84.5      # back  (window + vent)
  W2 = 93.25     # right (datum)
  W3 = 84.875    # front (door)   <-- your latest (was 84 3/8; confirm if that was right)
  W4 = 93.5      # left
  CH = 96.0      # floor-to-ceiling
  WT = 4.5       # wall thickness (nominal)
  TRIM_PROUD = 0.75

  # ---- WINDOW (wall 1) --------------------------------------------------------
  WIN_OFF_W2      = 7.1875   # 7-3/16  wall2 -> outer trim edge
  WIN_TRIM_W      = 28.0
  WIN_TRIM_H      = 49.0
  WIN_IN_W        = 23.0
  WIN_IN_H        = 44.0
  WIN_TRIM_SILL_Z = 34.75    # floor -> bottom of trim
  WIN_CASE        = 2.5

  # ---- WALL VENT (wall 1, low) -----------------------------------------------
  VENT_W       = 11.5        # CONFIRM W vs H
  VENT_H       = 7.25
  VENT_OFF_W2  = 10.25       # 10-1/4  wall2 -> near (right) edge
  VENT_OFF_FLR = 7.375       # 7-3/8   floor -> bottom

  # ---- DOOR (wall 3) ----------------------------------------------------------
  DOOR_OFF_W2 = 1.0          # wall2 -> outer trim edge (CONFIRM)
  DOOR_IN_W   = 32.25        # inside jamb (clear opening)
  DOOR_IN_H   = 81.0
  DOOR_SLAB_W = 31.875       # leaf (also swing radius)
  DOOR_CASE   = 2.5
  DOOR_TH     = 1.375
  DOOR_HINGE  = :wall2_side  # :wall2_side (parks toward wall 2) | :room_side (sweeps the wall-2 corner)

  def run
    @m = Sketchup.active_model
    @m.start_operation('Build Linda Laundry V02 Shell', true)
    begin
      (([MASTER_NAME] + PREVIOUS_NAMES)).each do |nm|
        @m.entities.grep(Sketchup::Group).each { |e| e.erase! if e.name == nm }
        @m.entities.grep(Sketchup::ComponentInstance).each { |e| e.erase! if e.name == nm }
      end
      @m.definitions.purge_unused
      @defcache = {}
      g = @m.entities.add_group; g.name = MASTER_NAME

      # per-wall tags (hide one to walk through) + floor/ceiling/openings/clearance
      @l_w1  = layer("06_Wall_1_BACK_IGNORE")
      @l_w2  = layer("06_Wall_2_RIGHT_IGNORE")
      @l_w3  = layer("06_Wall_3_FRONT_DOOR_IGNORE")
      @l_w4  = layer("06_Wall_4_LEFT_IGNORE")
      @l_flr = layer("06_Floor_IGNORE")
      @l_ceil = layer("06B_Ceiling_IGNORE")
      @l_clr = layer("10_Door_Swing_Clearance_IGNORE"); set_color(@l_clr, 232, 120, 55)

      @mWALL = gcm("Wall_IGNORE", 246, 246, 243)
      @mFLR  = gcm("Floor_IGNORE", 208, 203, 196)
      @mCEIL = gcm("Ceiling_IGNORE", 250, 250, 250)
      @mGL   = gcm("Glass_IGNORE", 165, 200, 218, 120)
      @mTRIM = gcm("Trim_White_IGNORE", 245, 245, 244)
      @mDOOR = gcm("Door_White_IGNORE", 236, 236, 233)
      @mVENT = gcm("Vent_Register_IGNORE", 150, 152, 156)
      @mVOID = gcm("Vent_Recess_IGNORE", 60, 62, 66)
      @mSWEEP = gcm("REF_DoorSwing_KeepOut_IGNORE", 232, 120, 55, 70)
      @mLEAF  = gcm("REF_DoorLeaf_Open90_IGNORE", 232, 120, 55, 95)

      @c = solve_corners
      cs = [@c[:fr], @c[:br], @c[:bl], @c[:fl]]
      @cx = cs.map { |p| p[0] }.inject(:+) / 4.0
      @cy = cs.map { |p| p[1] }.inject(:+) / 4.0

      slab_quad(g, "Floor", cs, 0.0, -2.0, @mFLR, @l_flr)
      slab_quad(g, "Ceiling_HIDE_to_work", cs, CH, 2.0, @mCEIL, @l_ceil)

      build_wall2(g)
      build_wall1(g)
      build_wall4(g)
      build_wall3(g)   # door + swing
      @m.commit_operation
    rescue => e
      @m.abort_operation; raise e
    end
    build_dims(g)
    build_labels(g)
    build_scenes
    report
  end

  # -------- corner solve: datum corner (wall1<->wall2) square, honor all 4 sides
  def solve_corners
    x2 = W3
    fr = [x2, 0.0]                 # front-right (wall2 & wall3)
    br = [x2, W2]                  # back-right  (wall2 & wall1)  -- square corner
    bl = [x2 - W1, W2]             # back-left   (wall1 & wall4)
    fl = circle_intersect(fr, W3, bl, W4)  # front-left (wall3 & wall4)
    { fr: fr, br: br, bl: bl, fl: fl }
  end

  def circle_intersect(c0, r0, c1, r1)
    dx = c1[0] - c0[0]; dy = c1[1] - c0[1]; d = Math.sqrt(dx*dx + dy*dy)
    raise "corner solve: walls can't close (check lengths)" if d > r0 + r1 || d < (r0 - r1).abs || d == 0
    a = (r0*r0 - r1*r1 + d*d) / (2.0*d)
    h = Math.sqrt([r0*r0 - a*a, 0.0].max)
    xm = c0[0] + a*dx/d; ym = c0[1] + a*dy/d
    s1 = [xm + h*dy/d, ym - h*dx/d]
    s2 = [xm - h*dy/d, ym + h*dx/d]
    s1[1] <= s2[1] ? s1 : s2      # front corner = smaller Y
  end

  # ------------------------------------------------------------------ WALLS
  # wall group local frame: +x along wall from `datum`, +y into the room, +z up.
  # wall body sits at y in [-WT, 0]; the room is y > 0.
  def wall_group(g, name, datum, far)
    dir = unit(sub(far, datum)); len = dist(far, datum)
    n = [-dir[1], dir[0]]                                   # left normal
    mid = [(datum[0]+far[0])/2.0, (datum[1]+far[1])/2.0]
    toc = [@cx - mid[0], @cy - mid[1]]
    n = [-n[0], -n[1]] if (n[0]*toc[0] + n[1]*toc[1]) < 0   # make it point into the room
    wg = g.entities.add_group; wg.name = name
    wg.transformation = Geom::Transformation.axes(
      Geom::Point3d.new(datum[0], datum[1], 0.0),
      Geom::Vector3d.new(dir[0], dir[1], 0.0),
      Geom::Vector3d.new(n[0], n[1], 0.0),
      Geom::Vector3d.new(0, 0, 1))
    [wg, len]
  end

  def build_wall2(g)
    wg, len = wall_group(g, "Wall_2_RIGHT", @c[:fr], @c[:br])
    ab(wg, "Wall2_Body", 0, -WT, 0, len, WT, CH, @mWALL, @l_w2)
  end

  def build_wall4(g)
    wg, len = wall_group(g, "Wall_4_LEFT", @c[:bl], @c[:fl])
    ab(wg, "Wall4_Body", 0, -WT, 0, len, WT, CH, @mWALL, @l_w4)
  end

  def build_wall1(g)
    wg, len = wall_group(g, "Wall_1_BACK", @c[:br], @c[:bl])   # x from wall-2 end
    # window hole (glass) in local coords
    gx0 = WIN_OFF_W2 + WIN_CASE                # 9.6875
    gx1 = gx0 + WIN_IN_W                        # 32.6875
    gz0 = WIN_TRIM_SILL_Z + WIN_CASE            # 37.25
    gz1 = gz0 + WIN_IN_H                         # 81.25
    ab(wg, "Wall1_below",  0, -WT, 0,   len, WT, gz0, @mWALL, @l_w1)
    ab(wg, "Wall1_Lwin",   0, -WT, gz0, gx0, WT, gz1 - gz0, @mWALL, @l_w1)
    ab(wg, "Wall1_Rwin",   gx1, -WT, gz0, len - gx1, WT, gz1 - gz0, @mWALL, @l_w1)
    ab(wg, "Wall1_above",  0, -WT, gz1, len, WT, CH - gz1, @mWALL, @l_w1)
    # glass + picture-frame casing (proud into room, +y)
    ab(wg, "Window_Glass", gx0, -WT/2.0 - 0.125, gz0, WIN_IN_W, 0.25, WIN_IN_H, @mGL, @l_w1)
    tx0 = gx0 - WIN_CASE; tz0 = gz0 - WIN_CASE; tz1 = gz1 + WIN_CASE
    ab(wg, "Window_Casing_R_towardW2", tx0, 0, tz0, WIN_CASE, TRIM_PROUD, tz1 - tz0, @mTRIM, @l_w1)
    ab(wg, "Window_Casing_L", gx1, 0, tz0, WIN_CASE, TRIM_PROUD, tz1 - tz0, @mTRIM, @l_w1)
    ab(wg, "Window_Casing_Head", gx0, 0, gz1, WIN_IN_W, TRIM_PROUD, WIN_CASE, @mTRIM, @l_w1)
    ab(wg, "Window_Casing_Sill", gx0, 0, tz0, WIN_IN_W, TRIM_PROUD, WIN_CASE, @mTRIM, @l_w1)
    # VENT - modeled EXACTLY to size at the given location (no oversized flange)
    vx0 = VENT_OFF_W2                           # 10.25 off wall 2 = local x
    ab(wg, "Vent_Recess_DARK", vx0, -1.0, VENT_OFF_FLR, VENT_W, 1.0, VENT_H, @mVOID, @l_w1)
    ab(wg, "Vent_Register_11p5x7p25", vx0, 0, VENT_OFF_FLR, VENT_W, 0.5, VENT_H, @mVENT, @l_w1)
  end

  def build_wall3(g)
    wg, len = wall_group(g, "Wall_3_FRONT_DOOR", @c[:fr], @c[:fl])   # x from wall-2 end
    jx0 = DOOR_OFF_W2 + DOOR_CASE               # 3.5   (jamb near wall 2)
    jx1 = jx0 + DOOR_IN_W                        # 35.75 (jamb far)
    ab(wg, "Wall3_Rdoor",  0, -WT, 0, jx0, WT, DOOR_IN_H, @mWALL, @l_w3)
    ab(wg, "Wall3_Ldoor",  jx1, -WT, 0, len - jx1, WT, DOOR_IN_H, @mWALL, @l_w3)
    ab(wg, "Wall3_above",  0, -WT, DOOR_IN_H, len, WT, CH - DOOR_IN_H, @mWALL, @l_w3)
    # closed leaf (centered in the clear opening) + casing (2 jambs + head)
    sx0 = jx0 + (DOOR_IN_W - DOOR_SLAB_W) / 2.0
    ab(wg, "Door_Slab_Closed", sx0, 0, 0, DOOR_SLAB_W, DOOR_TH, DOOR_IN_H, @mDOOR, @l_w3)
    ab(wg, "Door_Casing_R_towardW2", DOOR_OFF_W2, 0, 0, DOOR_CASE, TRIM_PROUD, DOOR_IN_H + DOOR_CASE, @mTRIM, @l_w3)
    ab(wg, "Door_Casing_L", jx1, 0, 0, DOOR_CASE, TRIM_PROUD, DOOR_IN_H + DOOR_CASE, @mTRIM, @l_w3)
    ab(wg, "Door_Casing_Head", DOOR_OFF_W2, 0, DOOR_IN_H, (jx1 + DOOR_CASE) - DOOR_OFF_W2, TRIM_PROUD, DOOR_CASE, @mTRIM, @l_w3)
    # swing keep-out (floor sector + ghost open leaf) in the wall's local frame
    r = DOOR_SLAB_W
    if DOOR_HINGE == :wall2_side
      hx = jx0; a0 = 0.0;  a1 = 90.0;  leaf_x = jx0 - DOOR_TH   # parks toward wall 2
    else
      hx = jx1; a0 = 90.0; a1 = 180.0; leaf_x = jx1             # sweeps the wall-2 corner
    end
    floor_sector(wg, "Door_Swing_KEEPOUT_floor", hx, 0.0, r, a0, a1, 0.02, 0.06, @mSWEEP, @l_clr)
    ab(wg, "Door_Ghost_Open90_KEEPOUT", leaf_x, 0, 0, DOOR_TH, r, DOOR_IN_H, @mLEAF, @l_clr)
  end

  # ------------------------------------------------------------------ ON-MODEL DIMS
  def build_dims(g)
    e = @m.entities
    return unless e.respond_to?(:add_dimension_linear)
    # each wall reads its true measured length
    dim(e, @c[:br], @c[:bl], [0, 9, 0])       # W1
    dim(e, @c[:fr], @c[:br], [9, 0, 0])       # W2
    dim(e, @c[:fl], @c[:fr], [0, -9, 0])      # W3
    dim(e, @c[:bl], @c[:fl], [-9, 0, 0])      # W4
    dim(e, [@c[:br][0], @c[:br][1], 0], [@c[:br][0], @c[:br][1], CH], [9, 0, 0])  # height
  rescue StandardError
  end

  def dim(e, a, b, off)
    pa = Geom::Point3d.new(a[0], a[1], a[2] || 0.0)
    pb = Geom::Point3d.new(b[0], b[1], b[2] || 0.0)
    e.add_dimension_linear(pa, pb, Geom::Vector3d.new(*off))
  rescue StandardError
  end

  # ------------------------------------------------------------------ WALL LABELS
  def build_labels(g)
    e = @m.entities
    return unless e.respond_to?(:add_text)
    [["WALL 1 - back - #{frac(W1)}", mid(@c[:br], @c[:bl]), @l_w1],
     ["WALL 2 - right (datum) - #{frac(W2)}", mid(@c[:fr], @c[:br]), @l_w2],
     ["WALL 3 - front/door - #{frac(W3)}", mid(@c[:fl], @c[:fr]), @l_w3],
     ["WALL 4 - left - #{frac(W4)}", mid(@c[:bl], @c[:fl]), @l_w4]].each do |txt, p, lay|
      begin
        t = e.add_text(txt, Geom::Point3d.new(p[0], p[1], 66.0))
        t.layer = lay if t.respond_to?(:layer=)
      rescue StandardError
      end
    end
  rescue StandardError
  end

  # ------------------------------------------------------------------ SCENES
  def build_scenes
    v = @m.active_view
    dcx = (@c[:fr][0] + @c[:fl][0]) / 2.0
    v.camera = Sketchup::Camera.new([dcx, -34.0, 64.0], [@cx, @cy + 6.0, 40.0], [0, 0, 1])
    @m.pages.add("Entry View")
    cam = Sketchup::Camera.new([@cx, @cy, 320.0], [@cx, @cy, 0.0], [0, 1, 0])
    cam.perspective = false
    v.camera = cam
    @m.pages.add("Plan (Top)")
    v.camera = Sketchup::Camera.new([-46.0, -54.0, 96.0], [@cx, @cy, 30.0], [0, 0, 1])
    v.zoom_extents
  rescue StandardError
  end

  # ------------------------------------------------------------------ HELPERS
  def layer(n); @m.layers.add(n); end
  def gcm(n, r, gr, b, a = 255)
    ex = @m.materials[n]; return ex if ex
    mt = @m.materials.add(n); mt.color = Sketchup::Color.new(r, gr, b, a); mt
  end
  def set_color(l, r, gr, b); l.color = Sketchup::Color.new(r, gr, b) if l.respond_to?(:color=); rescue StandardError; end

  def sub(a, b); [a[0]-b[0], a[1]-b[1]]; end
  def dist(a, b); Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2); end
  def unit(v); l = Math.sqrt(v[0]**2 + v[1]**2); raise "zero-length wall" if l == 0; [v[0]/l, v[1]/l]; end
  def mid(a, b); [(a[0]+b[0])/2.0, (a[1]+b[1])/2.0]; end
  def frac(v)
    whole = v.floor; f = v - whole
    return "#{whole}\"" if f < 1e-6
    n = (f * 16).round; return "#{whole+1}\"" if n == 16
    g = n.gcd(16); "#{whole} #{n/g}/#{16/g}\""
  end

  def ab(parent, name, x, y, z, w, d, h, mat, layer, grain = nil)
    raise "#{name} bad size #{w}x#{d}x#{h}" if w <= 0 || d <= 0 || h <= 0
    mk = mat ? mat.name : "nil"; lk = layer ? layer.name : "nil"
    key = [w.round(4), d.round(4), h.round(4), mk, lk, grain]
    defn = @defcache[key]
    unless defn
      defn = @m.definitions.add(format("P_%gx%gx%g_%s", w.round(3), d.round(3), h.round(3), mk[0, 8]))
      p = [[0,0,0],[w,0,0],[w,d,0],[0,d,0],[0,0,h],[w,0,h],[w,d,h],[0,d,h]]
      [[0,1,2,3],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]].each do |q|
        f = defn.entities.add_face(q.map { |i| p[i] })
        c = Geom::Point3d.new(w/2.0, d/2.0, h/2.0)
        f.reverse! if f.normal.dot(f.bounds.center - c) < 0
      end
      defn.set_attribute('SketchUp', 'OCL_grain', grain) if grain
      @defcache[key] = defn
    end
    inst = parent.entities.add_instance(defn, Geom::Transformation.new([x, y, z]))
    inst.name = name; inst.material = mat; inst.layer = layer; inst
  end

  def slab_quad(g, name, corners, z, thick, mat, layer)
    raise "#{name} bad thick" if thick == 0
    defn = @m.definitions.add(name)
    f = defn.entities.add_face(corners.map { |c| Geom::Point3d.new(c[0], c[1], z) })
    f.reverse! if (thick > 0 && f.normal.z < 0) || (thick < 0 && f.normal.z > 0)
    f.pushpull(thick.abs)
    inst = g.entities.add_instance(defn, Geom::Transformation.new([0, 0, 0]))
    inst.name = name; inst.material = mat; inst.layer = layer; inst
  end

  def floor_sector(parent, name, cx, cy, r, a0_deg, a1_deg, z, thick, mat, layer, steps = 28)
    raise "#{name} bad sector r=#{r} thick=#{thick}" if r <= 0 || thick <= 0
    defn = @m.definitions.add(name)
    pts = [Geom::Point3d.new(cx, cy, 0.0)]
    (0..steps).each do |i|
      a = (a0_deg + (a1_deg - a0_deg) * i / steps.to_f) * Math::PI / 180.0
      pts << Geom::Point3d.new(cx + r * Math.cos(a), cy + r * Math.sin(a), 0.0)
    end
    f = defn.entities.add_face(pts)
    f.reverse! if f.normal.z < 0
    f.pushpull(thick)
    inst = parent.entities.add_instance(defn, Geom::Transformation.new([0, 0, z]))
    inst.name = name; inst.material = mat; inst.layer = layer; inst
  end

  # ------------------------------------------------------------------ REPORT
  def report
    d13 = dist(@c[:fr], @c[:bl]); d24 = dist(@c[:br], @c[:fl])   # diagonals produced by the model
    bar = "=" * 74
    puts "\n#{bar}\n  LINDA LAUNDRY ROOM  -  V02 SHELL  -  VALIDATION REPORT\n#{bar}"
    puts "[Fixed]  Vent modeled EXACTLY #{VENT_W}x#{VENT_H} at #{frac(VENT_OFF_W2)} off wall 2 /"
    puts "         #{frac(VENT_OFF_FLR)} off floor (V01 cover was 1/2\" oversized -> read 9-3/4 / 6-7/8)."
    puts "[Fixed]  Every wall = its measured length (V01 forced a rectangle):"
    puts "         W1 #{frac(W1)} | W2 #{frac(W2)} | W3 #{frac(W3)} | W4 #{frac(W4)} | H #{frac(CH)}."
    puts "         Corners: FR#{r2(@c[:fr])} BR#{r2(@c[:br])} BL#{r2(@c[:bl])} FL#{r2(@c[:fl])}."
    puts "         Datum corner (W1<->W2) square; far corner carries the out-of-square."
    puts "         Model diagonals: FR-BL #{r4(d13)}, BR-FL #{r4(d24)}  (send me your two tape"
    puts "         diagonals to lock the exact skew; wall LENGTHS are already exact)."
    puts "[Walk]   Each wall on its own tag (hide one to walk through) + a floating label:"
    puts "         06_Wall_1_BACK / 06_Wall_2_RIGHT / 06_Wall_3_FRONT_DOOR / 06_Wall_4_LEFT,"
    puts "         plus 06_Floor / 06B_Ceiling / 10_Door_Swing_Clearance. ALL *_IGNORE (no OCL)."
    puts "         A wall's window/vent/door ride ITS tag, so they hide with the wall."
    puts "[Window] glass #{WIN_IN_W}x#{WIN_IN_H}, trim #{WIN_TRIM_W}x#{WIN_TRIM_H} @2.5 casing,"
    puts "         sill-trim #{frac(WIN_TRIM_SILL_Z)}, #{frac(WIN_OFF_W2)} off wall 2."
    puts "[Door]   clear #{frac(DOOR_IN_W)}x#{frac(DOOR_IN_H)}, leaf #{DOOR_SLAB_W}, ~#{frac(DOOR_OFF_W2)} off wall 2."
    puts "         Swing: #{DOOR_HINGE == :wall2_side ? 'hinge wall-2 side, parks toward wall 2' : 'hinge room side, sweeps wall-2 corner'}"
    puts "         (flip: DOOR_HINGE = :#{DOOR_HINGE == :wall2_side ? 'room_side' : 'wall2_side'})."
    puts "[Confirm] W3 = #{frac(W3)} (you first said 84 3/8). Vent W-vs-H + supply/return."
    puts bar
  end

  def r2(p); "(#{(p[0]*100).round/100.0},#{(p[1]*100).round/100.0})"; end
  def r4(v); (v*10000).round/10000.0; end
end

LindaLaundry_V02_Shell.run
