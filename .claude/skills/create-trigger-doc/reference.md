# create-trigger-doc reference

Load only after the platform and its trigger `type` are known.

**Canonical published example:**
`https://bit-integrations.com/wp-docs/trigger/bit-crm-integration-as-a-trigger/`
(post ID `124651`). When this reference and that doc disagree, the published doc
wins — fetch it with
`curl -s "$DOC_SITE_URL/wp-json/wp/v2/docs/124651?_fields=content"` and match it.

## Writing standards — SEO and readability

These apply to the **entire document**, not just the title. Check them before
sending the doc for approval.

**Keywords**

- Primary keyword: `<Platform> integration` (or `<Platform> trigger` where it
  reads more naturally). It must appear in the H1, in the **first paragraph
  within the first 100 words**, in at least one H2, in the slug, in the meta
  description, and in at least one image alt.
- Secondary keywords to weave in naturally across the body:
  `<Platform> Bit Integrations`, `<Platform> automation`,
  `WordPress <Platform> integration`, plus the domain terms the platform owns
  (`CRM records`, `order data`, `form entries`, `subscribers`).
- Natural density only. Never repeat the exact phrase in consecutive sentences,
  never keyword-stuff a heading, never write a sentence whose only job is to
  hold a keyword.
- The trigger doc and the action doc for the same platform must not duplicate
  each other. Different intros, different examples, different use cases.

**Structure**

- Exactly one H1. Never skip heading levels (H1 → H2 → H3 → H4).
- Every heading is descriptive and front-loaded with the meaningful word — a
  reader scanning only the headings must be able to follow the whole setup.
- Answer-first: the first one or two sentences under **every** heading fully
  answer that heading. No warm-up, no "in this section we will look at".
- Use tables and bulleted lists instead of walls of text; the event accordion and
  the use-case bullets exist for this reason.
- This page is a **task doc**, not a tutorial or a concept page. It does not
  teach what a webhook or a CRM is. Link out to the doc that does.

**Accuracy — hard rules**

Documentation errors cost more than SEO errors.

- Never invent a feature, event, field, menu path, limit, plan tier or
  destination app. If it is not in the source, it does not go in the doc.
- Source-of-truth order: the trigger's `{Key}Controller.php` and `Hooks.php` →
  `SelectAction.jsx` / the React trigger component → the platform's own official
  docs. Nothing else. Not memory, not a similar integration, not a competitor.
- Reproduce event labels, field labels and button text **character for
  character** as the code emits them. Never reword, never fix their casing.
- Never mix platforms. A FluentPlayer doc contains only FluentPlayer behavior.
- State a Pro-only or version-gated requirement at the point where it matters,
  not only in Before You Start.
- **Never append a `(PRO)` marker** to an event label, feature name or table row.
  A marker on every row carries no information; a marker on some rows reads as an
  upsell inside a reference table. State plan gating once, in prose, where it
  changes what the reader does.
- If the platform cannot do what the keyword implies, say so plainly and early,
  then document the supported path.
- Anything you could not verify from source becomes an inline
  `[VERIFY: exact wording of the API key screen in <Platform>]` flag in the
  draft **and** a line in the approval preview. Never quietly guess.
  Every `[VERIFY: …]` must be resolved and removed before the draft is
  published — grep the content for `[VERIFY` as a release gate.

**Extractability — how LLMs and answer engines read the page**

- Every paragraph must survive being lifted out on its own. No orphan pronouns:
  "This mapping lets you…", not "This lets you…".
- Repeat the full platform name in each major section. Retrieval pulls
  fragments, not whole pages, so a section that only says "the plugin" is
  unattributable.
- Give an extractable one-sentence definition where a term matters: "Field
  mapping in Bit Integrations is the step where each trigger field is matched to
  a destination field."
- Numbers, limits, formats and prerequisites belong in a list or table, never
  woven into prose.
- No hedging. "May", "might", "possibly", "generally", "should normally" destroy
  citation value. State the fact, or state its condition: "For logged-out
  visitors, the flag lasts 24 hours."

**Readability**

- Second person, active voice, present tense. Short sentences — average under
  20 words, split anything longer.
- Paragraphs of three to four sentences at most.
- Around a grade-8 reading level. Expand an acronym on first use.
- No unexplained jargon, no internal code names, no class or method names in the
  public body.
- Bold the real UI labels the reader must find on screen (`Create Integration`,
  `Select a Form/Task Name`, `Fetch`, `Set Action`). Bold is for UI labels and
  warnings only, never for general emphasis.
- Lead with the condition, not the consequence: "If your site is multisite, …".

**Banned language**

- Never `simply`, `just`, `easy`, `obviously`, `of course`. They shame a reader
  who is already stuck.
- Never `seamlessly`, `effortlessly`, `revolutionary`, `game-changing`,
  `the possibilities are endless`, `let's dive in`, `in today's fast-paced
  world`, `it's important to note that`.
- Never promise a ranking, an AI citation or a rich snippet anywhere in the doc
  or in the report about it.

**Links and images**

- Two to four internal links to related docs on `bit-integrations.com`: the
  matching action doc for the same platform when it exists, the conditional
  logic doc, and one or two related trigger docs. Anchor text must be
  descriptive and carry the destination's own keyword — never `click here`,
  never a bare URL.
- Link once per destination per page. A second identical link adds nothing.
- Link back to prerequisites and concepts, forward to the logical next task.
- One external link to the platform's own site or API docs where credentials or
  records are created, when relevant.
- Name the hub or parent page that will link **in** to this doc in the approval
  preview. For trigger docs that is the `Trigger` section
  (`DOC_TRIGGER_PARENT_POST_ID`), so no doc ships orphaned.
