---
name: solumflow-kennisbank-interview
description: Fills a SolumFlow knowledge base by interviewing the owner of the business. It reads the website and what the knowledge base already holds, asks questions in short rounds (services, way of working, prices, customers' questions, tone, what stays internal), sorts every answer into "Over ons bedrijf" (background the website chat may use) or "Intern" (the team only), and writes each topic as a draft article for a person to read and publish in the app. Use it whenever someone says "vul onze kennisbank", "interview over mijn bedrijf", "leer de websitechat over ons bedrijf", "kennisbank opzetten", "zet onze bedrijfskennis in SolumFlow", or wants the website chat or an AI to know their business. Needs the online SolumFlow connector (OAuth); an API key is not enough.
---

# Filling the knowledge base with an interview

This skill turns what a business owner knows into knowledge base articles in their SolumFlow account. You read what is already written down, interview the person for the rest, and write each topic as a **draft**. A person reads the drafts and publishes them in the app; only then does the website chat use them.

The person is a business owner, not a developer. Talk in their language (usually Dutch), in plain words, and keep every round short. You never make anything up: what was not said or found becomes an open question in the article.

## Step 0: is the online connector there?

You need these tools of the SolumFlow connector: `search_kb`, `list_kb_categories`, `create_kb_category`, `create_kb_article`, `update_kb_article` and `get_kb_article`. In some apps they carry a prefix, such as `solumflow:search_kb`.

- **No such tools:** stop and explain. The knowledge base follows the rights of a person, so only the online connector reaches it; the API key of the Claude Code card does not. In SolumFlow, **Instellingen → Integraties → Claude** (or **ChatGPT**) shows the address to paste and the three steps: in Claude, Instellingen → Connectors → Aangepaste connector toevoegen, paste the address, sign in to SolumFlow, choose the team and tick **De kennisbank lezen, zoals jij hem leest** and **Concepten maken en artikelen aanpassen die jij mag bewerken**. Then start again.
- **`forbidden` on reading:** the connection was approved without the knowledge base. Disconnect it in SolumFlow (Instellingen → Integraties) and connect again with both knowledge base rights ticked.
- **`not_a_manager` later on:** the person may not make top categories. Use categories they manage, or ask them to have somebody who manages the knowledge base make "Over ons bedrijf" and "Intern" first.

## Step 1: read before you ask

1. **The website.** Ask for its address if you do not know it. Read the home page, the services or products pages, about us, the contact page and any FAQ. Note what they say about services, way of working, prices, area and opening hours.
2. **The knowledge base.** Call `list_kb_categories`. It says per category who reads it (`public`, `readers`, `team`, `groups`) and whether the website chat answers from it. Then `search_kb` once per theme of the interview (see `references/interview-vragen.md`), so you know what is already written.
3. **Tell the person what you found** in three or four lines: "Op je site staat al … In de kennisbank staat al … Ik vraag je nu naar wat er nog niet staat."

## Step 2: the interview

Run four to six rounds of at most four questions each. The themes, the questions and what to listen for are in `references/interview-vragen.md`. Skip a question the website or the knowledge base already answers; ask only to confirm or to fill a gap.

- Ask one round at a time. With `AskUserQuestion`, use free-text questions; otherwise a short numbered list.
- After each round, sum up in a few lines what you heard and ask "Klopt dit?" before going on.
- Use the person's own words. Write down figures exactly as they say them ("meestal zes weken", not "6 weken gemiddeld").
- If the person wants to stop, stop: write what you have and list the rest as open questions.

## Step 3: which layer each answer goes in

Every answer goes to one of two layers. Show the person which, per topic, before you write:

| Layer | Category | Who reads it | The website chat |
| --- | --- | --- | --- |
| Background | **Over ons bedrijf** | only the team | answers visitors from it, once published |
| Internal | **Intern** | only the team | never |

- Goes to **Intern** by default: price agreements and discounts, margins, purchase prices, strategy, competitors, complaints about customers, anything about named people, passwords or access (never write those at all; say so).
- Goes to **Over ons bedrijf**: what you would also tell a visitor — services, way of working, lead times, areas, what you do not do, general prices that are on the website anyway.
- In doubt: ask. "Mag de websitechat dit tegen een bezoeker zeggen?"

An existing category that fits (for example a public FAQ category) may be used instead, but say who reads it: a `public` or `readers` category is also read by customers. Never put internal knowledge in one.

## Step 4: write the drafts

1. **Categories.** If "Over ons bedrijf" does not exist, make it with `create_kb_category` and `website_chat: true`. If "Intern" does not exist, make it without the chat. A new category is always for the team alone; making something public happens in the app. Make a subcategory only when one layer gets more than about eight topics, under the top category it belongs to.
2. **One article per topic,** short: a title the way a customer would ask it ("Hoe lang duurt het voor mijn website live staat?") or the name of the topic ("Onze werkwijze"), a one-line summary, and the text as simple HTML (headings, paragraphs, lists, tables). Write in the person's words and tone.
3. **An article on the same topic already exists** (`search_kb` found it): read it with `get_kb_article`. If it is a draft, add to it with `update_kb_article` at the version you read. If it is **published**, a change is live at once: show the person what you would change and ask first. Never make a second article on the same topic.
4. **What is missing** goes into the article as a line "Nog in te vullen: …", never as a guess.

## Step 5: the closing list

End with a short list, in the person's language:

- per article: its title and its category, and "nieuw" or "aangevuld";
- the open questions, per article;
- the sentence: **lees ze na en publiceer ze in SolumFlow (Kennisbank → het artikel → Publiceren); pas dan gebruikt de websitechat ze**;
- the offer: "Zal ik ook projectinstructies maken, zodat een Claude- of ChatGPT-project zijn kennis uit deze kennisbank haalt?" That is the `solumflow-projectinstructies` skill.

Example:

> Klaar. In de kennisbank staan nu deze concepten:
> - Over ons bedrijf › Onze werkwijze (nieuw)
> - Over ons bedrijf › Wat kost een website? (nieuw) — nog in te vullen: prijs van onderhoud per maand
> - Intern › Kortingsafspraken (nieuw)
>
> Lees ze na en publiceer ze in SolumFlow. Pas daarna gebruikt de websitechat ze.
