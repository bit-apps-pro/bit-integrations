---
name: create-trigger-doc
description: Generate one Bit Integrations Users Guide draft doc for a trigger integration, mined from the free/pro PHP trigger code and the React trigger UI. Use when the user invokes /create-trigger-doc with a platform name only or asks to document/generate docs for a trigger integration only.
---

# Create Trigger Doc

Generates **one** Users Guide doc for a platform's triggers: the full setup flow
is walked through step by step, every trigger event is listed in a collapsible
"See all available `<Platform>` trigger events in Bit Integrations" accordion,
and the result is created as a draft EazyDocs child post under the
**Trigger** section on `bit-integrations.com`.

Output must match the shape of the already-published trigger docs at
`https://bit-integrations.com/wp-docs/trigger/`. The canonical example to follow
is
`https://bit-integrations.com/wp-docs/trigger/bit-crm-integration-as-a-trigger/`
(post ID `124651`).

The **entire document** must be SEO-friendly and user-friendly — not just the
title. See the writing standards at the top of [reference.md](reference.md).

## Invocation

```text
/create-trigger-doc <platform-name>
```

- `platform-name` is either the **registry key** (the directory name under
  `backend/Triggers/` or `../bit-integrations-pro/backend/Triggers/`, e.g.
  `WC`, `EDD`, `FluentCrm`) or the **display name** from
  `backend/Core/Util/AllTriggersName.php` (e.g. `WooCommerce`,
  `Easy Digital Downloads`, `Fluent CRM`).

If `platform-name` is missing, ask before doing anything. Do not ask for the
parent section post ID; read it from `DOC_TRIGGER_PARENT_POST_ID` in `.env`.

## Prerequisites

Verify first. Abort with the exact fix if missing.

1. `.env` at the plugin root contains `DOC_SITE_URL`, `DOC_SITE_USERNAME`,
   `DOC_SITE_PASSWORD`, `DOC_TRIGGER_PARENT_POST_ID`,
   `DOC_PLACEHOLDER_ATTACHMENT_POST_ID`, and
   `DOC_CREATE_INTEGRATION_ATTACHMENT_POST_ID`. Copy `.env.example` to `.env`
   and fill it if absent. Never print `DOC_SITE_PASSWORD`; HTTPS only.
2. `DOC_SITE_PASSWORD` must be a WordPress **Application Password**, not the
   wp-admin login password.
3. `DOC_SITE_USERNAME` must be an Administrator or otherwise hold the EazyDocs
   `edit_docs`/`publish_docs` capabilities. The `create-child` endpoint uses a
   publish-permission check and returns 403 without them.

## Workflow

1. **Resolve the platform.** Look the argument up in
   `backend/Core/Util/AllTriggersName.php` — the map is
   `'<Key>' => ['name' => '<Display Name>', 'isPro' => bool]`. The `name` value
   is the authoritative public platform name used in the title, slug, and body.
   Locate the trigger directory: `backend/Triggers/<Key>/` (free) or
   `../bit-integrations-pro/backend/Triggers/<Key>/` (pro). If the key is
   present in `AllTriggersName.php` but no directory exists, stop and say so —
   the trigger is listed for upsell only.
2. **Read `<Key>Controller.php::info()`** and collect `name`, `type`,
   `documentation_url`, `tutorial_url`, `is_active`, and the endpoint
   descriptors (`list` / `tasks` / `fields` / `fetch`). `type` decides the
   whole walkthrough — see the branch table in
   [reference.md](reference.md).
   - If `documentation_url` already points at a live doc, say so and confirm
     with the user before creating a second one.