- Every image needs descriptive alt text stating what the shot shows and where
  it is. No empty alts, no filename alts.
- **The alt must describe what is actually in the frame.** Name the platform
  when the platform is visible; when the screenshot is a generic Bit Integrations
  screen that does not contain it, describe that screen honestly and add the
  platform only as context ("…, the first step of the `<Platform>` trigger
  setup"). Never write an alt claiming a screenshot shows something it does not —
  including a state that is not captured, such as "with a plugin chosen" on a
  shot where nothing is selected.
- Open every screenshot before writing its alt or placing it. The file name and
  the attachment title are not reliable descriptions, and an image placed under
  the wrong sentence is worse than a placeholder.
- Put the primary keyword in exactly one alt, and only where it reads
  accurately. Do not repeat it across every alt.
- Never let a step exist only inside a screenshot. The instruction must be in
  the text; the image only confirms it.

**Meta**

- Meta description 150-160 characters, hard ceiling 160, containing the primary
  keyword and not opening with the post title.

## Post title, sidebar title, and slug

EazyDocs Pro supports a separate sidebar label through the **Secondary Title**
field (`ezd_doc_secondary_title`). The WordPress/EazyDocs post title must be the
full public document title; never shorten `post_title` just to change the
sidebar.

**WordPress/EazyDocs post title:**

```text
<Platform> Integration
```

Examples: `Bit CRM Integration`, `NextCRM Integration`. Use the exact `name`
value from `backend/Core/Util/AllTriggersName.php`. Use singular `Integration`,
never `Integrations`.

> **Never write the phrase `as a Trigger` anywhere in a trigger doc** — not in
> the post title, an H1, an H2/H3 heading, image alt text or body prose. Trigger
> docs own the plain `<Platform> Integration` title and the plain
> `<platform-slug>-integration` slug; the doc type is already clear from the
> `Trigger` section it lives in. Where a heading has to name the wizard screen,
> use the real screen name instead: `Search and Select <Platform> on the Trigger
> Screen`, because `Please select a Trigger` is what the reader actually sees.
> Grep the finished Gutenberg HTML for `as (a|the|your) trigger`
> case-insensitively before the approval preview; the count must be `0`.
> Action docs are unaffected — they keep `<Platform> Integration as an Action`.

> **Note:** The post title must be SEO-friendly and user-friendly. Include the
> exact platform name, use natural language, and avoid keyword stuffing, vague
> claims, or awkward repetition.

**EazyDocs Pro Secondary Title / sidebar label:**

```text
<Platform>
```

Examples: `Bit CRM`, `NextCRM`, `WooCommerce`. Save this value in
`ezd_doc_secondary_title`. EazyDocs' left-sidebar walker reads it and falls back
to `post_title` only when empty.

**URL slug, fixed for trigger docs:**

```text
<platform-slug>-integration
```

Examples: `bit-crm-integration`, `nextcrm-integration`,
`fluentplayer-integration`. Always singular `-integration`, and **no**
`-as-a-trigger` suffix — the trigger doc owns the short, canonical slug.

The post title and the slug now agree: `<Platform> Integration` and
`<platform-slug>-integration`. Action docs keep the full
`<platform-slug>-integration-as-an-action`, so the two doc types never collide.

| Doc type | Slug |
|---|---|
| Trigger | `<platform-slug>-integration` |
| Action | `<platform-slug>-integration-as-an-action` |

Older docs on the site use legacy slugs (`<platform>-integrations`,
`<platform>-integrations-as-a-trigger`, `<platform>-integration-as-a-trigger`).
Do not copy those for new docs, but do
check whether a legacy doc for this platform already exists before creating a
new one:

```bash
curl -s "$DOC_SITE_URL/wp-json/wp/v2/docs?parent=$DOC_TRIGGER_PARENT_POST_ID&search=<Platform>&_fields=id,slug,title"
```

Also check the exact slug is free (`wp/v2/docs?slug=...`) — WordPress silently
renames a duplicate to `...-2`. If it is taken, stop and confirm with the user.

When posting the title to the EazyDocs `create-child` endpoint, replace `&` with
`ezd_ampersand`, `#` with `ezd_hash`, and `+` with `ezd_plus`; that endpoint
decodes them back via `decode_special_chars`. Send the title/slug **raw**
(unencoded) to the core `wp/v2/docs/<id>` endpoint — it does not decode these
tokens, so an encoded title would be stored literally.

## Document structure

The content opens with an H1 that repeats the post title — published trigger docs
on this site keep the H1 inside the content, so match that. H2 for sections, H3
for steps, H4 for event categories inside the accordion.

Step headings use **Title Case** and no leading zero: `Step 1: Click the Fetch
Button`, not `Step 01: click the fetch button`.

```text
<h1>  <Platform> Integration
      <TL;DR paragraph>
      <3 overview paragraphs>
<h2>  How the <Platform> Trigger Works
<h2>  Before You Start
<h2>  How to Set Up the <Platform> Integration in Bit Integrations
      <one paragraph: how many steps and which one needs care>
<h3>    Step 1: Open Bit Integrations and Click Create Integration
<h3>    Step 2: Search and Select <Platform> on the Trigger Screen
<h3>    Step 3: Choose Your Trigger Event
<h3>    Step 4: Click the Fetch Button
<h3>    Step 5: Create a Test Record Within the 3 Minute Window
<h3>    Step 6: Review the Fetched Data and Click Set Action
      <closing paragraph>
<h2>  Explore <N> Useful <Platform> Integration Use Cases
```

Do not add an Action walkthrough, a step summary, or a roadmap list.

### TL;DR — mandatory, always first

One paragraph, placed immediately after the H1 and before the overview
paragraphs. It is the block a reader in a hurry acts on, and the block answer
engines quote, so it carries the whole procedure in compressed form.

```html
<!-- wp:group {"className":"bi-tldr","layout":{"type":"constrained"}} -->
<div class="wp-block-group bi-tldr"><!-- wp:paragraph --><p class="wp-block-paragraph"><strong>TL;DR:</strong> To set up the &lt;Platform&gt; integration in Bit Integrations, &lt;shortest accurate path in one sentence, naming the real button and event labels&gt;. You need &lt;prerequisites&gt;. The whole setup takes about &lt;N&gt; minutes.</p><!-- /wp:paragraph --></div>
<!-- /wp:group -->
```

Rules:

- Two to four sentences. Never more.
- It must work **alone**. An experienced reader acts on the TL;DR and never
  scrolls further, so a path that only makes sense after reading Step 3 has
  failed.
- Name the real UI labels and a real event label, bolded, under the same
  accuracy rules as the rest of the page — **Create Integration**, **Fetch**,
  **Set Action**, and one event copied verbatim from the controller.
- Contain the primary keyword naturally. This is inside the first 100 words, so
  it satisfies that placement requirement.
- State the prerequisites in the same breath, including
  `Bit Integrations Pro` when `AllTriggersName.php` marks the trigger
  `isPro: true`.
- Give a time estimate only when the step count supports one. Do not invent a
  number to fill the sentence.
- Adjust the path per branch: a `webhook` trigger's TL;DR names copying the
  webhook URL, not clicking Fetch.

### Overview — 3 paragraphs

```text
<Paragraph 1: what the platform stores or does, in plain language, and one line saying Bit Integrations is what makes that data travel.>

<Paragraph 2: once the two are connected, anything that happens in <Platform> can automatically start an action somewhere else — then name 4-5 concrete destinations the platform's own payload can actually feed, e.g. a WhatsApp message, a new row in Google Sheets, a Slack alert, a subscriber added to your email list.>

This guide walks through the full <Platform> trigger setup in Bit Integrations, lists every supported trigger event, and shows <N> practical automations you can build in a few minutes.
```

Human-written, simple, customer-friendly. No stiff marketing copy, no developer
jargon. Every destination named in paragraph 2 must exist in the `integs` array
in `frontend/src/components/Flow/New/SelectAction.jsx` — never invent an action
integration.

Paragraph 2 is subject to **Use-case realism** below. Each destination must be
one the trigger's payload can genuinely feed: do not promise "a subscriber added
to your email list" for an event that carries no email address. Read the event
payload before naming destinations, and never open with "when someone submits a
form, places an order, or registers as a user".

### How the `<Platform>` Trigger Works

One paragraph, a two-item list, then one closing paragraph:

```text
Bit Integrations follows a simple two-part model. The trigger is what happens. The action is what you want to happen next.

- Trigger: an event inside <Platform>, such as <real event label A> or <real event label B>.
- Action: one or more destination apps that receive the data, such as <6 real platform names from SelectAction.jsx>, or any of the other supported platforms.

When a trigger event happens in <Platform>, Bit Integrations collects the record and its field data, then sends each value to the matching field in the connected app. The process runs on your WordPress site, so your customer data does not pass through a third-party automation service.
```

Keep the last sentence for triggers that run on-site. Drop or reword it for
webhook triggers where the platform is external.

### Before You Start

A short bullet list of real prerequisites only:

```text
- Bit Integrations is installed and activated on your WordPress site.
- <Platform> is installed and activated on the same site.   <- only for WordPress-plugin triggers
- You know which destination app you want to send data to, and you have its necessary credentials or API key ready.
- Bit Integrations Pro is active.   <- only when AllTriggersName.php marks this trigger isPro: true
```

For SaaS/webhook triggers, replace the second bullet with the account or plan the
platform requires.

### Setup section lead-in

```text
The whole setup takes <N> steps. Follow them in order, because the fetch step in the middle depends on a live test record.
```

Adjust for the branch — a `form`-listing trigger has no fetch step, so say what
its fiddly step is instead.

### Branch table

The step sequence depends on `info()['type']`:

| `type` | UI component | Step sequence |
|---|---|---|
| `custom_form_submission` | `CustomFormSubmission.jsx` | The 6-step Fetch flow below — this is the canonical shape |
| `form` with a fixed event list (controller `getAll()` returns constant-backed titles) | `FormPlugin.jsx` | Steps 1-3 identical; there is no Fetch button, so Steps 4-6 collapse into `Step 4: Select Your Options and Click Next` |
| `form` listing the site's own forms/posts | `FormPlugin.jsx` | Steps 1-2 identical; `Step 3: Choose Your Form` replaces the event step and there is no accordion; then `Step 4: Click Next` |
| `webhook` | `Webhook.jsx` | Steps 1-2 identical; `Step 3: Copy the Webhook URL`, `Step 4: Paste the URL into <Platform>`, `Step 5: Send One Test Payload`, `Step 6: Review the Fetched Data and Click Set Action` |
| `action_hook` / `custom_trigger` | `ActionHook.jsx` / `CustomTrigger.jsx` | Steps 1-2 identical; `Step 3: Register the Hook Name`, `Step 4: Fire the Hook Once`, `Step 5: Review the Fetched Data and Click Set Action` |

### Step craft rules

These apply to every `Step N:` heading, in every branch.

- **One action per step.** If the body needs "and then", it is two steps.
- Open each step with an imperative verb the reader can act on: Click, Open,
  Select, Enter, Enable, Copy. Never "Configure as needed" — a step you cannot
  describe concretely is not a step.
- Name the exact UI element and its exact label, in the real path form:
  **Bit Integrations → Create Integration**.
- **State the observable result**, so the reader can confirm they are on track:
  "The Fetch button changes to a spinning Waiting for form submission state."
  Never end a step on a click.
- Put a warning **before** the action it protects, never after.
- When a step branches, give each branch its own labelled sentence or bullet
  rather than nested "if … otherwise" prose.
- The closing paragraph must contain a concrete success check the reader can
  see — which screen to open and what should appear there — not just "you are
  done".
- Keep the count realistic. Past about ten steps, group them into phases.

### Step 1: Open Bit Integrations and Click Create Integration

```text
From your WordPress dashboard, go to Bit Integrations. On the welcome screen or the integrations list, click the Create Integration button. This opens a trigger selection page.
```

Then the fixed screenshot `{{SHOT:create-integration}}` using
`DOC_CREATE_INTEGRATION_ATTACHMENT_POST_ID`.

### Step 2: Search and Select `<Platform>` on the Trigger Screen

```text
You land on the Please select a Trigger screen. Type <Platform> into the Search Trigger... box and click the <Platform> card when it appears.
```

The real screen heading is `Please select a Trigger`
(`frontend/src/components/Flow/New/SelectTrigger.jsx`).

Then `{{PLACEHOLDER:select-trigger-app}}`.

### Step 3: Choose Your Trigger Event

```text
Open the Select a Form/Task Name dropdown and pick the trigger event you want to listen for. The dropdown holds every supported <Platform> event, so pick the one that matches the exact moment you want your automation to start.
```

`Select a Form/Task Name` is the real dropdown label — do not reword it.

Then the **event accordion** (below), then:

```text
Popular starting points:

- <Event Label> for <why someone would pick it>.
- <Event Label> for <why>.
- <Event Label> for <why>.
```

Use three to five events, labels copied verbatim from the controller.

Then `{{PLACEHOLDER:select-trigger-event}}`.

### Step 4: Click the Fetch Button

```text
After you select an event, a Fetch button appears. Click it. Bit Integrations now starts listening for a real record so it can learn the field structure of that event.
```

Then `{{PLACEHOLDER:fetch-button}}`.

### Step 5: Create a Test Record Within the 3 Minute Window

```text
The Fetch button changes to a spinning "Waiting for form submission" state with a three-minute countdown. During that window, go and perform the exact action you selected in Step 3.

The test record must match the trigger event you chose. If you selected <Event A>, <do X in the platform>. If you selected <Event B>, <do Y>. If you selected <Event C>, <do Z>.
```

`Waiting for form submission...` is the real button state
(`CustomFormSubmission.jsx`). If the countdown ends before the test lands,
nothing is broken — say so, and say to click Fetch again.

Then `{{PLACEHOLDER:waiting-for-submission}}`.

### Step 6: Review the Fetched Data and Click Set Action

```text
As soon as the test record is captured, the button turns into "Fetched" and a field table appears. Every field from that record is listed with its detected data type, and the sample values from your test record are shown alongside. Check that the fields you care about are there, for example <3-4 real field labels>, and adjust any data type from its dropdown if the detected type is not what you want.

When the data looks right, click Set Action.
```

Then `{{PLACEHOLDER:fetched-fields}}`, then the closing paragraph:

```text
You are now on the action setup screen. Search for your destination app, connect it, map the <Platform> fields to the destination fields, and save the integration. From that point on, every matching <Platform> event runs the automation automatically.
```

## Event accordion

Collapsed by default, headed
`See all available <Platform> trigger events in Bit Integrations`.

Inside it, group the events into categories derived from the constant names in
the controller, each an `<h4>` named `<Module> Events` (`Lead Events`,
`Contact Events`, `Deal Events`, `Invoice Events`, …), followed by one
two-column table:

| Column | Content |
|---|---|
| `Trigger Event` | The exact `title` string from the controller's list endpoint, bolded |
| `When It Fires` | One or two sentences, grounded in the `add_action` binding in `Hooks.php` |

Example row from the canonical doc:

> **Lead Created** | Fires the moment a new lead is added to Bit CRM, whether it
> was typed in manually, imported, or captured by a connected form.

Never reword an event label. If a controller constant has no matching entry in
the list endpoint, it is dead or deprecated — leave it out and mention it in the
approval preview. When the trigger has fewer than about eight events, one
ungrouped table without H4s is fine.

Skip the accordion entirely when the trigger has no fixed event set.

## Use-case section

`<h2>` `Explore <N> Useful <Platform> Integration Use Cases`, then:

```text
Here are <N> automations that solve real problems for small teams. Each one uses the same <N>-step setup described above, with a different action app at the end.
```

Then one block per use case — the title is a **bold linked paragraph**, not a
heading:

```text
**<Platform> <Destination App> Integration**   <- the whole title is a link
```

```html
<!-- wp:paragraph --><p class="wp-block-paragraph"><a href="CONNECT_URL"><strong>&lt;Platform&gt; &lt;Destination App&gt; Integration</strong></a></p><!-- /wp:paragraph -->
```

Then the body of the block:

```text
<One short paragraph of rationale: why this automation matters, in human terms.>

- Trigger: <real trigger event label>
- Action: <what the destination app does>
- What it does: <2-3 sentences describing the end result and one variation the reader could add>
```

Use four or five use cases. Every destination app must exist in the `integs`
array in `SelectAction.jsx`; every trigger event must exist in the controller's
list endpoint.

### Use-case realism — hard rules

Every use case must be an automation a real site owner would actually build.
This is the section most likely to go wrong, because a generic pairing reads
fine and is completely wrong.

**Derive the pairing from the data the trigger event actually carries.** Read
the event's payload (`getTestData()` / the controller's field list) *before*
choosing a destination app. The payload decides what is possible:

