# LINDA LAUNDRY ROOM - V01 Room Shell  (Ahmed V25.8 / Leanna idiom)
# =============================================================================
# SCOPE: reference SHELL ONLY (no cabinets yet) - "dimensions first" pass.
#   Walls + floor + ceiling, the window (glass + trim), the wall vent, and the
#   door (slab + trim) with a SUBTLE door-swing keep-out so we can plan cabinets
#   that clear the swing. Everything here is on *_IGNORE tags (OCL excludes it).
#
# ORIENTATION (locked to how Basem stands, per room-modeling convention) ------
#   Stand IN THE DOORWAY looking in. Wall 1 is across from you; then turn RIGHT.
#     Wall 1 = BACK  wall (far)     -> +Y face at Y = RD   (window + vent)
#     Wall 2 = RIGHT wall           -> +X face at X = RW    (the "off wall 2" datum)
#     Wall 3 = FRONT wall (door)    -> the Y = 0 face       (you enter here)
#     Wall 4 = LEFT  wall           -> the X = 0 face
#   Axes:  +X = wall4 -> wall2 (right),  +Y = door -> back wall,  +Z = up.
#   ALL "off wall 2" field dims are measured from X = RW inward (-X).
#   A saved "Entry View" scene reproduces this POV so a flip is caught instantly.
#
# OUT-OF-SQUARE (field): wall1 84.5 vs wall3 84.375 (1/8" short); wall4 93.5 vs
#   wall2 93.25 (1/4" short). Modeled as a clean rectangle at the LARGER of each
#   pair; the deltas are absorbed at the left/near corners. >>> CONFIRM with the
#   two room diagonals + three-height wall measures before cutting anything. <<<
#
# KEY ASSUMPTIONS / DO-NOT-CUT-YET (see report at end):
#   * Casing = 2.5" all around (window: 28x49 trim over 23x44 opening -> 2.5).
#     Door casing "similar to window" -> 2.5" both jambs + head, none at floor.
#   * Vent modeled 11.5"W x 7.25"H (landscape, ~a 6x10 register flange). CONFIRM
#     W-vs-H and supply/return. Shown as a surface register (not cut through).
#   * Door hinge = DOOR_HINGE below. Default :wall2_side (door opens flat toward
#     wall 2). Flip to :room_side if it actually sweeps the wall-2 corner. One edit.
#   * Wall thickness 4.5" nominal; ceiling height 96".
# =============================================================================

