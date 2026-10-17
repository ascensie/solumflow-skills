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
| [`solumflow-webshop`](skills/solumflow-webshop/SKILL.md) | A web shop in the site's own design: it fills the catalogue, sets up shipping, discounts and the revalidation webhook through the MCP server, builds the shop pages in a Next.js site with the SDK, and proves it with a test order. |

Ask the agent something like "zet SolumFlow op mijn website" or "bouw mijn
webshop op SolumFlow" in the site's project folder, and the matching skill takes
it from there.

## Examples

[`examples/nextjs-shop`](examples/nextjs-shop) is a small, deliberately bare
Next.js shop built on the SDK. It shows the structure the `solumflow-webshop`
skill builds towards; it is a pattern to copy from, not a template for the look.