| What the event carries | Sensible destination |
|---|---|
| an email address and a name | an email marketing or CRM app |
| an order or payment record | a spreadsheet, accounting or CRM app |
| a support or form message | a chat app, helpdesk or notification channel |
| only an internal record ID | another app on the same site, or nothing — pick a different event |

If the destination needs a field the trigger never sends, the use case is
invalid. Never assume a payload contains an email, a phone number or a total.

**Never claim an outcome neither side can produce.** Describe exactly what the
action app does with the data and nothing more. Recurring traps:

- Adding a contact to a list is **not** sending them a message.
- Writing a spreadsheet row is **not** generating a report.
- Creating a record is **not** notifying a human, unless the action is a
  notification.

**Banned opener.** Do not write "when someone submits a form, places an order, or
registers as a user" — or any variant that lists generic events and staples them
to whatever destinations exist. Name one concrete actor doing one concrete
thing: a customer, a student, a subscriber, a team member.

**State the manual work removed.** One clause naming what the reader stops doing
by hand is what makes a use case useful rather than decorative.

**Name the real gotcha** when the pairing has one — a Pro requirement, a field
the reader must map manually, a plan tier on the destination app's side.

Worked example of the failure this rule exists to prevent:

> ✗ "When a visitor views a page, send them a welcome email through Mailchimp."
> A page-view event carries no email address, so the automation cannot run.
>
> ✓ "When a customer completes checkout, add them to a Mailchimp audience."
> The checkout payload carries the email and name the audience needs.

