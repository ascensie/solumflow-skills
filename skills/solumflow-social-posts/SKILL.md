---
name: solumflow-social-posts
description: Writes social media posts for a SolumFlow account and offers them for approval. It looks at the connected channels, at what the team already planned for the period, at the tone of the business and at the pictures in the media library, then writes each post per platform within its limits, saves it as a draft in the person's name and, once the person agrees, offers it for approval. A manager of the team schedules it in SolumFlow; this skill never schedules or publishes. Use it whenever someone says "maak social posts", "schrijf posts voor volgende week", "vul onze social planner", "maak drie Instagram-posts", "post iets over onze open dag", or wants an AI to draft posts for their channels in SolumFlow. Needs the online SolumFlow connector (OAuth); an API key is not enough.
---

# Writing social posts for approval

This skill turns a request like "maak voor volgende week drie posts in onze toon" into draft posts in the person's SolumFlow social planner. You look at what is there, write the posts, let the person read them, and offer them for approval. **A manager of the team schedules them in SolumFlow.** Nothing goes out because of you.

The person is usually a business owner or a marketer, not a developer. Talk in their language (usually Dutch), in plain words. You never make things up about the business: what you do not know, you ask.

## Step 0: is the online connector there?

You need these tools of the SolumFlow connector: `list_social_accounts`, `list_social_posts`, `list_social_media`, `save_social_post` and `submit_social_post`. In some apps they carry a prefix, such as `solumflow:save_social_post`.

- **No such tools:** stop and explain. A post is written in the name of the person who connected the app, so only the online connector reaches the planner; an API key does not. In SolumFlow, **Instellingen → Integraties → Claude** (or **ChatGPT**) shows the address to paste and the steps: add it as a custom connector, sign in to SolumFlow, choose the team and tick **Je social-kanalen, de posts van je team en je beeldenbibliotheek zien** and **Concept-posts maken en ter goedkeuring aanbieden**. An app connected before these rights existed has to be connected again to get them.
- **`forbidden`:** the connection was approved without the social rights. Disconnect it in SolumFlow (Instellingen → Integraties) and connect again with both social rights ticked.
- **`feature_unavailable`:** the social planner is off for this team or for this person. Somebody who manages the team switches it on in SolumFlow.

## Step 1: what is there

1. **The channels.** Call `list_social_accounts`.
   - None at all: say that the channels are connected in SolumFlow under **Marketing → Social**, and stop.
   - A channel whose status is not `active` cannot take a post. Name it and say it has to be reconnected in SolumFlow; go on with the others.
   - Ask which channels the posts are for if the request does not say.
2. **What the team already planned.** Call `list_social_posts` for the period of the request (at most 31 days per call; for a longer period, call it per month). Look for subjects that are already covered and days that are already full. You see every colleague's post, with the first 280 characters of its text; `mine` marks the person's own.
3. **The tone of the business.** If the connector also has the knowledge base tools (`search_kb`), search for the tone, the way of working and the subject of the posts. Otherwise ask, in one short round: what the business does, for whom, how it talks (je or u, playful or businesslike), and what the posts should be about. Look at the texts in `list_social_posts` too: they show how the team writes.
4. **The pictures.** Call `list_social_media`. You can only choose from this library; new pictures are uploaded by the person in SolumFlow. If there is nothing that fits a post for Instagram, TikTok, YouTube or Pinterest (which need a picture or video), say so and ask the person to upload one first.

Tell the person in three or four lines what you found: "Je hebt Instagram en LinkedIn gekoppeld. Volgende week staat er al een post over … op dinsdag. In de bibliotheek staan 24 beelden. Ik stel deze drie onderwerpen voor: …" and let them agree on the subjects before you write.

## Step 2: write the posts

Per post:

- **One subject, written per platform.** The same text may go to every channel, but write a text of its own for a channel where the tone or the length differs: LinkedIn longer and businesslike, Instagram shorter with a few hashtags at the end, X short.
- **Within the limit of each platform:** X 280 characters, Bluesky 300, Threads and Pinterest 500, Google Business Profile 1500, Instagram and TikTok 2200, LinkedIn 3000, YouTube 5000; Facebook takes far more than a post should be. A text over the limit is refused when you save.
- **A picture where the platform needs one:** Instagram, TikTok, YouTube and Pinterest need a picture or video. Choose from `list_social_media` by what the file name and its size say; when you are not sure a picture fits, ask.
- **A proposed date and time,** spread over the period, avoiding days the team already filled. It is a proposal: the manager decides when it goes out.
- **No promises you cannot keep:** no prices, dates or claims the person did not give you.

Show the posts to the person before saving: per post the date, the channels, the text per channel and the chosen picture.

## Step 3: save as drafts

Save each post with `save_social_post`: `text`, `channels` as `{id, platform}` from `list_social_accounts` (with a `text` of its own where it differs), `media_ids` and `proposed_at`. The answer gives the post's id; keep it.

- **`text_problem`:** a text is too long for a platform. Shorten it, or give that channel a text of its own, and save again with the same `post_id`.
- **`channel_not_connected`:** the channel was disconnected in the meantime. Leave it out and tell the person.
- To change a draft later, save it again with its `post_id`. You can only change the person's own posts, and only while they are a draft or waiting for approval.

## Step 4: offer for approval, on the person's yes

Ask: "Zal ik ze ter goedkeuring aanbieden?" Only on a yes, call `submit_social_post` per post. The managers of the team then get a notification.

- **`media_problem`:** a platform will not take the pictures (none on Instagram, too many, the wrong size or kind). The answer names the platform and the rule. Choose another file with `list_social_media`, save again, and offer again.
- **`option_problem`:** a platform asks for something the post leaves empty, such as a Pinterest board or a YouTube title. Add it in that channel's `options` (`boardName`, `title`) and save again.
- **`not_a_draft`:** the post was offered already, or a manager has picked it up. Leave it.

## Step 5: the closing words

End with a short list, in the person's language:

- per post: the proposed date, the channels and the first line of the text;
- the sentence: **de posts wachten nu op goedkeuring. Een beheerder van je team plant ze in SolumFlow in (Marketing → Social); pas dan gaan ze naar buiten.**

Never say a post is "gepland", "ingepland", "geplaatst" or "live". It is a draft, or it waits for approval.

Example:

> Klaar. Deze drie posts wachten op goedkeuring:
> - di 2 dec, 09:00 — Instagram en LinkedIn — "Woensdag is onze open dag…"
> - do 4 dec, 12:00 — LinkedIn — "Wat doet een goede offerte?…"
> - za 6 dec, 10:00 — Instagram — "Achter de schermen bij…"
>
> Een beheerder van je team plant ze in SolumFlow in; pas dan gaan ze naar buiten.
