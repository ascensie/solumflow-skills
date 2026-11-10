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
| [`solumflow-website-setup`](skills/solumflow-website-setup/SKILL.md) | The basic setup: a menu with contact form, booking, chat widget, the hosting order page, visitor tracking and cookie banner. It sets the chosen parts up in SolumFlow and places them in the site's code. |
| [`solumflow-webshop`](skills/solumflow-webshop/SKILL.md) | A web shop in the site's own design: it fills the catalogue, sets up shipping, discounts and the revalidation webhook through the MCP server, builds the shop pages in a Next.js site with the SDK, and proves it with a test order. |
| [`solumflow-kennisbank-interview`](skills/solumflow-kennisbank-interview/SKILL.md) | Fills the knowledge base: it reads the website and what is already written, interviews the owner in short rounds, sorts each answer into "Over ons bedrijf" (background the website chat may use) or "Intern" (the team only), and writes every topic as a draft to publish in the app. |
| [`solumflow-projectinstructies`](skills/solumflow-projectinstructies/SKILL.md) | A block of instructions for a project in Claude or ChatGPT, so the project takes its knowledge about the business from the knowledge base, names its source, and writes what it learns back as a draft. |

Ask the agent something like "zet SolumFlow op mijn website" or "bouw mijn
webshop op SolumFlow" in the site's project folder, and the matching skill takes
it from there.

The two knowledge base skills need the **online connector**, not the API key:
the knowledge base follows the rights of the person who connects it. In
SolumFlow, Settings → Integrations → Claude (or ChatGPT) shows the address and
the steps; tick the two knowledge base rights when SolumFlow asks. Then ask
something like "vul onze kennisbank" or "maak projectinstructies voor onze
offertes".

## Examples

[`examples/nextjs-shop`](examples/nextjs-shop) is a small, deliberately bare
Next.js shop built on the SDK. It shows the structure the `solumflow-webshop`
skill builds towards; it is a pattern to copy from, not a template for the look.
