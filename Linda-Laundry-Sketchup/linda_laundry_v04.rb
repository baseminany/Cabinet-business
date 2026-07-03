# LINDA LAUNDRY / MUDROOM - V03  (room shell + wall-4 cabinet run)
# =============================================================================
# BUILD PHILOSOPHY (out-of-square): carcasses are built DEAD SQUARE and the
# run is set out perpendicular to wall 1 (the square datum). The room's small
# out-of-square lives in NAMED SCRIBE FILLERS at the two wall-meeting ends
# (against wall 1 and against wall 3) + toe/leveler + back scribe - never in a
# box. The run is sized to the SAFE (smaller) 93.25 depth; the end fillers close
# the slack. On install day you trim a FILLER, never a carcass.
#   >>> GATE BEFORE CUTTING: wall 4 at 3 heights (use smallest), the 2 room
#       diagonals, W1<->W4 corner square (3-4-5), floor high point. <<<
#
# THE RUN (wall 4, from the wall-1 corner toward wall 3), everything 30 3/8 deep
# (flush with the washer) except the 21"-deep bench. Frameless carcasses,
# full-overlay SHAKER (Stumpy Nubs 2-bit cope-and-stick). LIGHT WALNUT throughout.
#   [W1 scribe .75] [Corner tower 12: doors 75 + 15] [gap 1] [LG WashTower 27 +
#    upper] [gap 1] [Tall storage 21: two full-height doors] [Bench 29.75: hinged
#    lid @19 + cushion, uppers above, shiplap backer] [W3 scribe .75]
#   Uppers band: 15" tall, bottoms ~79.19, tops 94.25, FLUSH 30 3/8 deep so the
#   crown runs one clean line. Crown = light-walnut sprung cove (not flat trim).
#   Shiplap = nickel-gap (~1/8") light walnut behind the bench, seat->uppers.
#
# LG WashTower WKEX200HWA: 27 W x 74 3/8 H x 30 3/8 D; ~55" deep w/ washer door
#   open; ~1" side/rear clearance. Modeled to resemble the unit + open washer &
#   dryer door footprints (hinge LEFT default - flag). Appliance is REFERENCE.
# =============================================================================

