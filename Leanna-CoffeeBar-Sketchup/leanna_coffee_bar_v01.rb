# LEANNA PPC (PREP / COFFEE) - V4 CornerPullThrough  (Ahmed V25.8 idiom)
# =============================================================================
# CORNER STRATEGY: the inside corner is USED, not dead.
#  - BR_SinkCornerBridge = ONE back-run carcass spanning x 28.75..58.5. Open sink
#    center (no drawer box, plumbing cut-later) + OPEN RIGHT TUNNEL so the right-leg
#    trays can pass into the lower sink-corner void. Right face over the tunnel is a
#    FIXED false panel (not an operating door).
#  - RL_CornerPullThrough = right-leg unit: TWO low side-access pull-through trays
#    (low boxes to clear plumbing) + an upper FIXED false panel. Side-mount trays,
#    NOT the Blum 1.625 formula. 18" trays, VERIFY SLIDE HARDWARE before cutting.
#  - GHOST open-position trays + REF_PLUMBING_KEEP_OUT for collision checking.
#  - Two separate carcasses (NOT one giant L) joined on site with cleats.
# Fridge filler bumped to 3"; fridge recessed into the open wall = framed pocket,
# FIELD VERIFY / FRAMING REQUIRED. Shaker fronts (cope-and-stick). Counter 21 both runs.
# =============================================================================