### Use-case title link

Each title links to the marketing-site connect page for that exact pairing:

```text
https://bit-integrations.com/triggers/<platform-connect-slug>/connect/<destination-connect-slug>/
```

Example: `https://bit-integrations.com/triggers/fluent-player/connect/google-sheets/`

Both slugs belong to the marketing site and are **not derived** from anything in
this repo — not the doc slug, not the `AllTriggersName.php` key, not the
`integs` `type` value. Observed mismatches:

| Source value | Connect slug |
|---|---|
| `FluentPlayer` (doc slug `fluentplayer-...`) | `fluent-player` |
| `Google Sheet` | `google-sheets` |
| `Fluent CRM` | `fluentcrm` |
| `Mail Chimp` | `mailchimp` |

**Verify every one of these links before the approval preview.**
`bit-integrations.com` soft-404s: a missing connect page still answers HTTP
`200` with a full-size body, so a status-code check proves nothing. The
`<title>` is the only reliable signal.

Verify **positively**. A live connect page's title matches
`<Destination> Integration with <Platform> - Automate Your Tasks`. Do not test
for a specific 404 string — the site serves at least two of them
(`Page not found` and `Page Not Found - Bit Integrations`), so a match against
one of those will pass a dead URL through.

```bash
curl -sL "https://bit-integrations.com/triggers/<platform>/connect/<app>/" \
  | grep -o '<title>[^<]*</title>'
# accept only if it reads "<App> Integration with <Platform> - Automate Your Tasks"
```