3. **Collect the trigger event list.** Source depends on `type`:
   - `form` / `custom_form_submission` with a fixed event set — the `list` or
     `tasks` endpoint handler in the controller (usually `getAll()`, sometimes
     `getAllTask()` / `tasks()`), which returns
     `['id' => static::SOME_CONST, 'title' => __('Label')]` entries. Those
     `title` values are the exact event labels; never invent or reword them.
   - `form` where the list is the site's own forms/posts (e.g. Gravity Forms,
     Contact Form 7) — there is no fixed event table. Skip the event accordion
     and document form selection instead.
   - `webhook` / `action_hook` / `custom_trigger` — no event list. Document the
     webhook URL / hook name flow instead.
   Cross-check every event against `<Key>/Hooks.php`: the `add_action` bindings
   there are ground truth for the "When It Fires" column. Also read
   `<Key>Helper.php` / `<Key>StaticFields.php` when present.
4. **Read the trigger UI wording** from the React component that matches
   `type`, so the doc quotes real button and heading labels:
   - `form` → `frontend/src/components/Triggers/FormPlugin.jsx`
   - `custom_form_submission` → `frontend/src/components/Triggers/CustomFormSubmission.jsx`
   - `webhook` → `frontend/src/components/Triggers/Webhook.jsx`
   - `action_hook` → `frontend/src/components/Triggers/ActionHook.jsx`
   - `custom_trigger` → `frontend/src/components/Triggers/CustomTrigger.jsx`
   The app-selection screen wording lives in
   `frontend/src/components/Flow/New/SelectTrigger.jsx`.
5. **Collect destination platforms for the overview** from the `integs` array in
   `frontend/src/components/Flow/New/SelectAction.jsx`. Use six recognizable
   `type` values verbatim. Never name an action integration that is not in that
   array.
   Choose each destination by what the trigger event's payload actually
   carries — an event with no email address cannot feed an email marketing app.
   See "Use-case realism" in [reference.md](reference.md) before writing the
   overview or any use case.
6. **Author the Gutenberg doc** from [reference.md](reference.md): post title,
   secondary/sidebar title, in-content H1, the mandatory TL;DR paragraph,
   three overview paragraphs, the
   `How the <Platform> Trigger Works` and `Before You Start` H2 sections, the
   `How to Set Up ... in Bit Integrations` H2, sequential Title Case
   `Step N: ...` H3 headings, the event accordion, the closing paragraph, and
   the `Explore <N> Useful ... Use Cases` H2 section.
   Apply the SEO and readability standards at the top of `reference.md` as you
   write, not as a pass afterwards.
7. **Resolve media.** Read attachment post IDs from `.env` and resolve each
   through `GET $DOC_SITE_URL/wp-json/wp/v2/media/<id>`. Every
   `{{PLACEHOLDER:<slot>}}` uses `DOC_PLACEHOLDER_ATTACHMENT_POST_ID`. Do not
   upload or cache images.
8. **Read the parent section post ID** from `DOC_TRIGGER_PARENT_POST_ID` in
   `.env` (the `Trigger` section, currently `2652`).
9. **Preview for approval before creating the doc:** WordPress/public post
   title, EazyDocs secondary/sidebar title, slug, trigger `type` branch used,
   event count, event labels, the action platforms named in the overview and use
   cases, the numbered H3 step titles, internal/external links added, media IDs
   used, and the parent section id.
   Each use-case title is a link to its
   `bit-integrations.com/triggers/<platform>/connect/<app>/` page — list those
   URLs in the preview with the `<title>` each one returned, because that site
   soft-404s and a `200` alone does not prove a page exists. See the
   "Use-case title link" section of `reference.md`.
   Include an **SEO/readability self-check** in the preview, confirming against
   the standards in `reference.md`. Report it in six groups:
   - *Accuracy* — every event label, field label and button text traced to a
     source file; no behavior borrowed from another platform; every
     `[VERIFY: …]` flag listed; Pro/version gating stated where it matters; no
     `(PRO)` marker anywhere.
   - *Use-case realism* — for **each** use case and each overview example,
     one line naming the trigger event's payload and confirming the destination
     app can actually consume it; no generic "submits a form, places an order,
     or registers" opener; no claimed outcome neither side produces. See
     "Use-case realism" in `reference.md`.
   - *SEO* — primary keyword in the H1, the first 100 words, an H2, the slug,
     the meta description and exactly one image alt; one H1, no skipped heading
     levels; link count; no duplicated content with the platform's action doc.
   - *Extractability* — every heading answered in its first one or two
     sentences; no orphan pronouns; platform name repeated in each major
     section; specifics in tables not prose; no hedging words.
   - *Readability* — paragraph and sentence length, active voice, second person,
     every image alt filled and honest about what the shot contains, no banned
     words (`simply`, `just`, `easy`, `seamlessly`, …), every step imperative
     with an observable result.
   - *Block vocabulary* — the TL;DR group box, the warning callouts (list what
     each one warns about) and the use-case cards, with counts. No fourth block
     style, nothing boxed outside those three.
   The whole doc is public-facing; get explicit approval on the title and the
   self-check before creating anything.