module LindaLaundry_V01_Shell
  extend self

  MASTER_NAME    = "Linda_Laundry_V01_Shell"
  PREVIOUS_NAMES = ["LINDA_LAUNDRY_V01", "LINDA_LAUNDRY", "Linda_Laundry_Shell"].freeze

  # ---- ROOM ENVELOPE (inches) -------------------------------------------------
  RW = 84.5     # X, wall1 length  (wall3 = 84.375 -> out-of-square, noted)
  RD = 93.5     # Y, wall4 length  (wall2 = 93.25)
  CH = 96.0     # floor-to-ceiling
  WT = 4.5      # wall thickness (nominal)
  TRIM_PROUD = 0.75  # casing projection off the wall face, into the room

  # ---- WINDOW (on wall 1 / back) ---------------------------------------------
  WIN_OFF_W2      = 7.1875   # 7-3/16  wall2 -> outer trim edge
  WIN_TRIM_W      = 28.0
  WIN_TRIM_H      = 49.0
  WIN_IN_W        = 23.0
  WIN_IN_H        = 44.0
  WIN_TRIM_SILL_Z = 34.75    # 34-3/4  floor -> bottom of trim
  WIN_CASE        = (WIN_TRIM_W - WIN_IN_W) / 2.0   # = 2.5

  # ---- WALL VENT (on wall 1 / back, low) -------------------------------------
  VENT_W       = 11.5        # CONFIRM W vs H
  VENT_H       = 7.25
  VENT_OFF_W2  = 10.25       # 10-1/4  wall2 -> near (right) edge
  VENT_OFF_FLR = 7.375       # 7-3/8   floor -> bottom

  # ---- DOOR (on wall 3 / front) ----------------------------------------------
  DOOR_OFF_W2 = 1.0          # wall2 -> outer trim edge (approx; CONFIRM)
  DOOR_IN_W   = 32.25        # inside jamb (clear opening)
  DOOR_IN_H   = 81.0
  DOOR_SLAB_W = 31.875       # 31-7/8 leaf (also the swing radius)
  DOOR_CASE   = 2.5          # casing, like the window
  DOOR_TH     = 1.375        # leaf thickness (1-3/8)
  DOOR_HINGE  = :wall2_side  # :wall2_side (parks toward wall 2) | :room_side (sweeps toward wall 2)

  def run
    m = Sketchup.active_model
    m.start_operation('Build Linda Laundry V01 Shell', true)
    begin
      (([MASTER_NAME] + PREVIOUS_NAMES)).each do |nm|
        m.entities.grep(Sketchup::Group).each { |e| e.erase! if e.name == nm }
        m.entities.grep(Sketchup::ComponentInstance).each { |e| e.erase! if e.name == nm }
      end
      m.definitions.purge_unused
      @defcache = {}
      g = m.entities.add_group; g.name = MASTER_NAME

      @l_env  = m.layers.add("06_Environment_IGNORE")
      @l_ceil = m.layers.add("06B_Ceiling_IGNORE")
      @l_arch = m.layers.add("08_Architecture_Openings_IGNORE")
      @l_clr  = m.layers.add("10_Clearance_Check_IGNORE")
      set_color(@l_clr, 232, 120, 55)

      @mWALL  = gcm("Wall_IGNORE", 246, 246, 243)
      @mFLR   = gcm("Floor_IGNORE", 208, 203, 196)
      @mCEIL  = gcm("Ceiling_IGNORE", 250, 250, 250)
      @mGL    = gcm("Glass_IGNORE", 165, 200, 218, 120)
      @mTRIM  = gcm("Trim_White_IGNORE", 245, 245, 244)
      @mDOOR  = gcm("Door_White_IGNORE", 236, 236, 233)
      @mVENT  = gcm("Vent_Register_IGNORE", 150, 152, 156)
      @mVOID  = gcm("Vent_Recess_IGNORE", 60, 62, 66)
      @mSWEEP = gcm("REF_DoorSwing_KeepOut_IGNORE", 232, 120, 55, 70)
      @mLEAF  = gcm("REF_DoorLeaf_Open90_IGNORE", 232, 120, 55, 95)

      build_shell(g)
      build_window(g)
      build_vent(g)
      build_door(g)
      build_door_swing(g)
      m.commit_operation
    rescue => e
      m.abort_operation; raise e
    end
    build_scenes(m)
    build_dims(m)
    report
  end

  # ------------------------------------------------------------------ ROOM SHELL
  def build_shell(g)
    # floor + ceiling (footprint runs under the walls so there are no seams)
    ab(g, "Floor", -WT, -WT, -2.0, RW + 2*WT, RD + 2*WT, 2.0, @mFLR, @l_env)
    ab(g, "Ceiling_HIDE_to_work", -WT, -WT, CH, RW + 2*WT, RD + 2*WT, 2.0, @mCEIL, @l_ceil)

    # side walls span the full depth (they own the 4 corners)
    ab(g, "Wall4_LEFT",  -WT, -WT, 0, WT, RD + 2*WT, CH, @mWALL, @l_env)
    ab(g, "Wall2_RIGHT",  RW, -WT, 0, WT, RD + 2*WT, CH, @mWALL, @l_env)

    # WALL 1 (BACK) - solid banded around the WINDOW hole (vent is a surface register)
    wl = win_bounds
    ab(g, "Wall1_BACK_belowWin", 0, RD, 0,        RW, WT, wl[:z0], @mWALL, @l_env)
    ab(g, "Wall1_BACK_L_ofWin",  0, RD, wl[:z0],  wl[:x0], WT, wl[:z1] - wl[:z0], @mWALL, @l_env)
    ab(g, "Wall1_BACK_R_ofWin",  wl[:x1], RD, wl[:z0], RW - wl[:x1], WT, wl[:z1] - wl[:z0], @mWALL, @l_env)
    ab(g, "Wall1_BACK_aboveWin", 0, RD, wl[:z1],  RW, WT, CH - wl[:z1], @mWALL, @l_env)

    # WALL 3 (FRONT / DOOR) - solid banded around the DOOR hole
    dr = door_bounds
    ab(g, "Wall3_FRONT_L_ofDoor", 0, -WT, 0,       dr[:x0], WT, DOOR_IN_H, @mWALL, @l_env)
    ab(g, "Wall3_FRONT_R_ofDoor", dr[:x1], -WT, 0, RW - dr[:x1], WT, DOOR_IN_H, @mWALL, @l_env)
    ab(g, "Wall3_FRONT_aboveDoor", 0, -WT, DOOR_IN_H, RW, WT, CH - DOOR_IN_H, @mWALL, @l_env)
  end

  # window opening extents (room coords)
  def win_bounds
    x1 = RW - WIN_OFF_W2 - WIN_CASE        # inner (right) glass edge
    x0 = x1 - WIN_IN_W                     # inner (left) glass edge
    z0 = WIN_TRIM_SILL_Z + WIN_CASE        # glass bottom
    z1 = z0 + WIN_IN_H                      # glass top
    { x0: x0, x1: x1, z0: z0, z1: z1 }
  end

  # door clear-opening extents (room coords)
  def door_bounds
    x1 = RW - DOOR_OFF_W2 - DOOR_CASE      # right jamb (inner)
    x0 = x1 - DOOR_IN_W                    # left jamb (inner)
    { x0: x0, x1: x1 }
  end

  # ------------------------------------------------------------------ WINDOW
  def build_window(g)
    wl = win_bounds
    # glass, centered in the wall thickness
    gy = RD + WT/2.0 - 0.125
    ab(g, "Window_Glass", wl[:x0], gy, wl[:z0], WIN_IN_W, 0.25, WIN_IN_H, @mGL, @l_arch)
    # picture-frame casing on the room face (proud into the room, -Y)
    fy = RD - TRIM_PROUD
    tx0 = wl[:x0] - WIN_CASE; tx1 = wl[:x1] + WIN_CASE
    tz0 = wl[:z0] - WIN_CASE; tz1 = wl[:z1] + WIN_CASE
    ab(g, "Window_Casing_L",   tx0, fy, tz0, WIN_CASE, TRIM_PROUD, tz1 - tz0, @mTRIM, @l_arch)
    ab(g, "Window_Casing_R",   wl[:x1], fy, tz0, WIN_CASE, TRIM_PROUD, tz1 - tz0, @mTRIM, @l_arch)
    ab(g, "Window_Casing_Head", wl[:x0], fy, wl[:z1], WIN_IN_W, TRIM_PROUD, WIN_CASE, @mTRIM, @l_arch)
    ab(g, "Window_Casing_Sill", wl[:x0], fy, tz0, WIN_IN_W, TRIM_PROUD, WIN_CASE, @mTRIM, @l_arch)
  end

  # ------------------------------------------------------------------ WALL VENT
  def build_vent(g)
    vx1 = RW - VENT_OFF_W2          # near (right) edge
    vx0 = vx1 - VENT_W
    vz0 = VENT_OFF_FLR
    # shallow dark recess set into the wall + a register plate proud of the face
    ab(g, "Vent_Recess_DARK", vx0, RD + 0.25, vz0, VENT_W, 1.0, VENT_H, @mVOID, @l_arch)
    ab(g, "Vent_Register_Plate", vx0 - 0.5, RD - 0.5, vz0 - 0.5, VENT_W + 1.0, 0.5, VENT_H + 1.0, @mVENT, @l_arch)
  end

  # ------------------------------------------------------------------ DOOR
  def build_door(g)
    dr = door_bounds
    trimR = dr[:x1] + DOOR_CASE
    # closed leaf, centered in the clear opening
    slabL = dr[:x0] + (DOOR_IN_W - DOOR_SLAB_W) / 2.0
    ab(g, "Door_Slab_Closed", slabL, 0.0, 0.0, DOOR_SLAB_W, DOOR_TH, DOOR_IN_H, @mDOOR, @l_arch)
    # casing: two jambs + head, proud into the room (+Y), none at the floor
    fy = 0.0
    ab(g, "Door_Casing_L",   dr[:x0] - DOOR_CASE, fy, 0.0, DOOR_CASE, TRIM_PROUD, DOOR_IN_H + DOOR_CASE, @mTRIM, @l_arch)
    ab(g, "Door_Casing_R",   dr[:x1], fy, 0.0, DOOR_CASE, TRIM_PROUD, DOOR_IN_H + DOOR_CASE, @mTRIM, @l_arch)
    ab(g, "Door_Casing_Head", dr[:x0] - DOOR_CASE, fy, DOOR_IN_H, trimR - (dr[:x0] - DOOR_CASE), TRIM_PROUD, DOOR_CASE, @mTRIM, @l_arch)
  end

  # -------------------------------------------------- DOOR SWING (subtle keep-out)
  # A thin floor sector = the exact area the leaf sweeps + a ghost open-90 leaf.
  # Both on 10_Clearance_Check_IGNORE so they toggle off in one click.
  def build_door_swing(g)
    dr = door_bounds; r = DOOR_SLAB_W
    if DOOR_HINGE == :wall2_side
      px = dr[:x1]; a0 = 90.0;  a1 = 180.0            # hinge at right jamb; leaf parks toward wall 2
      leaf_x0 = dr[:x1]
    else
      px = dr[:x0]; a0 = 0.0;   a1 = 90.0             # hinge at left jamb; sweep goes toward wall 2
      leaf_x0 = dr[:x0] - DOOR_TH
    end
    floor_sector(g, "Door_Swing_KEEPOUT_floor", px, 0.0, r, a0, a1, 0.02, 0.06, @mSWEEP, @l_clr)
    ab(g, "Door_Ghost_Open90_KEEPOUT", leaf_x0, 0.0, 0.0, DOOR_TH, r, DOOR_IN_H, @mLEAF, @l_clr)
  end

  # ------------------------------------------------------------------ SCENES
  def build_scenes(m)
    v = m.active_view
    dc = door_center_x
    v.camera = Sketchup::Camera.new([dc, -34.0, 64.0], [RW/2.0, 52.0, 40.0], [0, 0, 1])
    m.pages.add("Entry View")
    cam = Sketchup::Camera.new([RW/2.0, RD/2.0, 320.0], [RW/2.0, RD/2.0, 0.0], [0, 1, 0])
    cam.perspective = false
    v.camera = cam
    m.pages.add("Plan (Top)")
    v.camera = Sketchup::Camera.new([-46.0, -54.0, 96.0], [RW/2.0, RD/2.0, 30.0], [0, 0, 1])
    v.zoom_extents
  rescue StandardError
  end

  def door_center_x
    dr = door_bounds; (dr[:x0] + dr[:x1]) / 2.0
  end

  # ---------------------------------------------- ON-MODEL DIMENSIONS (guarded)
  def build_dims(m)
    e = m.entities
    return unless e.respond_to?(:add_dimension_linear)
    wl = win_bounds; dr = door_bounds
    dim(e, [0, RD, 0], [RW, RD, 0], [0, 10, 0])                       # room width (wall 1)
    dim(e, [0, 0, 0], [0, RD, 0], [-10, 0, 0])                        # room depth (wall 4)
    dim(e, [0, 0, 0], [0, 0, CH], [-10, 0, 0])                        # ceiling height
    dim(e, [wl[:x0], RD, wl[:z1]], [wl[:x1], RD, wl[:z1]], [0, 6, 6]) # window width (glass)
    dim(e, [wl[:x1], RD, wl[:z0]], [wl[:x1], RD, wl[:z1]], [6, 6, 0]) # window height (glass)
    dim(e, [dr[:x0], 0, DOOR_IN_H], [dr[:x1], 0, DOOR_IN_H], [0, 6, 6]) # door clear width
    dim(e, [dr[:x1], 0, 0], [dr[:x1], 0, DOOR_IN_H], [6, 6, 0])       # door clear height
  rescue StandardError
  end

  def dim(e, a, b, off)
    e.add_dimension_linear(Geom::Point3d.new(*a), Geom::Point3d.new(*b), Geom::Vector3d.new(*off))
  rescue StandardError
  end

  # ------------------------------------------------------------------ HELPERS
  def gcm(n, r, gr, b, a = 255)
    ex = Sketchup.active_model.materials[n]; return ex if ex
    mt = Sketchup.active_model.materials.add(n); mt.color = Sketchup::Color.new(r, gr, b, a); mt
  end

  def set_color(layer, r, gr, b)
    layer.color = Sketchup::Color.new(r, gr, b) if layer.respond_to?(:color=)
  rescue StandardError
  end

  # def-cached box builder; raises on any <= 0 dim (never silent .abs)
  def ab(parent, name, x, y, z, w, d, h, mat, layer, grain = nil)
    raise "#{name} bad size #{w}x#{d}x#{h}" if w <= 0 || d <= 0 || h <= 0
    mk = mat ? mat.name : "nil"; lk = layer ? layer.name : "nil"
    key = [w.round(4), d.round(4), h.round(4), mk, lk, grain]
    defn = @defcache[key]
    unless defn
      defn = Sketchup.active_model.definitions.add(format("P_%gx%gx%g_%s", w.round(3), d.round(3), h.round(3), mk[0, 8]))
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

  # thin flat pie-sector on the floor (the door-swing footprint), built from an arc fan
  def floor_sector(parent, name, cx, cy, r, a0_deg, a1_deg, z, thick, mat, layer, steps = 28)
    raise "#{name} bad sector r=#{r} thick=#{thick}" if r <= 0 || thick <= 0
    defn = Sketchup.active_model.definitions.add(name)
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
    wl = win_bounds; dr = door_bounds
    bar = "=" * 74
    puts "\n#{bar}\n  LINDA LAUNDRY ROOM  -  V01 SHELL  -  VALIDATION REPORT\n#{bar}"
    puts "[Orientation] Stand in door (wall 3), face wall 1, turn RIGHT: W1 back(+Y),"
    puts "              W2 right(+X = 'off wall 2' datum), W3 front/door, W4 left(X=0)."
    puts "              'Entry View' + 'Plan (Top)' scenes saved to lock this POV."
    puts "[Envelope]    #{RW} (W1, X) x #{RD} (W4, Y) x #{CH} H. Wall t=#{WT} nominal."
    puts "[Sq CHECK]    W3=84.375 (1/8 short of W1)  |  W2=93.25 (1/4 short of W4)."
    puts "              Modeled as a clean rectangle at the LARGER pair; deltas absorbed"
    puts "              at the near corners. >>> CONFIRM the two diagonals + 3-height"
    puts "              wall measures (smallest wins) before sizing any run. <<<"
    puts "[Window]      glass X #{r4(wl[:x0])}..#{r4(wl[:x1])} (#{WIN_IN_W}), Z #{r4(wl[:z0])}..#{r4(wl[:z1])} (#{WIN_IN_H});"
    puts "              trim 28x49 @ 2.5 casing; sill(trim) 34.75; #{WIN_OFF_W2} off wall 2."
    puts "[Vent]        #{VENT_W}Wx#{VENT_H}H, bottom #{VENT_OFF_FLR} off floor, #{VENT_OFF_W2} off wall 2"
    puts "              (register X #{r4(RW - VENT_OFF_W2 - VENT_W)}..#{r4(RW - VENT_OFF_W2)})."
    puts "              *FLAG: CONFIRM vent W-vs-H + supply/return; modeled landscape."
    puts "[Door]        clear #{DOOR_IN_W}x#{DOOR_IN_H} @ X #{r4(dr[:x0])}..#{r4(dr[:x1])}; leaf #{DOOR_SLAB_W};"
    puts "              casing 2.5 (2 jambs + head); outer trim ~#{DOOR_OFF_W2} off wall 2."
    hs = DOOR_HINGE == :wall2_side ? "hinge @ RIGHT jamb -> parks flat toward wall 2; sweep is to its LEFT" \
                                   : "hinge @ LEFT jamb -> sweeps toward wall 2 (wall-2 corner keep-out)"
    puts "[Swing]       radius #{DOOR_SLAB_W}. #{hs}."
    puts "              Keep-out drawn on 10_Clearance_Check_IGNORE (floor sector + ghost"
    puts "              leaf). Flip with DOOR_HINGE = :#{DOOR_HINGE == :wall2_side ? 'room_side' : 'wall2_side'}."
    puts "[Tags]        06_Environment / 06B_Ceiling / 08_Architecture_Openings /"
    puts "              10_Clearance_Check - ALL *_IGNORE (nothing here hits OCL yet)."
    puts "[Next]        Confirm orientation in Entry View, then we lay out cabinetry"
    puts "              (which walls, appliances, folding counter under the window)."
    puts bar
  end

  def r4(v); (v * 10000).round / 10000.0; end
end

LindaLaundry_V01_Shell.run