module LeannaPPC_V4_Production
  extend self

  MASTER_NAME    = "Leanna_PPC_V4_Production"
  PREVIOUS_NAMES = ["Leanna_PPC_V2_Production", "Leanna_PPC_V1_Production", "Leanna_PPC_V3_Production",
                    "LEANNA_COFFEE_BAR_V01", "LEANNA_COFFEE_BAR", "LEANNA_BAR_V01", "LEANNA_COFFEE_BAR_V02"].freeze

  FRONT_THICK = 0.75
  FACE_GAP    = 0.125
  EDGE_REVEAL = 0.0625

  # SHAKER = Basem's 2-bit cope-and-stick method (Stumpy Nubs). Cope bit cuts the rail-end
  # stub tenons; profile/stick bit cuts the groove + a 15-deg inner-edge bevel. Frame = 3/4
  # paint-grade; panel = 1/2 MDF rabbeted to fit the groove and GLUED in (don't use 1/4).
  # Frame blanks stay rectangular here (the bevel/groove are router profiles, not cut sizes).
  SHK_W  = 1.75    # stile & rail width (Basem standard ~1-3/4)
  SHK_FT = 0.75    # frame stock thickness
  SHK_GD = 0.375   # tenon length / groove depth (set by the bit)
  SHK_PT = 0.5     # 1/2" MDF panel, glued
  SHK_PG = 0.0625  # 1/16 each way (panel -1/8 total per dimension for glue room)

  DRW_SIDE_T = 0.5; DRW_FB_DED = 1.625; DRW_DADO_D = 0.25
  DRW_DADO_Z0 = 0.5; DRW_DADO_Z1 = 1.0; DRW_BACK_UP = 0.5; DRW_BACK_GAP = 0.0625

  # Special side-access pull-through tray (NOT Blum). VERIFY SLIDE HARDWARE.
  TRAY_SIDE_T   = 0.5
  TRAY_BOX_H    = 3.5      # low box to clear plumbing
  TRAY_SLIDE    = 18.0
  TRAY_SIDE_CLR = 0.5      # side-mount clearance per side
  TRAY_OPEN     = 16.0     # ghost open-position pull distance

  TOE_H = 4.5; CARC_TOP = 34.5; CT_UNDER = 34.625; CT_TOP = 35.75
  CORNER_X = 58.5          # 79.5 - 21" counter depth
  FRIDGE_FILLER = 3.0

  def run
    m = Sketchup.active_model
    m.start_operation('Build Leanna PPC V4', true)
    begin
      (([MASTER_NAME] + PREVIOUS_NAMES)).each do |nm|
        m.entities.grep(Sketchup::Group).each { |e| e.erase! if e.name == nm }
        m.entities.grep(Sketchup::ComponentInstance).each { |e| e.erase! if e.name == nm }
      end
      m.definitions.purge_unused
      @defcache = {}
      g = m.entities.add_group; g.name = MASTER_NAME

      @l_car  = m.layers.add("01_Carcasses")
      @l_fac  = m.layers.add("02_Doors_and_Faces")
      @l_drw  = m.layers.add("03_Drawer_Boxes")
      @l_tray = m.layers.add("03B_Special_Corner_PullThrough_Trays")
      @l_shl  = m.layers.add("04_Walnut_Shelves_SHOP")
      @l_toe  = m.layers.add("05_Toe_Kicks_Fillers_SITE")
      @l_env  = m.layers.add("06_Environment_IGNORE")
      @l_brs  = m.layers.add("07_Brass_Hardware")
      @l_app  = m.layers.add("08_Appliance_Reference_IGNORE")
      @l_ct   = m.layers.add("09_Countertop_Reference_IGNORE")
      @l_clr  = m.layers.add("10_Clearance_Check_IGNORE")
      set_color(@l_fac, 140, 137, 124); set_color(@l_tray, 150, 110, 60); set_color(@l_clr, 220, 60, 60)
      set_color(@l_shl, 120, 80, 50); set_color(@l_toe, 90, 140, 220)

      @mCAR  = gcm("3_4_UV_Single", 196, 172, 132)
      @mSHL  = gcm("3_4_UV_Double", 206, 182, 142)
      @mDRW  = gcm("1_2_UV_Drawer", 216, 192, 152)
      @mTRAY = gcm("1_2_Tray_Ply_SideMount", 210, 185, 140)
      @mBACK = gcm("1_4_Backing", 210, 190, 150)
      @mRG  = gcm("BM_Rockport_Gray_HC105_Front_3_4", 140, 137, 124)
      @mRGP = gcm("BM_Rockport_Gray_HC105_Panel_1_2_MDF", 146, 143, 130)
      @mBRS  = gcm("Brass_Hardware", 196, 150, 70)
      @mWAL  = gcm("Walnut_Veneer_3_4", 92, 60, 38)
      @mWALL = gcm("Wall_IGNORE", 248, 248, 246)
      @mFLR  = gcm("Floor_Oak_IGNORE", 198, 172, 140)
      @mGL   = gcm("Glass_IGNORE", 165, 200, 218, 120)
      @mCT   = gcm("REF_Quartz_Reused_BY_FABRICATOR_IGNORE", 224, 222, 216)
      @mAP   = gcm("REF_Appliance_Zephyr_IGNORE", 120, 120, 126)
      @mKEEP = gcm("REF_Plumbing_KeepOut_IGNORE", 220, 40, 40, 110)
      @mGHOST = gcm("REF_Ghost_OpenTray_IGNORE", 120, 160, 220, 95)

      build_shell(g); build_counter(g); build_back_run(g); build_right_leg(g); build_walnut_shelves(g)
      m.commit_operation
    rescue => e
      m.abort_operation; raise e
    end
    set_view; report
  end

  def set_view
    v = Sketchup.active_model.active_view
    v.camera = Sketchup::Camera.new([-18.0, -28.0, 82.0], [42.0, 42.0, 24.0], [0, 0, 1])
    v.zoom_extents
  rescue StandardError
  end

  # ---------------------------------------------------------------- ROOM SHELL
  def build_shell(g)
    wt = 5.0; rw = 79.5; dp = 74.625; rh = 108.0
    ab(g, "Floor", 0, 0, -2, rw, dp, 2, @mFLR, @l_env)
    ab(g, "Wall_Window_Below", 0, dp, 0, rw, wt, 42, @mWALL, @l_env)
    ab(g, "Wall_Window_Above", 0, dp, 88.75, rw, wt, rh - 88.75, @mWALL, @l_env)
    ab(g, "Wall_Window_L", 0, dp, 42, 21.75, wt, 46.75, @mWALL, @l_env)
    ab(g, "Wall_Window_R", 56.75, dp, 42, rw - 56.75, wt, 46.75, @mWALL, @l_env)
    ab(g, "Window_Glass_IGNORE", 21.75, dp + 2, 42, 35, 1, 46.75, @mGL, @l_env)
    ab(g, "Wall_Accent_Left", -wt, 0, 0, wt, dp, rh, @mWALL, @l_env)
    ab(g, "Wall_Entry_Jamb_7-3-8", 0, 0, 0, 7.375, wt, rh, @mWALL, @l_env)
    # open wall + fridge stud pocket (filler is now 3", fridge at Y 9..32.875)
    fy0 = 6.0 + FRIDGE_FILLER; fy1 = fy0 + 23.875                # 9 .. 32.875
    ab(g, "Wall_Open_EntryReturn", rw, 0, 0, wt, 6, rh, @mWALL, @l_env)
    ab(g, "Wall_Open_WinReturn", rw, 54.375, 0, wt, dp - 54.375, rh, @mWALL, @l_env)
    ab(g, "Wall_Open_AbovePass", rw, 6, 96, wt, 48.375, rh - 96, @mWALL, @l_env)
    ab(g, "Wall_BelowPass_PreFridge", rw, 6, 0, wt, fy0 - 6, 44.25, @mWALL, @l_env)
    ab(g, "Wall_BelowPass_PostFridge", rw, fy1, 0, wt, 54.375 - fy1, 44.25, @mWALL, @l_env)
    ab(g, "Wall_BelowPass_BehindFridge_STUDS_CUT", 82.25, fy0, 0, rw + wt - 82.25, fy1 - fy0, 44.25, @mWALL, @l_env)
    ab(g, "Wall_BelowPass_AboveFridge", rw, fy0, 35, wt, fy1 - fy0, 44.25 - 35, @mWALL, @l_env)
    # framed recess reference (FRAMING REQUIRED / FIELD VERIFY)
    ab(g, "SITE_Fridge_RecessFrame_Head_FRAMING_REQUIRED", rw, fy0 - 1.5, 35, 2.75, fy1 - fy0 + 3.0, 1.5, @mWALL, @l_toe)
    ab(g, "SITE_Fridge_RecessFrame_JambE_FRAMING_REQUIRED", rw, fy0 - 1.5, 0, 2.75, 1.5, 35, @mWALL, @l_toe)
    ab(g, "SITE_Fridge_RecessFrame_JambW_FRAMING_REQUIRED", rw, fy1, 0, 2.75, 1.5, 35, @mWALL, @l_toe)
    # half wall + cap (27-3/4 per field dim - CONFIRM vs 21 counter)
    ab(g, "HalfWall_Body", 51.75, 0, 0, 27.75, 6, 42.125, @mWALL, @l_env)
    ab(g, "HalfWall_TrimCap", 51.0, -0.5, 42.125, 28.5, 7.0, 2.125, @mWALL, @l_env)
    ab(g, "Wall_Entry_Header", 7.375, 0, 96, rw - 7.375, wt, rh - 96, @mWALL, @l_env)
  end

  # ---------------------------------------------------------------- COUNTERTOP (ref)
  def build_counter(g)
    ab(g, "REF_Quartz_BackRun_BY_FABRICATOR", 0, 53.625, CT_UNDER, CORNER_X, 21.0, 1.125, @mCT, @l_ct)
    ab(g, "REF_Quartz_RightLeg_BY_FABRICATOR", CORNER_X, 6.0, CT_UNDER, 21.0, 68.625, 1.125, @mCT, @l_ct)
    ab(g, "REF_Quartz_Splash_Win_BY_FABRICATOR", 0, 73.5, CT_TOP, CORNER_X, 1.125, 4.0, @mCT, @l_ct)
  end

  # ---------------------------------------------------------------- BACK RUN
  def build_back_run(g)
    dp = 74.625; carc_d = 20.25; y_carc = dp - carc_d; y_face = y_carc - FRONT_THICK
    h = CARC_TOP - TOE_H; win_c = 39.25

    # toe kick runs the back run AND turns the inside corner to meet the right-leg toe
    # (right-leg toe sits at x = 58.5 + 3" setback .. 62.25; extend to 62.25 so they join)
    ab(g, "BR_ToeKick_Continuous_to_Corner", 0, y_face + 3.0, 0, CORNER_X + 3.75, FRONT_THICK, TOE_H, @mRG, @l_toe)
    ab(g, "Fill_Accent_3-4", 0, y_face, TOE_H, 2.0, FRONT_THICK, h, @mRG, @l_toe)

    # graduated 3-drawer base  x 2..28.75
    base_y(g, "BR_Drawers", 2.0, y_carc, TOE_H, 26.75, carc_d, h, 0)
    [[4.5625, 13.0], [17.6875, 10.0], [27.8125, 6.625]].each_with_index do |(z0, fh), i|
      shaker(g, "BR_Drw_#{i+1}", :y, 2.0625, z0, 26.625, fh, y_face)
      pull_bar(g, "BR_Drw_Pull_#{i+1}", 2.0625 + 26.625/2.0 - 4.0, y_face - 0.75, z0 + fh/2.0, :horiz_y, 8.0)
      drawer_box_Y(g, "BR_Box_#{i+1}", 2.75, y_carc + 0.5, z0, 26.75 - 1.5, carc_d - 1.5, [fh - 1.5, 3.5].max)
    end

    # ===== SINK-CORNER BRIDGE  (one carcass, open sink center + open right tunnel) =====
    bx0 = 28.75; bx1 = CORNER_X; bw = bx1 - bx0     # 29.75
    sink_x1 = 49.75
    ab(g, "BR_Bridge_SideL", bx0, y_carc, TOE_H, 0.75, carc_d, h, @mCAR, @l_car)
    ab(g, "BR_Bridge_SideR_Upper_TUNNEL_BELOW", bx1 - 0.75, y_carc, 25.0, 0.75, carc_d, CARC_TOP - 25.0, @mCAR, @l_car)
    ab(g, "BR_Bridge_FrontRail_CounterSupport", bx0 + 0.75, y_carc, CARC_TOP - 3.0, bw - 1.5, 3.0, 0.75, @mCAR, @l_car)
    ab(g, "BR_Bridge_RearRail_Nailer", bx0 + 0.75, y_carc + carc_d - 1.0, CARC_TOP - 3.0, bw - 1.5, 0.75, 3.0, @mCAR, @l_car)
    ab(g, "BR_Bridge_SinkCleat_FL_SHOP", bx0 + 0.75, y_carc, CARC_TOP - 3.75, 3.0, 3.0, 0.75, @mCAR, @l_car)
    ab(g, "BR_Bridge_SinkCleat_BL_SHOP", bx0 + 0.75, y_carc + carc_d - 3.25, CARC_TOP - 3.75, 3.0, 3.0, 0.75, @mCAR, @l_car)
    ab(g, "BR_Bridge_Back_PLUMBING_CUT_LATER", bx0 + 0.75, y_carc + carc_d - 0.25, TOE_H, sink_x1 - bx0 - 1.5, 0.25, h, @mBACK, @l_car)
    ab(g, "BR_Bridge_CornerCounterSupport_SHOP", bx1 - 6.0, y_carc + carc_d - 3.0, CARC_TOP - 0.75, 5.25, 3.0, 0.75, @mCAR, @l_car)

    # FACE: sink (faux top + 2 doors) then FIXED false panel over the corner/tunnel.
    shaker(g, "BR_Sink_FauxTop", :y, bx0 + 0.0625, 27.9375, 21.0 - 0.125, 6.4375, y_face)
    sd = (21.0 - 0.125 - FACE_GAP) / 2.0
    shaker(g, "BR_Sink_DoorL", :y, bx0 + 0.0625, TOE_H + 0.0625, sd, 23.25, y_face)        # 1/8 gap to faux top
    shaker(g, "BR_Sink_DoorR", :y, bx0 + 0.0625 + sd + FACE_GAP, TOE_H + 0.0625, sd, 23.25, y_face)
    pull_bar(g, "BR_Sink_PullL", bx0 + 0.0625 + sd - 1.5, y_face - 0.75, 16.0, :vert, 5.0)
    pull_bar(g, "BR_Sink_PullR", bx0 + 0.0625 + sd + FACE_GAP + 1.0, y_face - 0.75, 16.0, :vert, 5.0)
    fp_x0 = sink_x1 + FACE_GAP
    shaker(g, "BR_Corner_FIXED_FalsePanel", :y, fp_x0, TOE_H + 0.0625, bx1 - fp_x0 - EDGE_REVEAL, h - 0.125, y_face)

    # sink bowl + faucet (reference) + plumbing keep-out (z 18.5..28 = trap zone)
    bowl_back = dp - (1.125 + 1.5)   # 72.0
    ab(g, "REF_SINK_Bowl_16x13_UNDERMOUNT", win_c - 8.0, bowl_back - 13.0, CT_UNDER - 7.0, 16.0, 13.0, 7.0, @mGL, @l_env)
    ab(g, "REF_SINK_Faucet", win_c - 1.0, bowl_back - 0.5, CT_TOP, 2.0, 2.0, 9.0, @mBRS, @l_env)
    @keepout = [32.25, 46.25, 60.0, 72.0, 18.5, 28.0]
    ab(g, "REF_PLUMBING_KEEP_OUT", 32.25, 60.0, 18.5, 14.0, 12.0, 9.5, @mKEEP, @l_clr)
  end

  # ---------------------------------------------------------------- RIGHT LEG
  def build_right_leg(g)
    rw = 79.5; carc_d = 20.25; x_carc = rw - carc_d; x_face = x_carc - FRONT_THICK
    h = CARC_TOP - TOE_H; ff = FRIDGE_FILLER

    ab(g, "RL_ToeKick_Continuous", x_face + 3.0, 32.875, 0, FRONT_THICK, 74.625 - 32.875, TOE_H, @mRG, @l_toe)
    ab(g, "RL_ToeKick_Return_FridgeEnd", x_face, 32.875, 0, 3.0, FRONT_THICK, TOE_H, @mRG, @l_toe)
    ab(g, "Fill_HalfWall_3in", x_face, 6.0, TOE_H, FRONT_THICK, ff, h, @mRG, @l_toe)

    build_fridge(g, x_face, x_carc)

    # shelf cab (left of fridge) y 32.875..53.625 : 2 adjustable shelves + 2 shaker doors
    scy = 6.0 + ff + 23.875; scw = 53.625 - scy
    base_x(g, "RL_ShelfCab", x_carc, scy, TOE_H, carc_d, scw, h, 2)
    sdw = (scw - 0.125 - FACE_GAP) / 2.0
    shaker(g, "RL_ShelfCab_DoorL", :x, scy + 0.0625, TOE_H + 0.0625, sdw, 29.875, x_face)
    shaker(g, "RL_ShelfCab_DoorR", :x, scy + 0.0625 + sdw + FACE_GAP, TOE_H + 0.0625, sdw, 29.875, x_face)
    pull_bar(g, "RL_ShelfCab_PullL", x_face - 0.75, scy + 0.0625 + sdw - 1.5, 19.5, :vert, 5.0)
    pull_bar(g, "RL_ShelfCab_PullR", x_face - 0.75, scy + 0.0625 + sdw + FACE_GAP + 1.0, 19.5, :vert, 5.0)

    # ===== RL_CornerPullThrough : 2 low pull-through trays + upper FIXED false panel =====
    cy = 53.625; cw = 21.0
    ab(g, "RL_PT_SideF", x_carc, cy, TOE_H, carc_d, 0.75, h, @mCAR, @l_car)
    ab(g, "RL_PT_SideB", x_carc, cy + cw - 0.75, TOE_H, carc_d, 0.75, h, @mCAR, @l_car)
    ab(g, "RL_PT_Bottom", x_carc, cy + 0.75, TOE_H, carc_d - 0.25, cw - 1.5, 0.75, @mCAR, @l_car)
    ab(g, "RL_PT_StretchF", x_carc, cy + 0.75, CARC_TOP - 0.75, 3, cw - 1.5, 0.75, @mCAR, @l_car)
    ab(g, "RL_PT_NailerR", x_carc + carc_d - 1.0, cy + 0.75, CARC_TOP - 3.75, 0.75, cw - 1.5, 3, @mCAR, @l_car)
    ab(g, "RL_PT_Back", x_carc + carc_d - 0.25, cy + 0.75, TOE_H, 0.25, cw - 1.5, h, @mBACK, @l_car)

    open_y = cy + 0.75; open_w = cw - 1.5
    lz = TOE_H + 0.0625                                  # 4.5625
    uz = lz + 10.0 + FACE_GAP                            # 14.6875
    fpz = uz + 10.0 + FACE_GAP                           # 24.8125
    # lower pull-through tray
    shaker(g, "RL_PT_LowerTray_Front", :x, cy + 0.0625, lz, cw - 0.125, 10.0, x_face)
    pull_bar(g, "RL_PT_LowerTray_Pull", x_face - 0.75, cy + cw/2.0 - 4.0, lz + 5.0, :horiz_x, 8.0)
    tray_box_X_side_mount(g, "RL_PT_LowerTrayBox", x_carc, open_y, lz, open_w, TRAY_SLIDE, TRAY_BOX_H)
    @ghost_lo = ghost_tray_X(g, "GHOST_Open_LowerTray_CLEARANCE_CHECK", x_carc, open_y, lz, open_w, TRAY_SLIDE, TRAY_BOX_H)
    # upper pull-through tray
    shaker(g, "RL_PT_UpperTray_Front", :x, cy + 0.0625, uz, cw - 0.125, 10.0, x_face)
    pull_bar(g, "RL_PT_UpperTray_Pull", x_face - 0.75, cy + cw/2.0 - 4.0, uz + 5.0, :horiz_x, 8.0)
    tray_box_X_side_mount(g, "RL_PT_UpperTrayBox", x_carc, open_y, uz, open_w, TRAY_SLIDE, TRAY_BOX_H)
    @ghost_up = ghost_tray_X(g, "GHOST_Open_UpperTray_CLEARANCE_CHECK", x_carc, open_y, uz, open_w, TRAY_SLIDE, TRAY_BOX_H)
    # upper FIXED false panel (hides/clears plumbing zone above the trays)
    shaker(g, "RL_PT_Upper_FIXED_FalsePanel_PlumbClear", :x, cy + 0.0625, fpz, cw - 0.125, CARC_TOP - 0.0625 - fpz, x_face)
  end

  # ---------------------------------------------------------------- ZEPHYR
  def build_fridge(g, x_face, x_carc)
    fw = 23.875; fh_b = 33.875; fd_total = 23.75; pt = FRONT_THICK
    fy0 = 6.0 + FRIDGE_FILLER; fz = CARC_TOP - fh_b
    ab(g, "REF_Zephyr_PRB24C01CPG_Body_FIELDVERIFY", x_carc, fy0, fz, fd_total - pt, fw, fh_b, @mAP, @l_app)
    pw = 23.625; ph = 29.875; rail = 3.0; py = fy0 + (fw - pw) / 2.0; pz = fz + (fh_b - ph); gx = x_face
    ab(g, "Fridge_Panel_StileHinge_ENTRY", gx, py, pz, pt, rail, ph, @mRG, @l_fac)
    ab(g, "Fridge_Panel_StileHandle_WINDOW", gx, py + pw - rail, pz, pt, rail, ph, @mRG, @l_fac)
    ab(g, "Fridge_Panel_RailBottom", gx, py + rail, pz, pt, pw - 2*rail, rail, @mRG, @l_fac)
    ab(g, "Fridge_Panel_RailTop_Cope_Groove15Bevel", gx, py + rail, pz + ph - rail, pt, pw - 2*rail, rail, @mRG, @l_fac)
    ab(g, "Fridge_Glass_SEE_THROUGH", gx + 0.25, py + rail, pz + rail, 0.25, pw - 2*rail, ph - 2*rail, @mGL, @l_app)
    pull_bar(g, "Fridge_Handle_Brass_LEFT", gx - pt, py + pw - rail/2.0 - 0.375, pz + ph/2.0, :vert, 14.0)
  end

  def build_walnut_shelves(g)
    sd = 8.0; t = 1.0
    [46.0, 60.0, 74.0].each_with_index do |z, i|
      ab(g, "Walnut_AccentShelf_#{i+1}", 0, 22.0, z, sd, 30.0, t, @mWAL, @l_shl, 'v')
      ab(g, "Brass_AccBrkt_#{i+1}a", 0, 23.0, z - 1.0, sd - 1.0, 1.0, 1.0, @mBRS, @l_brs)
      ab(g, "Brass_AccBrkt_#{i+1}b", 0, 50.0, z - 1.0, sd - 1.0, 1.0, 1.0, @mBRS, @l_brs)
    end
    aw = 17.75
    [CT_TOP + 14.0, CT_TOP + 28.0].each_with_index do |z, i|
      ab(g, "Walnut_WinShelf_#{i+1}", 2.0, 74.625 - sd, z, aw, sd, t, @mWAL, @l_shl, 'h')
    end
  end

  # ---------------------------------------------------------------- 5-PIECE SHAKER
  def shaker(g, name, axis, a0, h0, aw, hh, face)
    rl = aw - 2*SHK_W + 2*SHK_GD
    pa = aw - 2*SHK_W + 2*SHK_GD - 2*SHK_PG
    pb = hh - 2*SHK_W + 2*SHK_GD - 2*SHK_PG
    pf = face + (SHK_FT - SHK_PT) / 2.0
    if rl <= 0 || pa <= 0 || pb <= 0
      puts "  *FLAG: #{name} too small for a 5-piece shaker (#{aw} x #{hh}) - use a slab or narrow the rails."
      return
    end
    if axis == :y
      ab(g, "#{name}_StileL_StickGroove15Bevel", a0, face, h0, SHK_W, SHK_FT, hh, @mRG, @l_fac, 'v')
      ab(g, "#{name}_StileR_StickGroove15Bevel", a0 + aw - SHK_W, face, h0, SHK_W, SHK_FT, hh, @mRG, @l_fac, 'v')
      ab(g, "#{name}_RailBot_Cope_Groove15Bevel", a0 + SHK_W - SHK_GD, face, h0, rl, SHK_FT, SHK_W, @mRG, @l_fac, 'h')
      ab(g, "#{name}_RailTop_Cope_Groove15Bevel", a0 + SHK_W - SHK_GD, face, h0 + hh - SHK_W, rl, SHK_FT, SHK_W, @mRG, @l_fac, 'h')
      ab(g, "#{name}_Panel_1_2_MDF_15degBevel_Glued", a0 + SHK_W - SHK_GD + SHK_PG, pf, h0 + SHK_W - SHK_GD + SHK_PG, pa, SHK_PT, pb, @mRGP, @l_fac)
    else
      ab(g, "#{name}_StileL_StickGroove15Bevel", face, a0, h0, SHK_FT, SHK_W, hh, @mRG, @l_fac, 'v')
      ab(g, "#{name}_StileR_StickGroove15Bevel", face, a0 + aw - SHK_W, h0, SHK_FT, SHK_W, hh, @mRG, @l_fac, 'v')
      ab(g, "#{name}_RailBot_Cope_Groove15Bevel", face, a0 + SHK_W - SHK_GD, h0, SHK_FT, rl, SHK_W, @mRG, @l_fac, 'h')
      ab(g, "#{name}_RailTop_Cope_Groove15Bevel", face, a0 + SHK_W - SHK_GD, h0 + hh - SHK_W, SHK_FT, rl, SHK_W, @mRG, @l_fac, 'h')
      ab(g, "#{name}_Panel_1_2_MDF_15degBevel_Glued", pf, a0 + SHK_W - SHK_GD + SHK_PG, h0 + SHK_W - SHK_GD + SHK_PG, SHK_PT, pa, pb, @mRGP, @l_fac)
    end
  end

  # ---------------------------------------------------------------- SIDE-MOUNT TRAY BOX (NOT Blum)
  # Low pull-through tray on side-mount slides.  box width = opening - 2*side clearance.
  def tray_box_X_side_mount(g, name, x_carc, y_open, z, opening_y, slide_x, box_h)
    bw = opening_y - 2*TRAY_SIDE_CLR
    y0 = y_open + TRAY_SIDE_CLR; st = TRAY_SIDE_T
    ab(g, "#{name}_SideL_SideMount", x_carc, y0, z, slide_x, st, box_h, @mTRAY, @l_tray)
    ab(g, "#{name}_SideR_SideMount", x_carc, y0 + bw - st, z, slide_x, st, box_h, @mTRAY, @l_tray)
    ab(g, "#{name}_Front", x_carc, y0 + st, z, st, bw - 2*st, box_h, @mTRAY, @l_tray)
    ab(g, "#{name}_Back", x_carc + slide_x - st, y0 + st, z, st, bw - 2*st, box_h, @mTRAY, @l_tray)
    ab(g, "#{name}_Bottom_1_2", x_carc + st, y0 + st, z, slide_x - 2*st, bw - 2*st, 0.5, @mTRAY, @l_tray)
    [x_carc, x_carc + slide_x, y0, y0 + bw, z, z + box_h]
  end

  # ghost tray = same box shifted -X by TRAY_OPEN; reference only (layer 10), returns bounds
  def ghost_tray_X(g, name, x_carc, y_open, z, opening_y, slide_x, box_h)
    bw = opening_y - 2*TRAY_SIDE_CLR; y0 = y_open + TRAY_SIDE_CLR; gx = x_carc - TRAY_OPEN
    ab(g, "#{name}", gx, y0, z, slide_x, bw, box_h, @mGHOST, @l_clr)
    [gx, gx + slide_x, y0, y0 + bw, z, z + box_h]
  end

  # ---------------------------------------------------------------- OCL-NATIVE HELPERS
  def gcm(n, r, gr, b, a = 255)
    ex = Sketchup.active_model.materials[n]; return ex if ex
    mt = Sketchup.active_model.materials.add(n); mt.color = Sketchup::Color.new(r, gr, b, a); mt
  end
  def set_color(layer, r, gr, b); layer.color = Sketchup::Color.new(r, gr, b) if layer.respond_to?(:color=); rescue StandardError; end

  # def cache keyed by size + MATERIAL + LAYER(role) + GRAIN so reference items and
  # different-material parts never share a definition (OCL hygiene).
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

  def pull_bar(g, name, x, y, zc, dir, len)
    case dir
    when :horiz_y then ab(g, name, x, y, zc - 0.375, len, 0.75, 0.75, @mBRS, @l_brs)
    when :horiz_x then ab(g, name, x, y, zc - 0.375, 0.75, len, 0.75, @mBRS, @l_brs)
    when :vert    then ab(g, name, x, y, zc - len/2.0, 0.75, 0.75, len, @mBRS, @l_brs)
    end
  end

  def base_y(g, name, x, y, z, w, d, h, shelves)
    ab(g, "#{name}_SideL", x, y, z, 0.75, d, h, @mCAR, @l_car, 'v')
    ab(g, "#{name}_SideR", x + w - 0.75, y, z, 0.75, d, h, @mCAR, @l_car, 'v')
    ab(g, "#{name}_Bottom", x + 0.75, y, z, w - 1.5, d - 0.25, 0.75, @mCAR, @l_car, 'h')
    ab(g, "#{name}_StretchF", x + 0.75, y, z + h - 0.75, w - 1.5, 3, 0.75, @mCAR, @l_car, 'h')
    ab(g, "#{name}_NailerR", x + 0.75, y + d - 1.0, z + h - 3.75, w - 1.5, 0.75, 3, @mCAR, @l_car, 'h')
    ab(g, "#{name}_Back", x + 0.75, y + d - 0.25, z, w - 1.5, 0.25, h, @mBACK, @l_car, 'v')
    shelves.times { |i| ab(g, "#{name}_AdjShelf_#{i+1}", x + 0.8125, y + 0.25, z + (i+1)*(h/(shelves+1.0)), w - 1.625, d - 0.5, 0.75, @mSHL, @l_car, 'h') }
  end

  def base_x(g, name, x, y, z, d, w, h, shelves)
    ab(g, "#{name}_SideF", x, y, z, d, 0.75, h, @mCAR, @l_car, 'v')
    ab(g, "#{name}_SideB", x, y + w - 0.75, z, d, 0.75, h, @mCAR, @l_car, 'v')
    ab(g, "#{name}_Bottom", x, y + 0.75, z, d - 0.25, w - 1.5, 0.75, @mCAR, @l_car, 'h')
    ab(g, "#{name}_StretchF", x, y + 0.75, z + h - 0.75, 3, w - 1.5, 0.75, @mCAR, @l_car, 'h')
    ab(g, "#{name}_NailerR", x + d - 1.0, y + 0.75, z + h - 3.75, 0.75, w - 1.5, 3, @mCAR, @l_car, 'h')
    ab(g, "#{name}_Back", x + d - 0.25, y + 0.75, z, 0.25, w - 1.5, h, @mBACK, @l_car, 'v')
    shelves.times { |i| ab(g, "#{name}_AdjShelf_#{i+1}", x + 0.25, y + 0.8125, z + (i+1)*(h/(shelves+1.0)), d - 0.5, w - 1.625, 0.75, @mSHL, @l_car, 'h') }
  end

  def milled(parent, name, pts, rev, push, x, y, z, lay)
    raise "#{name} bad push #{push}" if push <= 0
    defn = Sketchup.active_model.definitions.add(name)
    f = defn.entities.add_face(pts)
    f.reverse! if (rev == :y && f.normal.y < 0) || (rev == :x && f.normal.x < 0)
    f.pushpull(push)
    inst = parent.entities.add_instance(defn, Geom::Transformation.new([x, y, z]))
    inst.name = name; inst.material = @mDRW; inst.layer = lay; inst
  end

  def drawer_box_Y(g, name, x_open, y, z, opening_w, slide_l, hh)
    st = DRW_SIDE_T; gd = DRW_DADO_D; bw = opening_w - DRW_FB_DED
    x = x_open + (opening_w - bw) / 2.0; sl = slide_l - 2*st
    fF = [[0,0,0],[0,st,0],[0,st,DRW_DADO_Z0],[0,gd,DRW_DADO_Z0],[0,gd,DRW_DADO_Z1],[0,st,DRW_DADO_Z1],[0,st,hh],[0,0,hh]]
    milled(g, "#{name}_Front_FullW_Dado", fF, :x, bw, x, y, z, @l_drw)
    ab(g, "#{name}_Back_FullW_Raised", x, y + slide_l - st, z + DRW_BACK_UP, bw, st, hh - DRW_BACK_UP, @mDRW, @l_drw)
    lL = [[0,0,0],[st,0,0],[st,0,DRW_DADO_Z0],[gd,0,DRW_DADO_Z0],[gd,0,DRW_DADO_Z1],[st,0,DRW_DADO_Z1],[st,0,hh],[0,0,hh]]
    milled(g, "#{name}_SideL_Captured", lL, :y, sl, x, y + st, z, @l_drw)
    lR = [[0,0,0],[st,0,0],[st,0,hh],[0,0,hh],[0,0,DRW_DADO_Z1],[st-gd,0,DRW_DADO_Z1],[st-gd,0,DRW_DADO_Z0],[0,0,DRW_DADO_Z0]]
    milled(g, "#{name}_SideR_Captured", lR, :y, sl, x + bw - st, y + st, z, @l_drw)
    fw = bw - 2*st + 2*gd; fd = (slide_l - st - DRW_BACK_GAP) - (st - gd)
    ab(g, "#{name}_Floor_3SidedDado", x + st - gd, y + st - gd, z + DRW_DADO_Z0, fw, fd, 0.5, @mDRW, @l_drw)
  end

  def report
    bar = "=" * 72
    puts "\n#{bar}\n  LEANNA PPC  V4 CornerPullThrough  -  VALIDATION REPORT\n#{bar}"
    puts "[Corner] USED, not dead. BR_SinkCornerBridge (x 28.75..58.5) = open sink center +"
    puts "         OPEN RIGHT TUNNEL; right face is a FIXED false panel. RL_CornerPullThrough ="
    puts "         2 low side-access pull-through trays + upper FIXED false panel. Two carcasses,"
    puts "         joined on site (NOT one giant L)."
    puts "[Trays] Side-mount (NOT Blum). Box width = opening - 2x#{TRAY_SIDE_CLR}; low box #{TRAY_BOX_H}; #{TRAY_SLIDE}\" slide."
    puts "        >>> VERIFY SLIDE HARDWARE AND CLEARANCES BEFORE CUTTING. <<<"
    if @keepout && @ghost_lo && @ghost_up
      lo = overlap?(@ghost_lo, @keepout); up = overlap?(@ghost_up, @keepout)
      puts "[Collision] open LOWER tray vs plumbing keep-out: #{lo ? '*** CONFLICT - lower/shorten ***' : 'CLEAR'}"
      puts "[Collision] open UPPER tray vs plumbing keep-out: #{up ? '*** CONFLICT - lower/shorten/convert to false panel ***' : 'CLEAR'}"
      puts "            (keep-out z 18.5..28 = trap zone; trays sit low below it. FIELD VERIFY trap location.)"
    end
    puts "[Sink] 16x13 undermount centered on window. Open-center support, plumbing back CUT_LATER."
    puts "       Fixed sink-doors reveal = 1/8 to faux top (reveal bug fixed)."
    puts "[Fridge] Filler 3\". Recessed into open wall = framed pocket FRAMING_REQUIRED / FIELD VERIFY."
    puts "[Doors] SHAKER 2-bit cope-and-stick: #{SHK_W} stiles/rails (3/4), #{SHK_PT}\" MDF panel GLUED,"
    puts "        #{SHK_GD} tenon/groove + 15-deg inner bevel. Frame blanks rectangular for OCL."
    puts "[OCL] def-cache keyed by size+material+layer+grain. Cut tags: 01,02,03,03B. Walnut SHOP=04."
    puts "      IGNORE (not cutlist): 06,08,09,10. Toe/fillers SITE=05. Hardware=07."
    puts "[CONFIRM] Half wall 27-3/4 vs 21 counter -> step at entry. Confirm what 27-3/4 measures."
    puts bar
  end

  def overlap?(a, b)
    a[0] < b[1] && a[1] > b[0] && a[2] < b[3] && a[3] > b[2] && a[4] < b[5] && a[5] > b[4]
  end
end

LeannaPPC_V4_Production.run
