
## Knowledge base (shared across all of Basem's AI tools)

Basem maintains a self-improving knowledge base (an Obsidian vault) that is the shared
source of truth across Cowork, claude.ai, and Claude Code. Read its index at the start
of work so you have full context on his businesses, shop conventions, and decisions:

@/Users/baseminany/Documents/Basem's Knowledge/Knowledge Base/wiki/index.md

The vault's own operating rules live in its CLAUDE.md
(/Users/baseminany/Documents/Basem's Knowledge/Knowledge Base/CLAUDE.md). When this
project's PROJECT_NOTES.md and the vault disagree, the vault's dated notes are usually
newer — reconcile rather than blindly trust either.

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec
