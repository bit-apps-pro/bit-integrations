---
name: create-action-doc
description: Generate one Bit Integrations Users Guide draft doc for an action integration, including auth-aware connection instructions, mined from the free/pro PHP action code and the React integration UI. Use when the user invokes /create-action-doc with a platform name only or asks to document/generate docs for an action integration only.
---

# Create Action Doc

Generates **one** Users Guide doc for a platform's actions: the full setup flow
is walked through step by step, every action event is listed in a collapsible
"See all available `<Platform>` action events in Bit Integrations" accordion, the
authorization section is derived from the integration's real auth code, and the
result is created as a draft EazyDocs child post under the **Actions** section on
`bit-integrations.com`.

Output must match the shape of the already-published action docs at
`https://bit-integrations.com/wp-docs/actions/`. The canonical example to follow
is
`https://bit-integrations.com/wp-docs/actions/bit-crm-integration-as-an-action/`
(post ID `124666`).

The **entire document** must be SEO-friendly and user-friendly - not just the
title. See the writing standards at the top of [reference.md](reference.md).

## Invocation

```text
/create-action-doc <platform-name>
```

- `platform-name` is either the **directory name** under `backend/Actions/`,
  `../bit-integrations-pro/backend/Actions/`, or
  `frontend/src/components/AllIntegrations/` (e.g. `ZohoCRM`, `BitCrm`,
  `MondayCom`), or the **display name** from the `integs` array in
  `frontend/src/components/Flow/New/SelectAction.jsx` (e.g. `Zoho CRM`,
  `Bit CRM`, `Monday.Com`).

If `platform-name` is missing, ask before doing anything. Do not ask for the
parent section post ID; read it from `DOC_ACTION_PARENT_POST_ID` in `.env`.

## Prerequisites

Verify first. Abort with the exact fix if missing.

1. `.env` at the plugin root contains `DOC_SITE_URL`, `DOC_SITE_USERNAME`,
   `DOC_SITE_PASSWORD`, `DOC_ACTION_PARENT_POST_ID`,
   `DOC_PLACEHOLDER_ATTACHMENT_POST_ID`,
   `DOC_CREATE_INTEGRATION_ATTACHMENT_POST_ID`, and
   `DOC_TRIGGER_LIST_ATTACHMENT_POST_ID`. Copy `.env.example` to `.env` and fill
   it if absent. Never print `DOC_SITE_PASSWORD`; HTTPS only.
2. `DOC_SITE_PASSWORD` must be a WordPress **Application Password**, not the
   wp-admin login password.
3. `DOC_SITE_USERNAME` must be an Administrator or otherwise hold the EazyDocs
   `edit_docs`/`publish_docs` capabilities. The `create-child` endpoint uses a
   publish-permission check and returns 403 without them.

## Workflow

1. **Resolve the platform.** Find its entry in the `integs` array in
   `frontend/src/components/Flow/New/SelectAction.jsx` -
   `{ type: '<Display Name>', logo?: '<key>', is_pro: bool }`. The `type` value
   is the authoritative public platform name used in the title, slug, and body.
   Then locate the code:
   - backend: `backend/Actions/<Name>/` (free) or
     `../bit-integrations-pro/backend/Actions/<Name>/` (pro)
   - frontend: `frontend/src/components/AllIntegrations/<Name>/`
   The class-name-to-display-name mismatches handled by the switch in
   `Flow::execute()` (e.g. `Monday.Com` → `MondayCom`) apply here too - check it
   when the directory name is not an obvious slug of the display name.
2. **Read the existing doc link.** `frontend/src/Utils/StaticData/tutorialLinks.js`
   maps a camelCase key to `{ youTubeLink, docLink }`. If `docLink` already
   points at a live doc, say so and confirm with the user before creating a
   second one.
3. **Collect the action event list** from
   `frontend/src/components/AllIntegrations/<Name>/staticData.js` (or
   `<Name>Actions.jsx` / `options.js` in older integrations) - entries are
   `{ name, label, is_pro }`. The `label` strings are the exact event names;
   never invent or reword them. Note every `is_pro: true` event, but **never
   append a `(PRO)` marker to an event label**: state the Pro requirement once
   in prose, at the point where it matters.
4. **Derive the authorization flow.** Read
   `frontend/src/components/AllIntegrations/<Name>/<Name>Authorization.jsx`:
   - Modern integrations render the shared
     `frontend/src/components/Connections/Authorization.jsx` with an
     `authDetails.authType` from `AUTH_TYPES` in
     `frontend/src/Utils/connectionAuth.js` (`wp_plugin_check`, `oauth2`,
     `oauth1`, `api_key`, `bearer_token`, `basic_auth`, `custom`), plus
     `noteDetails.note`: quote that note.
   - Older integrations render bespoke inputs; read their labels and
     placeholders directly.
   Map the auth type to the sentences in [reference.md](reference.md).
   Cross-check the backend handler
   (`backend/Actions/<Name>/<Name>Controller.php`, usually
   `checkAuthorization` / `authorize`) and `Routes.php` for what is actually
   required.
5. **Collect the configuration fields** from
   `frontend/src/components/AllIntegrations/<Name>/<Name>IntegLayout.jsx` (and
   `<Name>FieldMap.jsx` / `<Name>CommonFunc.js` when present): field labels,
   helper text, required flags, dropdown option sources, and which fields are
   mapped rather than typed. Read `RecordApiHelper.php` for which fields the API
   call actually requires.
6. **Read the wizard shape** from
   `frontend/src/components/AllIntegrations/<Name>/<Name>.jsx`: the
   `<Steps step={N} …/>` count tells you how many wizard steps the reader will
   see. The final screen is
   `frontend/src/components/AllIntegrations/IntegrationHelpers/IntegrationStepThree.jsx`:
   the **Conditional Logics** checkbox, the `Successfully Integrated` heading and
   the **Finish & Save ✔** button.
7. **Collect trigger plugins for the use-case section** from the trigger
   registry `backend/Core/Util/AllTriggersName.php` (Pro triggers) and the free
   triggers' own `{Key}Controller::info()` under `backend/Triggers/`: use real
   `name` values only (Bit Form, Contact Form 7, Gravity Forms, WPForms, Fluent
   Forms, Elementor, WooCommerce, LearnDash LMS, …).
   Choose each plugin by what the action event actually needs, not by
   popularity - an event requiring `user_id` and `course_id` pairs with an LMS,
   not a contact form. See "Use-case realism" in [reference.md](reference.md)
   before writing any of them.
8. **Author the Gutenberg doc** from [reference.md](reference.md): post title,
   secondary/sidebar title, in-content H1, the mandatory TL;DR paragraph,
   overview paragraphs, the
   `How the <Platform> Action Works` and `Before You Start` H2 sections, the
   `How to Set Up ... in Bit Integrations` H2, sequential Title Case
   `Step 01: ...` H3 headings, zero-padded to two digits, the event accordion,
   the Step 05
   `Field | What to Set` table, and the `Explore <N> Useful ... Ideas` H2
   section.
   Apply the SEO and readability standards at the top of `reference.md` as you
   write, not as a pass afterwards.
9. **Resolve media.** Read attachment post IDs from `.env` and resolve each
   through `GET $DOC_SITE_URL/wp-json/wp/v2/media/<id>`. Every
   `{{PLACEHOLDER:<slot>}}` uses `DOC_PLACEHOLDER_ATTACHMENT_POST_ID`. Do not
   upload or cache images.
10. **Read the parent section post ID** from `DOC_ACTION_PARENT_POST_ID` in
    `.env` (the `Actions` section, currently `2654`).
11. **Preview for approval before creating the doc:** WordPress/public post
    title, EazyDocs secondary/sidebar title, slug, auth type and credential
    labels used, AI-inferred credential-retrieval steps **flagged for
    verification**, action event count, Pro-only events, the numbered H3 step
    titles, the trigger plugins named in the use-case section,
    internal/external links added, media IDs used, and the parent section id.
    Each use-case title is a link to its
    `bit-integrations.com/triggers/<trigger-plugin>/connect/<platform>/` page -
    note the trigger plugin comes first even in an action doc. List those URLs
    in the preview with the `<title>` each one returned, because that site
    soft-404s and a `200` alone does not prove a page exists. See the
    "Use-case title link" section of `reference.md`.
    Include an **SEO/readability self-check** in the preview, confirming against
    the standards in `reference.md`. Report it in six groups:
    - *Accuracy* - every action-event label, credential field and button text
      traced to a source file; no behavior borrowed from another platform;
      every `[VERIFY: …]` flag listed, especially platform-side navigation;
      Pro/plan gating stated where it matters; no `(PRO)` marker anywhere.
    - *Use-case realism* - for **each** idea and each overview example, one line
      naming the event's required fields and confirming the chosen trigger
      plugin can supply every one of them; no generic "submits a form, places an
      order, or registers" opener; no claimed outcome the helper does not
      produce (access granted, email sent, visitor experience changed). See
      "Use-case realism" in `reference.md`.
    - *SEO* - primary keyword in the H1, the first 100 words, an H2, the slug,
      the meta description and exactly one image alt; one H1, no skipped heading
      levels; link count; no duplicated content with the platform's trigger doc.
    - *Extractability* - every heading answered in its first one or two
      sentences; no orphan pronouns; platform name repeated in each major
      section; specifics in tables not prose; no hedging words.
    - *Punctuation and step numbers* - zero em dashes and zero en dashes in
      the whole doc, `<style>` block included (report both counts as `0`), and
      every step heading zero-padded to two digits (`Step 01:`, `Step 02:`),
      including any numbered sub-steps and any range named in prose.
    - *Readability* - paragraph and sentence length, active voice, second
      person, every image alt filled and honest about what the shot contains, no
      banned words (`simply`, `just`, `easy`, `seamlessly`, …), every step
      imperative with an observable result.
    - *Block vocabulary* - the TL;DR group box, the warning callouts (list what
      each one warns about) and the use-case cards, with counts. No fourth block
      style, nothing boxed outside those three. Confirm each one carries its
      `bi-tldr`/`bi-warn`/`bi-card` class and **no inline colour**, and that the
      `<style>` block is present as the first block of the content - inline
      colours cannot express the site's dark mode.
    - *Dark mode* - confirm the doc renders in **both** modes. After publishing,
      load the page, toggle `body_dark`, and check the computed contrast of every
      `td/th/p/li/a/h1-h4` against its composited background; report the count of
      pairs under 4.5:1 in each mode. Markup alone does not prove this - a theme
      `!important` rule can beat a correct-looking declaration.
    The whole doc is public-facing; get explicit approval on the title and the
    self-check before creating anything.
12. **Create a draft child doc** through EazyDocs using the full public title and
    set its Gutenberg content. Set `ezd_doc_secondary_title` to the platform name
    as a **top-level** REST field through `wp/v2/docs/<id>` (a `meta.*` payload is
    ignored). Confirm the field exists in the authenticated `OPTIONS` schema
    first - it is exposed by a site-specific snippet, not by EazyDocs Pro itself.
    Only when the field is absent from the schema, report the edit link and ask
    the user to set the EazyDocs Pro **Secondary Title** field manually, and do
    not report the sidebar-title work complete until the user confirms it was
    saved. Also report which placeholder screenshots need replacement, and every
    `[VERIFY: …]` flag still in the body - the draft must not go public until
    all of them are resolved and removed.
13. **Set the Rank Math SEO fields** on the created doc automatically (no
    approval), via one authenticated
    `POST $DOC_SITE_URL/wp-json/rankmath/v1/updateMeta` call. Rank Math writes
    generic post meta, so this works on the EazyDocs `docs` post. Send
    `objectID` = the doc post ID, `objectType` = `post`, and a `meta` object
    with:
    - `rank_math_focus_keyword`: 3-4 comma-separated keyword phrases derived from
      the doc (platform name + "integration" + the automation value), **most
      important first**: the first phrase is the primary keyword Rank Math
      scores on. Example for Zoho CRM: `zoho crm integration, zoho crm bit
      integrations, zoho crm automation, form to crm`. (Multiple keywords need
      Rank Math Pro; on free only the first is used, which is why the primary
      must be first.)
    - `rank_math_description`: an AI-written meta description. **Do not open with
      the post title or the phrase "<Platform> Integration as an Action"** -
      start with the platform name early, then weave **semantic keywords** for
      the use case (connect, sync, automate, workflow, plus domain terms like
      "CRM contacts", "form submissions", "order data"). Mention Bit Integrations
      **once, briefly**, and include the primary focus keyword naturally so Rank
      Math scores it green.
      **150-160 characters, hard ceiling 160 - never exceed it.** Count the
      characters and trim to <=160 before sending.
    Write the keywords first, then compose the description to contain the primary
    keyword. If the `rankmath/v1/updateMeta` route returns 404, report it and
    skip - do not fail the doc.
14. **Offer the code follow-up.** After the draft is created, report the future
    public URL and offer to update the `docLink` for this platform in
    `frontend/src/Utils/StaticData/tutorialLinks.js`. Only edit the JS when the
    user says yes.

## Notes

- Read [reference.md](reference.md) only after the platform, its auth type, and
  its action event list are known.
- Event labels, field labels, and button text must be copied from the code, not
  paraphrased. Credential facts must come from the integration's own note/helper
  text; general knowledge may only fill navigation gaps on the third-party site
  and must be flagged for human verification.
- Do not touch existing/previously created docs unless explicitly asked.