The pairing always lives under `/triggers/…/connect/…`, whichever side the doc
is about. There is no `/actions/<app>/connect/<x>/` route — that path soft-404s.
`/actions/<app>/` and `/integrations/<app>/` also resolve but serve an unrelated
page, so never link to either.

Start from the platform's own index, `https://bit-integrations.com/triggers/<platform-connect-slug>/`,
to find which pairings exist. If a destination has no live connect page, choose a
different destination app for that use case rather than shipping a dead link.
Report the verified URLs in the approval preview.

Close with one wrap-up paragraph:

```text
These <N> are only the starting point. Bit Integrations connects <Platform> to 378+ apps, including <6-8 real platform names>. The setup process is the same every time.
```

## Block vocabulary — visual hierarchy

Three styled block types, and no others. Every doc uses the same three so the
Users Guide reads as one system.

The rule that governs all three: **how loud a block may be depends on how many
times the reader meets it.** A block seen once can shout. A block that repeats
five times must whisper, or it becomes noise and drowns the one that matters.

| Tier | Block | Class | Times per doc |
|---|---|---|---|
| 1 | TL;DR | `bi-tldr` | exactly 1 |
| 2 | Warning | `bi-warn` | 2-4 |
| 3 | Use-case card | `bi-card` | 4-5 |

Same shape, different colour, is what makes the vocabulary learnable. Do not
invent a fourth style, and do not box anything outside these three.

**Leave plain:** overview paragraphs, step bodies, tables and the event
accordion. Tables already carry their own structure and steps are already
delimited by their H3s, so boxing them tips the page into a wall of panels.

### Colours live in one `<style>` block, never in inline styles

The docs site has a **dark mode** (an `ezd_dark_switch` toggle that puts
`body_dark` on `<body>`). An inline `style="background:#fff5ef"` cannot say
"…and something else in dark mode", so a block styled inline becomes a glaring
light slab on a near-black page — or, worse, keeps the theme's light text and
turns invisible.

Inline styles also lose outright to the theme's `!important` rules:

```css
body.body_dark.single-docs #post p       { color:#eaeaea !important }   /* (1,2,2) */
.doc-middle-content tr:nth-child(2n)     { color:#000    !important }   /* (0,2,1) */
.body_dark.single-docs .wp-block-esab-accordion-child > .esab__active.esab__body
                                         { background:#494949 !important } /* (0,5,0) */
```