10. **Create a draft child doc** through EazyDocs using the full public title and
    set its Gutenberg content. Set `ezd_doc_secondary_title` to the platform
    name as a **top-level** REST field through `wp/v2/docs/<id>` (a `meta.*`
    payload is ignored). Confirm the field exists in the authenticated `OPTIONS`
    schema first — it is exposed by a site-specific snippet, not by EazyDocs Pro
    itself. Only when the field is absent from the schema, report the edit link
    and ask the user to set the EazyDocs Pro **Secondary Title** field manually,
    and do not report the sidebar-title work complete until the user confirms it
    was saved. Also report which placeholder screenshots need replacement, and
    every `[VERIFY: …]` flag still in the body — the draft must not go public
    until all of them are resolved and removed.
11. **Set the Rank Math SEO fields** on the created doc automatically (no
    approval), via one authenticated
    `POST $DOC_SITE_URL/wp-json/rankmath/v1/updateMeta` call. Rank Math writes
    generic post meta, so this works on the EazyDocs `docs` post. Send
    `objectID` = the doc post ID, `objectType` = `post`, and a `meta` object
    with:
    - `rank_math_focus_keyword`: 3-4 comma-separated keyword phrases derived
      from the doc (platform name + "integration"/"trigger" + the automation
      value), **most important first** — the first phrase is the primary keyword
      Rank Math scores on. Example for WooCommerce:
      `woocommerce trigger, woocommerce bit integrations, woocommerce automation,
      woocommerce order webhook`. (Multiple keywords need Rank Math Pro; on free
      only the first is used, which is why the primary must be first.)
    - `rank_math_description`: an AI-written meta description. **Do not open with
      the post title or the phrase "<Platform> Integration as a Trigger"** —
      start with the platform name early, then weave **semantic keywords** for
      the use case (connect, sync, automate, workflow, trigger, plus domain terms
      like "order data", "form entries", "CRM contacts"). Mention Bit
      Integrations **once, briefly**, and include the primary focus keyword
      naturally so Rank Math scores it green.
      **150-160 characters, hard ceiling 160 — never exceed it.** Count the
      characters and trim to <=160 before sending.
    Write the keywords first, then compose the description to contain the primary
    keyword. If the `rankmath/v1/updateMeta` route returns 404, report it and
    skip — do not fail the doc.
12. **Offer the code follow-up.** After the draft is created, report the future
    public URL and offer to update `documentation_url` in
    `<Key>Controller.php::info()` to point at it. Only edit the PHP when the
    user says yes.

## Notes

- Read [reference.md](reference.md) only after the platform and trigger `type`
  are known.
- Event labels, field labels, and button text must be copied from the code, not
  paraphrased. Platform-side navigation steps (where to find an API key, etc.)
  may use general knowledge but must be flagged for human verification in the
  approval preview.
- Do not touch existing/previously created docs unless explicitly asked.
