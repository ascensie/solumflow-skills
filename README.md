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
| [`solumflow-cms-site`](skills/solumflow-cms-site/SKILL.md) | A website whose pages live on SolumFlow's CMS: it connects a Next.js site (pages, menu, sitemap, the editor's preview, the webhook) with the SDK in the site's own design, and writes the pages as drafts through the MCP server for a person to publish in SolumFlow. |
| [`solumflow-kennisbank-interview`](skills/solumflow-kennisbank-interview/SKILL.md) | Fills the knowledge base: it reads the website and what is already written, interviews the owner in short rounds, sorts each answer into "Over ons bedrijf" (background the website chat may use) or "Intern" (the team only), and writes every topic as a draft to publish in the app. |
| [`solumflow-projectinstructies`](skills/solumflow-projectinstructies/SKILL.md) | A block of instructions for a project in Claude or ChatGPT, so the project takes its knowledge about the business from the knowledge base, names its source, and writes what it learns back as a draft. |
| [`solumflow-social-posts`](skills/solumflow-social-posts/SKILL.md) | Writes social media posts: it looks at the connected channels, what the team already planned and the media library, writes each post per platform within its limits, saves it as a draft in the person's name and offers it for approval. A manager schedules it in the app. |

Ask the agent something like "zet SolumFlow op mijn website" or "bouw mijn
webshop op SolumFlow" in the site's project folder, and the matching skill takes
it from there.

The two knowledge base skills and the social posts skill need the **online
connector**, not the API key: they follow the rights of the person who
connects it, and a post is written in their name. In
SolumFlow, Settings → Integrations → Claude (or ChatGPT) shows the address and
the steps; tick the knowledge base or social rights when SolumFlow asks. Then ask
something like "vul onze kennisbank" or "maak projectinstructies voor onze
offertes".

## Examples

[`examples/nextjs-shop`](examples/nextjs-shop) is a small, deliberately bare
Next.js shop built on the SDK. It shows the structure the `solumflow-webshop`
skill builds towards; it is a pattern to copy from, not a template for the look.