So: **put the class on the block, and put every colour in one `wp:html`
`<style>` block at the top of the content.** A `<style>` block survives the REST
write intact, `body_dark` selectors included, which is the only way to express a
real dark variant. Verify with `context=edit` after writing.

Emit the group with a `className` and **no** `style` attribute:

```html
<!-- wp:group {"className":"bi-tldr","layout":{"type":"constrained"}} -->
<div class="wp-block-group bi-tldr"><!-- wp:paragraph --><p class="wp-block-paragraph"><strong>TL;DR:</strong> …</p><!-- /wp:paragraph --></div>
<!-- /wp:group -->
```

Warnings use `bi-warn`, use-case cards use `bi-card`, with the card's linked
bold title, rationale paragraph and Trigger/Action list inside. Padding and
margins come from the stylesheet, so drop the old `margin-top:0`/`margin-bottom:0`
zeroing attributes — they exist only to patch inline padding.

### The stylesheet — paste verbatim as the first block of every doc

Selectors that must beat a theme `!important` rule carry the
`body.body_dark.single-docs #post` prefix to clear its specificity. Do not
shorten them.

```html
<!-- wp:html --><style>
/* ---- Bit Integrations doc blocks ---- */
.bi-tldr{background:#fff5ef;color:#2b2119;border-left:4px solid #f3a77f;border-radius:3px;padding:18px 20px;margin:0 0 28px}
.bi-warn{background:#fdf3f0;color:#2b2119;border-left:4px solid #d97757;border-radius:3px;padding:14px 18px;margin:18px 0}
.bi-card{background:#fdfcfb;color:#2b2119;border:1px solid #e8e2dd;border-radius:4px;padding:20px 22px;margin:16px 0}
.single-docs #post .bi-tldr p,.single-docs #post .bi-warn p,.single-docs #post .bi-card p,.single-docs #post .bi-card li{color:inherit!important}
.single-docs #post .bi-card a{color:#6b21a8!important}
body.body_dark .bi-tldr{background:#241c17;color:#f1e6dd;border-left-color:#f3a77f}
body.body_dark .bi-warn{background:#2b1e19;color:#f7e0d6;border-left-color:#d97757}
body.body_dark .bi-card{background:#1b1c21;color:#e7e2dd;border-color:#34363d}
body.body_dark.single-docs #post .bi-tldr p,body.body_dark.single-docs #post .bi-warn p,body.body_dark.single-docs #post .bi-card p,body.body_dark.single-docs #post .bi-card li{color:inherit!important}
body.body_dark.single-docs #post .bi-card a{color:#cbaef7!important}
/* ---- tables follow the theme; only the hardcoded zebra fill is neutralised ---- */
#post .wp-block-table table{background:transparent!important;border-color:rgba(127,127,127,.32)!important}
#post .wp-block-table th{background:rgba(127,127,127,.13)!important;border-color:rgba(127,127,127,.32)!important}
#post .wp-block-table td{background:transparent!important;border-color:rgba(127,127,127,.32)!important}
#post .wp-block-table tbody tr:nth-child(odd){background:transparent!important}
#post .wp-block-table tbody tr:nth-child(even){background:rgba(127,127,127,.07)!important}
/* the theme pairs its stripe with a forced black text colour; drop that too */
#post .wp-block-table tbody tr:nth-child(even),#post .wp-block-table tbody tr:nth-child(even) td,#post .wp-block-table tbody tr:nth-child(even) th{color:inherit!important}
/* the theme's brand link colour drops to 2:1 on the dark page */
body.body_dark.single-docs #post p a,body.body_dark.single-docs #post li a{color:#cbaef7!important}
/* ---- accordion ----
   The head keeps the esab plugin's own purple: it ships that with !important at
   a specificity we would have to fight, it is readable in both modes, and every
   other doc on the site already looks that way. Only the body is ours. */
.wp-block-esab-accordion .wp-block-esab-accordion-child{border:1px solid rgba(127,127,127,.3);border-radius:3px;overflow:hidden}
body.single-docs .wp-block-esab-accordion .wp-block-esab-accordion-child>.esab__body,body.single-docs .wp-block-esab-accordion .wp-block-esab-accordion-child>.esab__active.esab__body{background:#fbfaf9!important;border-top:1px solid rgba(127,127,127,.28);padding:16px}
body.body_dark.single-docs .wp-block-esab-accordion .wp-block-esab-accordion-child>.esab__body,body.body_dark.single-docs .wp-block-esab-accordion .wp-block-esab-accordion-child>.esab__active.esab__body{background:#1b1c21!important;border-top-color:rgba(127,127,127,.22)}
</style><!-- /wp:html -->
```

Why each table rule exists: the theme stripes even rows `#f7f7f7` **and** forces
`color:#000` on them. Neutralising only the background leaves black text on a
dark row; neutralising only the colour leaves a light row on a dark page. Both
have to go, and the replacement stripe is a translucent grey so it reads
correctly in either mode.

### The accordion `blockStyle` attribute is decorative — never rely on it

The esab accordion's `blockStyle` attribute is **not applied on the front end**
of this site. A doc that puts its colours there ships unstyled: the head renders
the plugin's default purple and the body takes the theme's dark `#494949`. Keep
whatever `blockStyle` the snippet already carries, but never put a colour you
depend on in it — those rules belong in the `<style>` block above.
### The existing note callout

The site's `note_col` block still exists and renders an info icon above the
literal word **Note**. Use it only for genuine asides. Never use it for the
TL;DR — it would label the primary path as an aside — and never for a warning,
which needs its own colour.

After setting content, verify the blocks survived by refetching with
`context=edit` and confirming each fill and bar colour is still present in
`content.raw`.

