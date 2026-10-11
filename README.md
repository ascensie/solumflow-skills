# SolumFlow skills

Skills that let an AI agent (Claude Code, Cursor, Codex and others) work on a
website for a SolumFlow account, through the
[SolumFlow MCP server](https://www.npmjs.com/package/@solumflow-app/crm-mcp-server).

## Install

First add the MCP server: in SolumFlow, open Settings → Integrations → API keys
and paste the command from the MCP card into a terminal. Then:

```sh
npx skills add ascensie/solumflow-skills
```

Or, in Claude Code, as a plugin:

```
/plugin marketplace add ascensie/solumflow-skills
/plugin install solumflow@solumflow
```

## Skills

| Skill | What it does |
| --- | --- |
| [`solumflow-website-setup`](skills/solumflow-website-setup/SKILL.md) | The basic setup: a menu with contact form, booking, chat widget, visitor tracking and cookie banner. It sets the chosen parts up in SolumFlow and places them in the site's code. |

Ask the agent something like "zet SolumFlow op mijn website" in the site's
project folder, and the skill takes it from there.
