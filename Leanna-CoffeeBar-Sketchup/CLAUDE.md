# Leanna Coffee Bar — SketchUp build (job brief)

This folder is the Leanna coffee/beverage-bar millwork job. Build script:
`leanna_coffee_bar_v01.rb`; field dims + decisions in `PROJECT_NOTES.md`.

## How I build (inherited — don't restate it here)
Follow Basem's living woodworking operating prompt; it's the source of truth for HOW I
build (ask slab vs shaker, then auto-apply my method), and for the SketchUp/OCL rules
that prevent errors. It's already loaded via the global `~/.claude/CLAUDE.md`, but load
it explicitly here too:

@/Users/baseminany/Documents/Basem's Knowledge/Knowledge Base/wiki/woodworking-operating-prompt.md
@/Users/baseminany/Documents/Basem's Knowledge/Knowledge Base/wiki/job-leanna-coffee-bar.md

## This job's specifics (override the defaults where they differ)
- Fronts for Leanna are **navy painted slab** (per job-leanna-coffee-bar) unless I say
  shaker for a given piece.
- All other dims, the corner bridge + pull-through trays, the Zephyr fridge pocket, and
  open questions live in `PROJECT_NOTES.md` — treat it as source of truth for this job.
- Deliverable each time the model changes: the OpenCutList-ready cut list + validation
  report, per the operating prompt. Don't ask me to restate the method.