## Gutenberg snippets

For the accordion, generate unique IDs per doc, such as `esab-abc1234` and
`esab-child123`, then replace every `ACCORDION_ID` and `ACCORDION_CHILD_ID`
placeholder consistently in the block comment, CSS selectors, and HTML class
names.

```html
<!-- headings, paragraphs, lists -->
<!-- wp:heading {"level":1} --><h1 class="wp-block-heading">TEXT</h1><!-- /wp:heading -->
<!-- wp:heading --><h2 class="wp-block-heading">TEXT</h2><!-- /wp:heading -->
<!-- wp:heading {"level":3} --><h3 class="wp-block-heading">TEXT</h3><!-- /wp:heading -->
<!-- wp:heading {"level":4} --><h4 class="wp-block-heading">TEXT</h4><!-- /wp:heading -->
<!-- wp:paragraph --><p class="wp-block-paragraph">TEXT</p><!-- /wp:paragraph -->
<!-- wp:list --><ul class="wp-block-list"><li>ITEM</li></ul><!-- /wp:list -->

<!-- two-column event table -->
<!-- wp:table {"hasFixedLayout":true} -->
<figure class="wp-block-table"><table class="has-fixed-layout"><thead><tr><th><strong>Trigger Event</strong></th><th><strong>When It Fires</strong></th></tr></thead><tbody><tr><td><strong>EVENT LABEL</strong></td><td>WHEN IT FIRES</td></tr></tbody></table></figure>
<!-- /wp:table -->

<!-- styled available-events accordion; use this instead of wp:details -->
<!-- wp:esab/accordion {"uniqueId":"ACCORDION_ID","blockStyle":" .ACCORDION_ID.wp-block-esab-accordion, .ACCORDION_ID.wp-block-esab-accordion.nested-accordion{margin:0 0 30px 0;} .ACCORDION_ID.wp-block-esab-accordion > .esab__container{gap:10px;} .ACCORDION_ID.wp-block-esab-accordion .wp-block-esab-accordion-child{border-style:solid;border-color:#f3a77f;border-width:1px;border-radius:3px;overflow:hidden;} .ACCORDION_ID.wp-block-esab-accordion .wp-block-esab-accordion-child > .esab__head{background:#ffc0a6;padding:14px 10px;gap:8px;} .ACCORDION_ID.wp-block-esab-accordion .esab__heading_tag{color:#263a55;font-weight:700;margin:0;} .ACCORDION_ID.wp-block-esab-accordion .esab__icon svg{fill:#111111;width:20px;height:20px;} .ACCORDION_ID.wp-block-esab-accordion .esab__icon svg path{fill:#111111;} .ACCORDION_ID.wp-block-esab-accordion .wp-block-esab-accordion-child > .esab__body{border-top:1px solid #f3a77f;padding:16px;background:#ffffff;} ","allowAllClose":true} -->
<div class="wp-block-esab-accordion ACCORDION_ID" data-mode="global" data-close="true"><div class="esab__container"><!-- wp:esab/accordion-child {"uniqueId":"ACCORDION_CHILD_ID","blockStyle":" .ACCORDION_CHILD_ID.wp-block-esab-accordion-child .esab__badge{border-style: solid;} ","heading":"<strong>See all available PLATFORM trigger events in Bit Integrations</strong>","headingTag":"p","collapsedIcon":"esab__circle_plus","expandedIcon":"esab__circle_minus"} -->
<div class="wp-block-esab-accordion-child"><div class="esab__head" role="button" aria-expanded="false"><div class="esab__heading_txt"><p class="esab__heading_tag"><strong>See all available PLATFORM trigger events in Bit Integrations</strong></p></div><div class="esab__icon"><div class="esab__collapse"> <svg version="1.2" viewBox="0 0 24 24" width="24" height="24"><path fill-rule="evenodd" d="m3.5 20.5c-4.7-4.7-4.7-12.3 0-17 4.7-4.7 12.3-4.7 17 0 4.6 4.7 4.6 12.3 0 17-4.7 4.6-12.3 4.6-17 0zm0.9-0.9c4.2 4.2 11 4.2 15.2 0 4.2-4.2 4.2-11 0-15.2-4.2-4.3-11-4.3-15.2 0-4.3 4.2-4.3 11 0 15.2z"></path><path d="m11.4 15.9v-3.3h-3.3c-0.3 0-0.6-0.3-0.6-0.6 0-0.4 0.3-0.6 0.6-0.6h3.3v-3.3c0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6v3.3h3.3c0.3 0 0.6 0.2 0.6 0.6q0 0.2-0.2 0.4-0.2 0.2-0.4 0.2h-3.3v3.3q0 0.2-0.2 0.4-0.2 0.2-0.4 0.2c-0.4 0-0.6-0.3-0.6-0.6z"></path></svg> </div><div class="esab__expand"> <svg version="1.2" viewBox="0 0 24 24" width="24" height="24"><path fill-rule="evenodd" d="m12 24c-6.6 0-12-5.4-12-12 0-6.6 5.4-12 12-12 6.6 0 12 5.4 12 12 0 6.6-5.4 12-12 12zm10.6-12c0-5.9-4.7-10.6-10.6-10.6-5.9 0-10.6 4.7-10.6 10.6 0 5.9 4.7 10.6 10.6 10.6 5.9 0 10.6-4.7 10.6-10.6z"></path><path d="m5.6 11.3h12.8v1.4h-12.8z"></path></svg> </div></div></div><div class="esab__body">H4 CATEGORY HEADINGS + EVENT TABLES GO HERE</div></div>
<!-- /wp:esab/accordion-child --></div></div>
<!-- /wp:esab/accordion -->

<!-- note / important callout -->
<!-- wp:columns -->
<div class="wp-block-columns"><!-- wp:column {"className":"note_col"} -->
<div class="wp-block-column note_col"><!-- wp:freeform -->
<p><img class="alignnone size-full wp-image-4353" src="https://bitapps.pro/wp-content/uploads/2023/06/info-icon.png" alt="note-icon-bit-apps" width="24" height="24" />  <strong>Note</strong></p>
<!-- /wp:freeform -->

<!-- wp:paragraph -->
<p>NOTE TEXT</p>
<!-- /wp:paragraph --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

<!-- placeholder screenshot -->
<!-- wp:image {"align":"center","size":"large"} -->
<figure class="wp-block-image aligncenter size-large">
  <img src="PLACEHOLDER_SOURCE_URL" alt="TODO: screenshot of SLOT_DESCRIPTION"/>
  <figcaption>Replace with a real screenshot: SLOT_DESCRIPTION</figcaption>
</figure>
<!-- /wp:image -->

<!-- real fixed image -->
<!-- wp:image {"id":MEDIA_ID,"align":"center","sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image aligncenter size-large">
  <img src="SOURCE_URL" alt="ALT" class="wp-image-MEDIA_ID"/>
</figure>
<!-- /wp:image -->
```

