---
name: solumflow-projectinstructies
description: Makes a block of project instructions that connects a project in Claude or ChatGPT (for example "Marketing", "Offertes", "Klantenservice") to the SolumFlow knowledge base. The project then looks up knowledge about the business with search_kb before it answers, names the article it relies on, says so when something is not there, and proposes to write new or changed knowledge back as a draft. Use it whenever someone asks for "projectinstructies voor onze kennisbank", "koppel dit project aan SolumFlow", "instructies voor een Claude-project / ChatGPT-project", "custom instructions met onze kennis", or wants an AI project that knows their business. Needs the online SolumFlow connector (OAuth).
---

# Project instructions that use the knowledge base

This skill writes one block of instructions to paste into a project in Claude or ChatGPT. With it, the project takes what it knows about the business from the SolumFlow knowledge base, and writes what it learns back as a draft for a person to publish. The block itself is in `references/instructieblok.md`; you fill it in, you do not rewrite it.

The person is usually a business owner. Talk in their language (usually Dutch), in plain words.

## Step 0: is the online connector there?

You need `search_kb` and `list_kb_categories` of the SolumFlow connector (sometimes with a prefix, such as `solumflow:search_kb`).

- **No such tools:** the block can still be made, but you cannot check the categories. Say so, and explain how to connect: in SolumFlow, **Instellingen → Integraties → Claude** (or **ChatGPT**) shows the address and the steps; tick **De kennisbank lezen, zoals jij hem leest**, and **Concepten maken en artikelen aanpassen die jij mag bewerken** if the project should write back. Then ask whether to go on without the check or to stop until it is connected.
- **`forbidden`:** the connection was approved without the knowledge base. Disconnect it under Instellingen → Integraties and connect again with the knowledge base rights ticked.

## Step 1: what the project is for

Ask, in one round:

1. **Waar is het project voor?** For example offertes schrijven, marketingteksten, vragen van klanten beantwoorden, nieuwe collega's inwerken.
2. **In welk programma?** Claude or ChatGPT.
3. **Mag het project kennis terugschrijven als concept?** Yes by default.

Then call `list_kb_categories` and propose the categories that fit the purpose, with who reads each (from `audience`) and whether the website chat answers from it. For example: a project for customer questions needs "Over ons bedrijf"; one for quotes also needs the internal price agreements. Let the person confirm or change the list.

If the knowledge base is still empty or thin (few articles in the chosen categories), say so and offer the `solumflow-kennisbank-interview` skill first: a project can only use what is written down.

## Step 2: fill in the block

Take the block from `references/instructieblok.md` and fill in:

- the name of the business;
- what the project is for, in the person's words;
- the chosen categories, as they are named in the knowledge base (with "›" for a subcategory).

Leave every other line as it is. If the project may not write back, remove point 5 and replace point 6 with: "Wijzig of maak nooit artikelen; stel een wijziging voor aan de gebruiker." Write the block in the language of the project; translate it as a whole if that is not Dutch.

## Step 3: hand it over

Give the block in one code block, ready to copy, and then in a few lines where it goes:

- **Claude:** the project → Instructies. Switch the SolumFlow connector on in the chat (the tools menu).
- **ChatGPT:** the project → Instructies. The SolumFlow connector has to be added under Instellingen → Connectors and switched on in the chat. If ChatGPT offers it only for reading, the project reads and does not write back; knowledge is then added through Claude or in the app.

End with one line to try it: "Vraag in het project bijvoorbeeld: Hoe lang duurt het voor een nieuwe klant live staat? Het antwoord noemt dan het artikel waar het op steunt."
