# Linda Laundry Room — SketchUp build (job brief)

This folder is the Linda laundry-room millwork job. Build script:
`linda_laundry_v01.rb`; field dims + decisions in `PROJECT_NOTES.md`.

## How I build (inherited — don't restate it here)
Follow Basem's living woodworking operating prompt; it's the source of truth for HOW I
build (ask slab vs shaker, then auto-apply my method) and for the SketchUp/OCL rules
that prevent errors. Loaded via the global `~/.claude/CLAUDE.md`, but load it here too:

@/Users/baseminany/Documents/Basem's Knowledge/Knowledge Base/wiki/woodworking-operating-prompt.md
@/Users/baseminany/Documents/Basem's Knowledge/Knowledge Base/wiki/sketchup-error-catalog.md

## This job's specifics (override defaults where they differ)
- Orientation is LOCKED (see `PROJECT_NOTES.md`): stand in the door, face wall 1, turn
  right → W1 back, W2 right (the "off wall 2" datum), W3 door, W4 left.
- V01 is the reference SHELL only (walls/floor/ceiling + window + vent + door + swing),
  all on `*_IGNORE` tags. Cabinetry, appliances, and door style (slab vs shaker) are the
  NEXT step and are Basem's call — ask, then auto-apply the method.
- Deliverable each time the model changes: verified `.rb` (ruby -c + mocked run) + the
  validation report. Don't ask me to restate the method.