## Placeholder image slots

Every `{{PLACEHOLDER:<slot>}}` resolves from
`DOC_PLACEHOLDER_ATTACHMENT_POST_ID`; only alt text and caption change. Alt text
must follow the site's style — a plain sentence describing the shot. The alts
below are the ones used in the canonical Bit CRM doc, with the platform
substituted.

| Slot | Alt text |
|---|---|
| `select-trigger-app` | `search and select <Platform> on the Please select a Trigger screen` |
| `select-trigger-event` | `choose specific <Platform> trigger events` |
| `fetch-button` | `Click on <Platform> fetch button` |
| `waiting-for-submission` | `Waiting for form submission` |
| `fetched-fields` | `Bit Integrations successfully fetched the test submission` |
| `webhook-url` | `Copy the Bit Integrations webhook URL for <Platform>` (webhook branch only) |

Fixed images:

| Slot | `.env` source | Alt |
|---|---|---|
| `create-integration` | `DOC_CREATE_INTEGRATION_ATTACHMENT_POST_ID` | `Create-Integration` |

Resolve every attachment post ID through
`GET $DOC_SITE_URL/wp-json/wp/v2/media/<id>` and embed its `source_url` and
attachment ID. Do not upload or cache these images.

## Media and EazyDocs API

Read credentials, the parent section post ID, and media IDs from `.env`:
`DOC_SITE_URL`, `DOC_SITE_USERNAME`, `DOC_SITE_PASSWORD`,
`DOC_TRIGGER_PARENT_POST_ID`, `DOC_PLACEHOLDER_ATTACHMENT_POST_ID`,
`DOC_CREATE_INTEGRATION_ATTACHMENT_POST_ID`. `DOC_SITE_PASSWORD` must be a
WordPress Application Password. Never print it.

Resolve an attachment:

```bash
curl -s -u "$DOC_SITE_USERNAME:$DOC_SITE_PASSWORD" \
  "$DOC_SITE_URL/wp-json/wp/v2/media/<media-id>"
```

Create the draft child. The title here must already have `&`/`#`/`+` replaced
with `ezd_ampersand`/`ezd_hash`/`ezd_plus`:

```bash
curl -s -u "$DOC_SITE_USERNAME:$DOC_SITE_PASSWORD" \
  -H "Content-Type: application/json" \
  -d '{"parent_id":<DOC_TRIGGER_PARENT_POST_ID>,"title":"<encoded title>","post_status":"draft"}' \
  "$DOC_SITE_URL/wp-json/eazydocs/v1/docs-builder/create-child"
```

Set content. The Gutenberg HTML is full of quotes, so never inline it in
`-d '...'`; write the JSON body to a temp file in the scratchpad directory
(title/slug **raw** here, not token-encoded) and send that:

```bash
# build body.json first, e.g. with jq --rawfile for the content field
curl -s -u "$DOC_SITE_USERNAME:$DOC_SITE_PASSWORD" \
  -H "Content-Type: application/json" \
  --data @body.json \
  "$DOC_SITE_URL/wp-json/wp/v2/docs/<id>"
```

`body.json`:

```json
{
  "slug": "<platform-slug>-integration",
  "title": "<Platform> Integration",
  "ezd_doc_secondary_title": "<Platform>",
  "content": "<gutenberg html beginning with the h1>"
}
```

`ezd_doc_secondary_title` is exposed as a REST **field** on the `docs` post type
(via `register_rest_field`) by a site-specific code snippet — EazyDocs Pro's own
build does not register it; the `docs` CPT's `supports` array omits
`custom-fields`, so a plain `register_post_meta()` would silently fail to surface
at all. Send it as a **top-level** key, not nested under `meta`; a
`{"meta": {...}}` payload is silently ignored. Confirm the field exists first by
inspecting the authenticated `OPTIONS` schema for `wp/v2/docs/<id>`.

After the update, fetch the doc with `context=edit` and verify:

- `title.raw` equals the full public title.
- `slug` equals the intended slug (not `...-2`).
- `ezd_doc_secondary_title` equals `<Platform>`.

Only when the field is absent from the `OPTIONS` schema, fall back to manual
entry: return the draft edit link and ask the user to open it, find the EazyDocs
Pro **Secondary Title** panel, set its **Title** field to `<Platform>`, and save
the draft. Wait for confirmation, then verify the sidebar label before reporting
completion.