module LindaLaundry_V04
  extend self

  MASTER_NAME    = "Linda_Laundry_V04"
  PREVIOUS_NAMES = ["Linda_Laundry_V03", "Linda_Laundry_V02_Shell", "Linda_Laundry_V01_Shell",
                    "LINDA_LAUNDRY_V02", "LINDA_LAUNDRY_V01", "LINDA_LAUNDRY"].freeze

  # ---- V04: sink base under the window (wall 1); vent relocated to a toe-kick register
  VENT_RELOCATED = true
  SINK_BASE_W = 30.0         # centered on the window
  SINK_CT_TOP = 34.75        # counter top = window sill-trim bottom (tucks under, no rework)
  SINK_CARC_D = 24.0         # base depth
  SINK_CT_THK = 1.25
  SINK_BOWL_W = 18.0; SINK_BOWL_D = 16.0; SINK_BOWL_H = 8.0   # single kitchen-size bowl

  # ---- room (from v02) --------------------------------------------------------
  W1 = 84.5; W2 = 93.25; W3 = 84.875; W4 = 93.5; CH = 96.0; WT = 4.5
  TRIM_PROUD = 0.75
  WIN_OFF_W2 = 7.1875; WIN_TRIM_W = 28.0; WIN_TRIM_H = 49.0; WIN_IN_W = 23.0
  WIN_IN_H = 44.0; WIN_TRIM_SILL_Z = 34.75; WIN_CASE = 2.5
  VENT_W = 11.5; VENT_H = 7.25; VENT_OFF_W2 = 10.25; VENT_OFF_FLR = 7.375
  DOOR_OFF_W2 = 1.0; DOOR_IN_W = 32.25; DOOR_IN_H = 81.0; DOOR_SLAB_W = 31.875
  DOOR_CASE = 2.5; DOOR_TH = 1.375; DOOR_HINGE = :wall2_side

  # ---- cabinet run ------------------------------------------------------------
  TOE = 4.0; TOE_SETBACK = 3.0
  CARC_TOP = 94.25            # top of talls / uppers
  CARC_D   = 29.625          # carcass depth (door face lands at 30.375 = flush w/ washer)
  FACE_X   = 30.375          # front face plane
  REV = 0.0625; GAP = 0.125  # outer reveal / between-door gap
  LDOOR_H = 75.0             # tower lower door
  UDOOR_H = 15.0             # upper-band door height
  BREAK_Z = TOE + REV + LDOOR_H + GAP     # 79.1875 : upper-band door bottom
  UP_CARC_BOT = BREAK_Z - REV             # 79.125
  # washer
  WSH_W = 27.0; WSH_H = 74.375; WSH_D = 30.375; WSH_GAP = 1.0
  # bench
  BENCH_D = 21.0; BENCH_LID_Z = 19.0
  # shaker (2-bit cope & stick)
  SHK_W = 1.75; SHK_FT = 0.75; SHK_GD = 0.375; SHK_PT = 0.5; SHK_PG = 0.0625

  def run
    @m = Sketchup.active_model
    @m.start_operation('Build Linda Laundry V03', true)
    begin
      (([MASTER_NAME] + PREVIOUS_NAMES)).each do |nm|
        @m.entities.grep(Sketchup::Group).each { |e| e.erase! if e.name == nm }
        @m.entities.grep(Sketchup::ComponentInstance).each { |e| e.erase! if e.name == nm }
      end
      @m.definitions.purge_unused
      @defcache = {}
      g = @m.entities.add_group; g.name = MASTER_NAME

      # room tags
      @l_w1 = layer("06_Wall_1_BACK_IGNORE"); @l_w2 = layer("06_Wall_2_RIGHT_IGNORE")
      @l_w3 = layer("06_Wall_3_FRONT_DOOR_IGNORE"); @l_w4 = layer("06_Wall_4_LEFT_IGNORE")
      @l_flr = layer("06_Floor_IGNORE"); @l_ceil = layer("06B_Ceiling_IGNORE")
      # cabinet tags
      @l_carc = layer("01_Carcasses"); @l_face = layer("02_Doors_and_Faces")
      @l_toe = layer("05_Toe_Kicks_Fillers_SITE"); @l_crown = layer("05B_Crown_Molding")
      @l_ship = layer("05C_Shiplap"); @l_bench = layer("03_Bench_Lid_Cushion")
      @l_app = layer("08_Appliance_Reference_IGNORE")
      @l_clr = layer("10_Clearance_Check_IGNORE"); set_color(@l_clr, 232, 120, 55)

      # materials
      @mWALL = gcm("Wall_IGNORE", 246, 246, 243); @mFLR = gcm("Floor_IGNORE", 208, 203, 196)
      @mCEIL = gcm("Ceiling_IGNORE", 250, 250, 250); @mGL = gcm("Glass_IGNORE", 165, 200, 218, 120)
      @mTRIM = gcm("Trim_White_IGNORE", 245, 245, 244); @mDOOR = gcm("Door_White_IGNORE", 236, 236, 233)
      @mVENT = gcm("Vent_Register_IGNORE", 150, 152, 156); @mVOID = gcm("Vent_Recess_IGNORE", 60, 62, 66)
      @mSWEEP = gcm("REF_DoorSwing_KeepOut_IGNORE", 232, 120, 55, 70)
      @mLEAF = gcm("REF_DoorLeaf_Open90_IGNORE", 232, 120, 55, 95)
      @mWAL  = gcm("Light_Walnut_3_4", 170, 128, 88)        # carcasses, doors, fronts, crown, shiplap
      @mWALP = gcm("Light_Walnut_Panel_1_2", 178, 137, 97)  # shaker panels
      @mAPP  = gcm("REF_Appliance_White_IGNORE", 238, 238, 240)
      @mAPPP = gcm("REF_Appliance_Control_IGNORE", 64, 66, 74)
      @mAPPD = gcm("REF_Appliance_Door_Glass_IGNORE", 44, 46, 54, 200)
      @mCUSH = gcm("Bench_Cushion", 206, 200, 188)
      @mCT   = gcm("Light_Walnut_Counter_ButcherBlock", 182, 141, 100)  # seal well or swap to quartz
      @mBOWL = gcm("REF_Sink_Bowl_Stainless_IGNORE", 190, 192, 196)
      @mBRS  = gcm("Brass_Faucet", 150, 120, 70)
      @mKEEP = gcm("REF_Plumbing_KeepOut_IGNORE", 220, 40, 40, 110)

      @c = solve_corners
      cs = [@c[:fr], @c[:br], @c[:bl], @c[:fl]]
      @cx = cs.map { |p| p[0] }.inject(:+) / 4.0
      @cy = cs.map { |p| p[1] }.inject(:+) / 4.0

      # ---- room shell
      slab_quad(g, "Floor", cs, 0.0, -2.0, @mFLR, @l_flr)
      slab_quad(g, "Ceiling_HIDE_to_work", cs, CH, 2.0, @mCEIL, @l_ceil)
      build_wall2(g); build_wall1(g); build_wall4(g); build_wall3(g)

      # ---- cabinet run (world axis-aligned; backs at X=0, depth +X, width along Y)
      build_run(g)

      # ---- V04: sink base under the window on wall 1
      build_sink_base(g)

      @m.commit_operation
    rescue => e
      @m.abort_operation; raise e
    end
    build_dims(g); build_labels(g); build_scenes; report
  end

  # ===========================================================================
  #  CABINET RUN
  # ===========================================================================
  # Y runs from wall 1 (Y=93.25) toward wall 3 (Y=0). We lay units out by their
  # far (lower-Y) edge. A helper converts "start s from wall 1" -> Y.
  def build_run(g)
    y_w1 = 93.25
    # sequence widths from wall 1 (see header). Positions are the LOW-Y edge of each unit.
    f1_y1 = y_w1;            f1_y0 = f1_y1 - 0.75            # W1 scribe filler
    tw_y1 = f1_y0;           tw_y0 = tw_y1 - 12.0            # corner tower
    ga_y1 = tw_y0;           ga_y0 = ga_y1 - WSH_GAP        # gap
    ws_y1 = ga_y0;           ws_y0 = ws_y1 - WSH_W          # washtower
    gb_y1 = ws_y0;           gb_y0 = gb_y1 - WSH_GAP        # gap
    ts_y1 = gb_y0;           ts_y0 = ts_y1 - 21.0           # tall storage
    bn_y1 = ts_y0;           bn_y0 = 0.75                   # bench -> to W3 scribe
    f3_y1 = bn_y0;           f3_y0 = 0.0                    # W3 scribe filler
    @bench_w = bn_y1 - bn_y0

    # ---- corner tower : 12 wide, doors 75 + 15
    carcass(g, "TWR", tw_y0, 12.0, TOE, CARC_TOP - TOE, CARC_D, @l_carc, 1)
    toe_kick(g, "TWR", tw_y0, 12.0, CARC_D)
    shaker_front(g, "TWR_DoorLo", tw_y0 + REV, TOE + REV, 12.0 - 2*REV, LDOOR_H, FACE_X)
    shaker_front(g, "TWR_DoorUp", tw_y0 + REV, BREAK_Z, 12.0 - 2*REV, UDOOR_H, FACE_X)
    pull(g, "TWR_Pull", FACE_X, tw_y0 + 12.0 - 1.5, BREAK_Z - 3.0)

    # ---- filler strips framing the appliance (front-flush; 1" air stays behind)
    ab(g, "Filler_WasherSide_Tower", CARC_D, ga_y0, 0, FACE_X - CARC_D, WSH_GAP, CARC_TOP, @mWAL, @l_toe)
    ab(g, "Filler_WasherSide_Storage", CARC_D, gb_y0, 0, FACE_X - CARC_D, WSH_GAP, CARC_TOP, @mWAL, @l_toe)

    # ---- LG WashTower + open-door footprints (reference)
    build_washtower(g, ws_y0)

    # ---- upper cabinet above washer (flush depth), 2 doors
    carcass(g, "WUP", ws_y0, WSH_W, UP_CARC_BOT, CARC_TOP - UP_CARC_BOT, CARC_D, @l_carc, 1)
    two_doors(g, "WUP", ws_y0, WSH_W, BREAK_Z, UDOOR_H)

    # ---- tall storage : 21 wide, TWO side-by-side full-height doors
    carcass(g, "STO", ts_y0, 21.0, TOE, CARC_TOP - TOE, CARC_D, @l_carc, 3)
    toe_kick(g, "STO", ts_y0, 21.0, CARC_D)
    two_doors(g, "STO", ts_y0, 21.0, TOE + REV, (CARC_TOP - REV) - (TOE + REV))

    # ---- bench : hinged-lid storage (opens from top) + cushion
    build_bench(g, bn_y0, @bench_w)

    # ---- upper cabinet above bench (flush depth), 2 doors
    carcass(g, "BUP", bn_y0, @bench_w, UP_CARC_BOT, CARC_TOP - UP_CARC_BOT, CARC_D, @l_carc, 1)
    two_doors(g, "BUP", bn_y0, @bench_w, BREAK_Z, UDOOR_H)

    # ---- scribe fillers at the two wall-meeting ends (absorb out-of-square)
    ab(g, "Scribe_Filler_to_Wall1", 0, f1_y0, TOE, CARC_D, 0.75, CARC_TOP - TOE, @mWAL, @l_toe)
    ab(g, "Scribe_Filler_to_Wall3_bench", 0, f3_y0, TOE, BENCH_D, 0.75, BENCH_LID_Z - TOE, @mWAL, @l_toe)
    ab(g, "Scribe_Filler_to_Wall3_upper", 0, f3_y0, UP_CARC_BOT, CARC_D, 0.75, CARC_TOP - UP_CARC_BOT, @mWAL, @l_toe)

    # ---- crown (one clean line, flush top), + shiplap behind the bench
    crown_run(g, f3_y1, tw_y1 - f3_y1)
    build_shiplap(g, bn_y0, @bench_w)
  end

  # frameless carcass: back at X=0, depth +X, width along Y, box Z[z0, z0+h]
  def carcass(g, n, y0, wY, z0, h, d, tag, nsh)
    ab(g, "#{n}_Back", 0, y0 + 0.75, z0, 0.25, wY - 1.5, h, @mWAL, tag)
    ab(g, "#{n}_SideA", 0, y0, z0, d, 0.75, h, @mWAL, tag, 'v')
    ab(g, "#{n}_SideB", 0, y0 + wY - 0.75, z0, d, 0.75, h, @mWAL, tag, 'v')
    ab(g, "#{n}_Bottom", 0.25, y0 + 0.75, z0, d - 0.25, wY - 1.5, 0.75, @mWAL, tag, 'h')
    ab(g, "#{n}_Top", 0.25, y0 + 0.75, z0 + h - 0.75, d - 0.25, wY - 1.5, 0.75, @mWAL, tag, 'h')
    ab(g, "#{n}_Nailer", 0.25, y0 + 0.75, z0 + h - 3.75, 0.75, wY - 1.5, 3.0, @mWAL, tag, 'h')
    nsh.times do |i|
      z = z0 + (i + 1) * (h / (nsh + 1.0))
      ab(g, "#{n}_Shelf_#{i+1}", 0.5, y0 + 0.8125, z, d - 1.25, wY - 1.625, 0.75, @mWAL, tag, 'h')
    end
  end

  def toe_kick(g, n, y0, wY, d)
    ab(g, "#{n}_ToeKick", d - TOE_SETBACK - 0.75, y0, 0, 0.75, wY, TOE, @mWAL, @l_toe)
  end

  # two side-by-side full-overlay shaker doors on the front
  def two_doors(g, n, y0, wY, z0, hZ)
    dw = (wY - 2*REV - GAP) / 2.0
    shaker_front(g, "#{n}_DoorL", y0 + REV, z0, dw, hZ, FACE_X)
    shaker_front(g, "#{n}_DoorR", y0 + REV + dw + GAP, z0, dw, hZ, FACE_X)
    pull(g, "#{n}_PullL", FACE_X, y0 + REV + dw - 1.5, z0 + 2.0)
    pull(g, "#{n}_PullR", FACE_X, y0 + REV + dw + GAP + 1.5, z0 + 2.0)
  end

  # 5-piece cope-and-stick shaker door; face at X=xf, spans Y (width) x Z (height)
  def shaker_front(g, n, y0, z0, wY, hZ, xf)
    rl = wY - 2*SHK_W + 2*SHK_GD
    pw = wY - 2*SHK_W + 2*SHK_GD - 2*SHK_PG
    ph = hZ - 2*SHK_W + 2*SHK_GD - 2*SHK_PG
    if rl <= 0 || pw <= 0 || ph <= 0
      ab(g, "#{n}_SLAB", xf, y0, z0, SHK_FT, wY, hZ, @mWAL, @l_face); return
    end
    ab(g, "#{n}_StileL", xf, y0, z0, SHK_FT, SHK_W, hZ, @mWAL, @l_face, 'v')
    ab(g, "#{n}_StileR", xf, y0 + wY - SHK_W, z0, SHK_FT, SHK_W, hZ, @mWAL, @l_face, 'v')
    ab(g, "#{n}_RailBot", xf, y0 + SHK_W - SHK_GD, z0, SHK_FT, rl, SHK_W, @mWAL, @l_face, 'h')
    ab(g, "#{n}_RailTop", xf, y0 + SHK_W - SHK_GD, z0 + hZ - SHK_W, SHK_FT, rl, SHK_W, @mWAL, @l_face, 'h')
    ab(g, "#{n}_Panel", xf + (SHK_FT - SHK_PT) / 2.0, y0 + SHK_W - SHK_GD + SHK_PG,
       z0 + SHK_W - SHK_GD + SHK_PG, SHK_PT, pw, ph, @mWALP, @l_face)
  end

  def pull(g, n, xf, y, z)
    ab(g, n, xf, y - 0.375, z - 2.5, 0.75, 0.75, 5.0, gcm("Brass_Hardware", 150, 120, 70), @l_face)
  end

  # ---- bench: box + fixed front panels + hinged lid + cushion + toe
  def build_bench(g, y0, wY)
    h = BENCH_LID_Z - TOE
    carcass(g, "BEN", y0, wY, TOE, h, BENCH_D, @l_carc, 0)
    toe_kick(g, "BEN", y0, wY, BENCH_D)
    # fixed decorative shaker fronts (bench opens from TOP, so fronts are fixed)
    dw = (wY - 2*REV - GAP) / 2.0
    shaker_front(g, "BEN_FrontL", y0 + REV, TOE + REV, dw, h - 2*REV, BENCH_D)
    shaker_front(g, "BEN_FrontR", y0 + REV + dw + GAP, TOE + REV, dw, h - 2*REV, BENCH_D)
    # hinged lift-lid (seat) + cushion on top
    ab(g, "BEN_Lid_HingeAtBack", 0.25, y0 + 0.25, BENCH_LID_Z - 0.75, BENCH_D - 0.5, wY - 0.5, 0.75, @mWAL, @l_bench, 'h')
    ab(g, "BEN_Cushion", 1.5, y0 + 1.0, BENCH_LID_Z, BENCH_D - 3.0, wY - 2.0, 2.0, @mCUSH, @l_bench)
  end

  # ---- shiplap: nickel-gap (~1/8") light-walnut boards, seat top -> upper bottom
  def build_shiplap(g, y0, wY)
    z = BENCH_LID_Z; bh = 7.25; gap = 0.125; top = UP_CARC_BOT
    i = 0
    while z < top - 0.5
      h = [bh, top - z].min
      ab(g, "Shiplap_#{i+1}", 0, y0, z, 0.5, wY, h, @mWAL, @l_ship, 'h')
      z += bh + gap; i += 1
    end
  end

  # ---- crown: sprung cove profile (X-Z) extruded along Y; flush top line
  def crown_run(g, y0, ylen)
    prof = [[FACE_X, CARC_TOP], [FACE_X + 2.25, CARC_TOP + 0.6], [FACE_X + 1.6, CH],
            [FACE_X, CH]]
    extrude_Y(g, "Crown_Molding", prof, y0, ylen, @mWAL, @l_crown)
    # small return cap at the exposed wall-3 end (mitered in production)
    ab(g, "Crown_Return_Wall3", FACE_X, y0, CARC_TOP, 2.25, 0.75, CH - CARC_TOP, @mWAL, @l_crown)
  end

  # ===========================================================================
  #  LG WASHTOWER  (reference) + open washer/dryer door footprints
  # ===========================================================================
  def build_washtower(g, y0)
    yc = y0 + WSH_W / 2.0
    ab(g, "WashTower_Body_REF", 0, y0, 0, WSH_D, WSH_W, WSH_H, @mAPP, @l_app)
    # center control panel band
    ab(g, "WashTower_ControlPanel_REF", WSH_D - 0.75, y0 + 1.0, 38.0, 0.75, WSH_W - 2.0, 8.0, @mAPPP, @l_app)
    # washer porthole (lower) + dryer door (upper) - proud discs facing +X
    disc_X(g, "WashTower_WasherDoor_REF", WSH_D, yc, 22.0, 10.5, 1.0, @mAPPD, @l_app)
    disc_X(g, "WashTower_DryerDoor_REF", WSH_D, yc, 60.0, 10.5, 1.0, @mAPPD, @l_app)
    # OPEN-DOOR footprints (hinge LEFT = low-Y side; flag). Front-load doors are discs
    # swung ~90 to project forward; drawn translucent in the X-Z plane at the hinge.
    disc_Y(g, "WashTower_WasherDoor_OPEN_KEEPOUT", y0 + 0.5, WSH_D + 10.5, 22.0, 10.5, 0.75, @mLEAF, @l_clr)
    disc_Y(g, "WashTower_DryerDoor_OPEN_KEEPOUT", y0 + 0.5, WSH_D + 10.5, 60.0, 10.5, 0.75, @mLEAF, @l_clr)
    # floor loading/clearance zone in front (to the 55" door-open depth)
    ab(g, "WashTower_Front_Clearance_55in", WSH_D, y0, 0.02, 55.0 - WSH_D, WSH_W, 0.06, @mSWEEP, @l_clr)
  end

  # ===========================================================================
  #  V04 - SINK BASE under the window (wall 1), centered on the window.
  #  Built in a local frame: local x = depth into room (world -Y from wall 1),
  #  local y = width along wall 1 (world +X), local z = up.
  # ===========================================================================
  def build_sink_base(g)
    l_ct = layer("09_Countertop")
    # window glass world X center -> cabinet centered on it
    gx0 = WIN_OFF_W2 + WIN_CASE                    # wall-1 local x of glass (from wall-2 datum)
    glass_cx_world = @c[:br][0] - (gx0 + WIN_IN_W / 2.0)   # br.x - local => world X
    xL = glass_cx_world - SINK_BASE_W / 2.0
    ywall = @c[:br][1]                             # wall 1 inner face (world Y)

    sg = g.entities.add_group; sg.name = "Sink_Base_Under_Window"
    sg.transformation = Geom::Transformation.axes(
      Geom::Point3d.new(xL, ywall, 0.0),
      Geom::Vector3d.new(0, -1, 0), Geom::Vector3d.new(1, 0, 0), Geom::Vector3d.new(0, 0, 1))

    d = SINK_CARC_D; w = SINK_BASE_W; ctop = SINK_CT_TOP - SINK_CT_THK   # carcass top 33.5
    fx = d                                          # front face (local x)
    # carcass (frameless; NO full top - sink drops in): sides, bottom, rails, back-cut-later
    ab(sg, "SINK_SideL", 0, 0, TOE, d, 0.75, ctop - TOE, @mWAL, @l_carc, 'v')
    ab(sg, "SINK_SideR", 0, w - 0.75, TOE, d, 0.75, ctop - TOE, @mWAL, @l_carc, 'v')
    ab(sg, "SINK_Bottom", 0.25, 0.75, TOE, d - 0.25, w - 1.5, 0.75, @mWAL, @l_carc, 'h')
    ab(sg, "SINK_FrontRail", fx - 0.75, 0.75, ctop - 3.0, 0.75, w - 1.5, 3.0, @mWAL, @l_carc, 'h')
    ab(sg, "SINK_RearNailer", 0.25, 0.75, ctop - 3.0, 0.75, w - 1.5, 3.0, @mWAL, @l_carc, 'h')
    ab(sg, "SINK_Back_PLUMBING_CUT_LATER", 0, 0.75, TOE, 0.25, w - 1.5, ctop - TOE, @mWAL, @l_carc, 'v')
    # two full-overlay shaker doors
    dw = (w - 2*REV - GAP) / 2.0; z0 = TOE + REV; hz = (ctop - 3.0) - z0 - REV
    shaker_front(sg, "SINK_DoorL", REV, z0, dw, hz, fx)
    shaker_front(sg, "SINK_DoorR", REV + dw + GAP, z0, dw, hz, fx)
    pull(sg, "SINK_PullL", fx, REV + dw - 1.5, z0 + hz - 2.5)
    pull(sg, "SINK_PullR", fx, REV + dw + GAP + 1.5, z0 + hz - 2.5)
    # toe kick + RELOCATED vent (supply now a toe-kick register here)
    ab(sg, "SINK_ToeKick", d - TOE_SETBACK - 0.75, 0, 0, 0.75, w, TOE, @mWAL, @l_toe)
    ab(sg, "Vent_Register_RELOCATED_ToeKick_11p5", d - TOE_SETBACK - 0.5, (w - VENT_W)/2.0, 0.5, 0.5, VENT_W, 3.0, @mVENT, @l_toe)
    # butcher-block counter (1" front + 3/4" side overhangs); top = window sill (34.75)
    ab(sg, "SINK_Counter_ButcherBlock", 0, -0.75, ctop, d + 1.0, w + 1.5, SINK_CT_THK, @mCT, l_ct, 'h')
    # undermount bowl + pull-down faucet (reference)
    bx = (d - SINK_BOWL_D) / 2.0 + 0.5; by = (w - SINK_BOWL_W) / 2.0
    ab(sg, "Sink_Bowl_16x18_Undermount", bx, by, ctop - SINK_BOWL_H, SINK_BOWL_D, SINK_BOWL_W, SINK_BOWL_H, @mBOWL, @l_app)
    ab(sg, "Sink_Faucet_PullDown", 2.0, w/2.0 - 1.0, SINK_CT_TOP, 2.0, 2.0, 10.0, @mBRS, @l_app)
    # plumbing keep-out (supply + drain against the wall)
    ab(sg, "REF_PLUMBING_KEEPOUT", 0, w/2.0 - 5.0, TOE, 8.0, 10.0, ctop - TOE - 3.0, @mKEEP, @l_clr)
  end

  # ===========================================================================
  #  ROOM SHELL  (from v02, unchanged)
  # ===========================================================================
  def solve_corners
    x2 = W3
    fr = [x2, 0.0]; br = [x2, W2]; bl = [x2 - W1, W2]
    fl = circle_intersect(fr, W3, bl, W4)
    { fr: fr, br: br, bl: bl, fl: fl }
  end

  def circle_intersect(c0, r0, c1, r1)
    dx = c1[0] - c0[0]; dy = c1[1] - c0[1]; d = Math.sqrt(dx*dx + dy*dy)
    raise "corner solve: walls can't close" if d > r0 + r1 || d < (r0 - r1).abs || d == 0
    a = (r0*r0 - r1*r1 + d*d) / (2.0*d); h = Math.sqrt([r0*r0 - a*a, 0.0].max)
    xm = c0[0] + a*dx/d; ym = c0[1] + a*dy/d
    s1 = [xm + h*dy/d, ym - h*dx/d]; s2 = [xm - h*dy/d, ym + h*dx/d]
    s1[1] <= s2[1] ? s1 : s2
  end

  def wall_group(g, name, datum, far)
    dir = unit(sub(far, datum)); len = dist(far, datum)
    n = [-dir[1], dir[0]]; mid = [(datum[0]+far[0])/2.0, (datum[1]+far[1])/2.0]
    toc = [@cx - mid[0], @cy - mid[1]]
    n = [-n[0], -n[1]] if (n[0]*toc[0] + n[1]*toc[1]) < 0
    wg = g.entities.add_group; wg.name = name
    wg.transformation = Geom::Transformation.axes(
      Geom::Point3d.new(datum[0], datum[1], 0.0),
      Geom::Vector3d.new(dir[0], dir[1], 0.0), Geom::Vector3d.new(n[0], n[1], 0.0),
      Geom::Vector3d.new(0, 0, 1))
    [wg, len]
  end

  def build_wall2(g); wg, len = wall_group(g, "Wall_2_RIGHT", @c[:fr], @c[:br]); ab(wg, "Wall2_Body", 0, -WT, 0, len, WT, CH, @mWALL, @l_w2); end
  def build_wall4(g); wg, len = wall_group(g, "Wall_4_LEFT", @c[:bl], @c[:fl]); ab(wg, "Wall4_Body", 0, -WT, 0, len, WT, CH, @mWALL, @l_w4); end

  def build_wall1(g)
    wg, len = wall_group(g, "Wall_1_BACK", @c[:br], @c[:bl])
    gx0 = WIN_OFF_W2 + WIN_CASE; gx1 = gx0 + WIN_IN_W
    gz0 = WIN_TRIM_SILL_Z + WIN_CASE; gz1 = gz0 + WIN_IN_H
    ab(wg, "Wall1_below", 0, -WT, 0, len, WT, gz0, @mWALL, @l_w1)
    ab(wg, "Wall1_Lwin", 0, -WT, gz0, gx0, WT, gz1 - gz0, @mWALL, @l_w1)
    ab(wg, "Wall1_Rwin", gx1, -WT, gz0, len - gx1, WT, gz1 - gz0, @mWALL, @l_w1)
    ab(wg, "Wall1_above", 0, -WT, gz1, len, WT, CH - gz1, @mWALL, @l_w1)
    ab(wg, "Window_Glass", gx0, -WT/2.0 - 0.125, gz0, WIN_IN_W, 0.25, WIN_IN_H, @mGL, @l_w1)
    tx0 = gx0 - WIN_CASE; tz0 = gz0 - WIN_CASE; tz1 = gz1 + WIN_CASE
    ab(wg, "Window_Casing_R", tx0, 0, tz0, WIN_CASE, TRIM_PROUD, tz1 - tz0, @mTRIM, @l_w1)
    ab(wg, "Window_Casing_L", gx1, 0, tz0, WIN_CASE, TRIM_PROUD, tz1 - tz0, @mTRIM, @l_w1)
    ab(wg, "Window_Casing_Head", gx0, 0, gz1, WIN_IN_W, TRIM_PROUD, WIN_CASE, @mTRIM, @l_w1)
    ab(wg, "Window_Casing_Sill", gx0, 0, tz0, WIN_IN_W, TRIM_PROUD, WIN_CASE, @mTRIM, @l_w1)
    unless VENT_RELOCATED   # V04: supply moves to the sink-base toe-kick register
      vx0 = VENT_OFF_W2
      ab(wg, "Vent_Recess_DARK", vx0, -1.0, VENT_OFF_FLR, VENT_W, 1.0, VENT_H, @mVOID, @l_w1)
      ab(wg, "Vent_Register_11p5x7p25", vx0, 0, VENT_OFF_FLR, VENT_W, 0.5, VENT_H, @mVENT, @l_w1)
    end
  end

  def build_wall3(g)
    wg, len = wall_group(g, "Wall_3_FRONT_DOOR", @c[:fr], @c[:fl])
    jx0 = DOOR_OFF_W2 + DOOR_CASE; jx1 = jx0 + DOOR_IN_W
    ab(wg, "Wall3_Rdoor", 0, -WT, 0, jx0, WT, DOOR_IN_H, @mWALL, @l_w3)
    ab(wg, "Wall3_Ldoor", jx1, -WT, 0, len - jx1, WT, DOOR_IN_H, @mWALL, @l_w3)
    ab(wg, "Wall3_above", 0, -WT, DOOR_IN_H, len, WT, CH - DOOR_IN_H, @mWALL, @l_w3)
    sx0 = jx0 + (DOOR_IN_W - DOOR_SLAB_W) / 2.0
    ab(wg, "Door_Slab_Closed", sx0, 0, 0, DOOR_SLAB_W, DOOR_TH, DOOR_IN_H, @mDOOR, @l_w3)
    ab(wg, "Door_Casing_R", DOOR_OFF_W2, 0, 0, DOOR_CASE, TRIM_PROUD, DOOR_IN_H + DOOR_CASE, @mTRIM, @l_w3)
    ab(wg, "Door_Casing_L", jx1, 0, 0, DOOR_CASE, TRIM_PROUD, DOOR_IN_H + DOOR_CASE, @mTRIM, @l_w3)
    ab(wg, "Door_Casing_Head", DOOR_OFF_W2, 0, DOOR_IN_H, (jx1 + DOOR_CASE) - DOOR_OFF_W2, TRIM_PROUD, DOOR_CASE, @mTRIM, @l_w3)
    r = DOOR_SLAB_W
    if DOOR_HINGE == :wall2_side
      hx = jx0; a0 = 0.0; a1 = 90.0; leaf_x = jx0 - DOOR_TH
    else
      hx = jx1; a0 = 90.0; a1 = 180.0; leaf_x = jx1
    end
    floor_sector(wg, "Door_Swing_KEEPOUT_floor", hx, 0.0, r, a0, a1, 0.02, 0.06, @mSWEEP, @l_clr)
    ab(wg, "Door_Ghost_Open90_KEEPOUT", leaf_x, 0, 0, DOOR_TH, r, DOOR_IN_H, @mLEAF, @l_clr)
  end

  # ===========================================================================
  #  DIMS / LABELS / SCENES
  # ===========================================================================
  def build_dims(g)
    e = @m.entities; return unless e.respond_to?(:add_dimension_linear)
    dim(e, @c[:br], @c[:bl], [0, 9, 0]); dim(e, @c[:fr], @c[:br], [9, 0, 0])
    dim(e, @c[:fl], @c[:fr], [0, -9, 0]); dim(e, @c[:bl], @c[:fl], [-9, 0, 0])
    dim(e, [@c[:br][0], @c[:br][1], 0], [@c[:br][0], @c[:br][1], CH], [9, 0, 0])
  rescue StandardError
  end

  def dim(e, a, b, off)
    e.add_dimension_linear(Geom::Point3d.new(a[0], a[1], a[2] || 0.0),
                           Geom::Point3d.new(b[0], b[1], b[2] || 0.0), Geom::Vector3d.new(*off))
  rescue StandardError
  end

  def build_labels(g)
    e = @m.entities; return unless e.respond_to?(:add_text)
    [["WALL 1 - back - #{frac(W1)}", mid(@c[:br], @c[:bl]), @l_w1],
     ["WALL 2 - right (datum) - #{frac(W2)}", mid(@c[:fr], @c[:br]), @l_w2],
     ["WALL 3 - front/door - #{frac(W3)}", mid(@c[:fl], @c[:fr]), @l_w3],
     ["WALL 4 - left (cabinets) - #{frac(W4)}", mid(@c[:bl], @c[:fl]), @l_w4]].each do |txt, p, lay|
      begin; t = e.add_text(txt, Geom::Point3d.new(p[0], p[1], 66.0)); t.layer = lay if t.respond_to?(:layer=); rescue StandardError; end
    end
  rescue StandardError
  end

  def build_scenes
    v = @m.active_view
    dcx = (@c[:fr][0] + @c[:fl][0]) / 2.0
    v.camera = Sketchup::Camera.new([dcx, -34.0, 64.0], [@cx, @cy + 6.0, 40.0], [0, 0, 1])
    @m.pages.add("Entry View")
    v.camera = Sketchup::Camera.new([FACE_X + 42.0, 46.0, 60.0], [0.0, 46.0, 46.0], [0, 0, 1])
    @m.pages.add("Wall 4 Elevation")
    cam = Sketchup::Camera.new([@cx, @cy, 320.0], [@cx, @cy, 0.0], [0, 1, 0]); cam.perspective = false
    v.camera = cam; @m.pages.add("Plan (Top)")
    v.camera = Sketchup::Camera.new([-46.0, -54.0, 96.0], [@cx, @cy, 30.0], [0, 0, 1]); v.zoom_extents
  rescue StandardError
  end

  # ===========================================================================
  #  LOW-LEVEL HELPERS
  # ===========================================================================
  def layer(n); @m.layers.add(n); end
  def gcm(n, r, gr, b, a = 255); ex = @m.materials[n]; return ex if ex; mt = @m.materials.add(n); mt.color = Sketchup::Color.new(r, gr, b, a); mt; end
  def set_color(l, r, gr, b); l.color = Sketchup::Color.new(r, gr, b) if l.respond_to?(:color=); rescue StandardError; end
  def sub(a, b); [a[0]-b[0], a[1]-b[1]]; end
  def dist(a, b); Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2); end
  def unit(v); l = Math.sqrt(v[0]**2 + v[1]**2); raise "zero wall" if l == 0; [v[0]/l, v[1]/l]; end
  def mid(a, b); [(a[0]+b[0])/2.0, (a[1]+b[1])/2.0]; end
  def frac(v)
    whole = v.floor; f = v - whole; return "#{whole}\"" if f < 1e-6
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
    defn = @m.definitions.add(name)
    f = defn.entities.add_face(corners.map { |c| Geom::Point3d.new(c[0], c[1], z) })
    f.reverse! if (thick > 0 && f.normal.z < 0) || (thick < 0 && f.normal.z > 0)
    f.pushpull(thick.abs)
    inst = g.entities.add_instance(defn, Geom::Transformation.new([0, 0, 0]))
    inst.name = name; inst.material = mat; inst.layer = layer; inst
  end

  def floor_sector(parent, name, cx, cy, r, a0, a1, z, thick, mat, layer, steps = 28)
    raise "#{name} bad" if r <= 0 || thick <= 0
    defn = @m.definitions.add(name); pts = [Geom::Point3d.new(cx, cy, 0.0)]
    (0..steps).each { |i| a = (a0 + (a1 - a0) * i / steps.to_f) * Math::PI / 180.0; pts << Geom::Point3d.new(cx + r*Math.cos(a), cy + r*Math.sin(a), 0.0) }
    f = defn.entities.add_face(pts); f.reverse! if f.normal.z < 0; f.pushpull(thick)
    inst = parent.entities.add_instance(defn, Geom::Transformation.new([0, 0, z]))
    inst.name = name; inst.material = mat; inst.layer = layer; inst
  end

  # disc facing +X (circle in Y-Z), extruded +X
  def disc_X(parent, name, xf, yc, zc, r, thick, mat, layer, seg = 32)
    defn = @m.definitions.add(name)
    pts = (0...seg).map { |i| a = 2*Math::PI*i/seg; Geom::Point3d.new(xf, yc + r*Math.cos(a), zc + r*Math.sin(a)) }
    f = defn.entities.add_face(pts); f.reverse! if f.normal.x < 0; f.pushpull(thick)
    inst = parent.entities.add_instance(defn, Geom::Transformation.new([0, 0, 0]))
    inst.name = name; inst.material = mat; inst.layer = layer; inst
  end

  # disc facing +Y (circle in X-Z), extruded +Y  (open door, swung to the side)
  def disc_Y(parent, name, yf, xc, zc, r, thick, mat, layer, seg = 32)
    defn = @m.definitions.add(name)
    pts = (0...seg).map { |i| a = 2*Math::PI*i/seg; Geom::Point3d.new(xc + r*Math.cos(a), yf, zc + r*Math.sin(a)) }
    f = defn.entities.add_face(pts); f.reverse! if f.normal.y < 0; f.pushpull(thick)
    inst = parent.entities.add_instance(defn, Geom::Transformation.new([0, 0, 0]))
    inst.name = name; inst.material = mat; inst.layer = layer; inst
  end

  # extrude an X-Z profile along +Y
  def extrude_Y(parent, name, prof_xz, y0, ylen, mat, layer)
    raise "#{name} bad ylen" if ylen <= 0
    defn = @m.definitions.add(name)
    f = defn.entities.add_face(prof_xz.map { |(x, z)| Geom::Point3d.new(x, y0, z) })
    f.reverse! if f.normal.y < 0; f.pushpull(ylen)
    inst = parent.entities.add_instance(defn, Geom::Transformation.new([0, 0, 0]))
    inst.name = name; inst.material = mat; inst.layer = layer; inst
  end

  def report
    bar = "=" * 74
    puts "\n#{bar}\n  LINDA LAUNDRY / MUDROOM  -  V04 (+ sink)  -  VALIDATION REPORT\n#{bar}"
    puts "[Method] Boxes built SQUARE; run set out perpendicular to wall 1. Out-of-square"
    puts "         lives in scribe fillers at the wall-1 & wall-3 ends (+ toe/back scribe),"
    puts "         run sized to the safe 93.25 depth. On install, trim a FILLER not a box."
    puts "         GATE before cutting: wall 4 x3 heights (smallest), 2 diagonals, W1<->W4"
    puts "         square, floor high point."
    puts "[Run]    W4, from wall-1 corner -> wall 3, all 30 3/8 deep except 21\" bench:"
    puts "         .75 filler | tower 12 (75+15 doors) | 1\" | LG WashTower 27 + upper |"
    puts "         1\" | tall storage 21 (two full-height doors) | bench #{frac(@bench_w)} | .75 filler."
    puts "[Uppers] 15\" tall band, bottoms #{frac(BREAK_Z)}, tops #{frac(CARC_TOP)}, FLUSH 30 3/8 deep"
    puts "         -> single crown line. Crown = light-walnut sprung cove (not flat trim)."
    puts "[Bench]  hinged lift-lid seat @ #{frac(BENCH_LID_Z)} + ~2\" cushion on top; shiplap"
    puts "         nickel-gap (~1/8\") light walnut behind, seat -> uppers."
    puts "[Washer] LG WashTower 27x74 3/8x30 3/8 REFERENCE; center control; washer+dryer"
    puts "         portholes; OPEN-door footprints + 55\" front clearance zone (hinge LEFT-"
    puts "         flag). >>> LG wants ~1\" side/rear clearance (modeled as reveals). <<<"
    puts "[Sink]   V04: 30\" base UNDER the window (wall 1), centered on the glass; single"
    puts "         16x18 undermount bowl + pull-down faucet; counter @ #{frac(SINK_CT_TOP)} tucks under"
    puts "         the sill (no trim rework). Clear of the washer door (hinged front, sits @ Y~53)."
    puts "         >>> Vent RELOCATED off wall 1 to the sink-base TOE-KICK register (re-route"
    puts "         the duct). Counter = light-walnut butcher block - SEAL well or use quartz. <<<"
    puts "[Color]  Light walnut throughout (doors, carcasses, crown, shiplap, counter)."
    puts "[Tags]   01_Carcasses 02_Doors_and_Faces 03_Bench_Lid_Cushion 05_Toe_Kicks_Fillers"
    puts "         05B_Crown 05C_Shiplap (cut list) | 06_Wall_* 08_Appliance 10_Clearance IGNORE."
    puts "[Confirm] W3 = #{frac(W3)} (first given 84 3/8). Vent W-vs-H. WashTower hinge sides."
    puts bar
  end
end

LindaLaundry_V04.run
