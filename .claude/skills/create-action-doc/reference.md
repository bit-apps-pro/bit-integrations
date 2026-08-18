# create-action-doc reference

Load only after the platform, its auth type, and its action event list are
known.

**Canonical published example:**
`https://bit-integrations.com/wp-docs/actions/bit-crm-integration-as-an-action/`
(post ID `124666`). When this reference and that doc disagree, the published doc
wins - fetch it with
`curl -s "$DOC_SITE_URL/wp-json/wp/v2/docs/124666?_fields=content"` and match it.

## Writing standards - SEO and readability

These apply to the **entire document**, not just the title. Check them before
sending the doc for approval.

**Keywords**

- Primary keyword: `<Platform> integration`. It must appear in the H1, in the
  **first paragraph within the first 100 words**, in at least one H2, in the
  slug, in the meta description, and in at least one image alt.
- Secondary keywords to weave in naturally across the body:
  `<Platform> Bit Integrations`, `<Platform> automation`,
  `WordPress <Platform> integration`, plus the domain terms the platform owns
  (`CRM contacts`, `subscribers`, `order data`, `form submissions`).
- Natural density only. Never repeat the exact phrase in consecutive sentences,
  never keyword-stuff a heading, never write a sentence whose only job is to
  hold a keyword.
- The action doc and the trigger doc for the same platform must not duplicate
  each other. Different intros, different examples, different use cases.

**Structure**

- Exactly one H1. Never skip heading levels (H1 → H2 → H3 → H4).
- Every heading is descriptive and front-loaded with the meaningful word - a
  reader scanning only the headings must be able to follow the whole setup.
- Answer-first: the first one or two sentences under **every** heading fully
  answer that heading. No warm-up, no "in this section we will look at".
- Use tables and bulleted lists instead of walls of text; the event accordion,
  the Step 05 field table, and the use-case bullets exist for this reason.
- This page is a **task doc**, not a tutorial or a concept page. It does not
  teach what an API key or OAuth is. Link out to the doc that does.

**Accuracy - hard rules**

Documentation errors cost more than SEO errors.

- Never invent a feature, action event, field, credential name, scope, menu
  path, limit, plan tier or trigger plugin. If it is not in the source, it does
  not go in the doc.
- Source-of-truth order: the action's `{Name}Controller.php` /
  `RecordApiHelper.php` → `AllIntegrations/{Name}/staticData.js` and
  `{Name}Authorization.jsx` → `SelectAction.jsx` → the platform's own official
  API docs. Nothing else. Not memory, not a similar integration, not a
  competitor.
- Reproduce action-event labels, credential field labels and button text
  **character for character** as the code emits them. Never reword, never fix
  their casing.
- Never mix platforms. A Sender doc contains only Sender behavior.
- State a Pro-only or plan-gated requirement at the point where it matters, not
  only in Before You Start. This includes third-party plan limits, such as an
  API that is unavailable on the platform's free tier.
- **Never append a `(PRO)` marker** to an event label, feature name or table row.
  A marker on every row carries no information; a marker on some rows reads as an
  upsell inside a reference table. State plan gating once, in prose, where it
  changes what the reader does.
- Never describe an outcome the code cannot produce. Before writing any example
  or use case, read what the helper actually writes - see
  **Use-case realism** below.
- If the platform's API cannot do what the keyword implies, say so plainly and
  early, then document the supported path.
- Platform-side navigation to a credential screen is the most error-prone part
  of an action doc. Anything not read from source becomes an inline
  `[VERIFY: exact path to the API key screen in <Platform>]` flag in the draft
  **and** a line in the approval preview. Never quietly guess.
  Every `[VERIFY: …]` must be resolved and removed before publishing - grep the
  content for `[VERIFY` as a release gate.

**Extractability - how LLMs and answer engines read the page**

- Every paragraph must survive being lifted out on its own. No orphan pronouns:
  "This mapping lets you…", not "This lets you…".
- Repeat the full platform name in each major section. Retrieval pulls
  fragments, not whole pages, so a section that only says "the platform" is
  unattributable.
- Give an extractable one-sentence definition where a term matters: "Field
  mapping in Bit Integrations is the step where each trigger field is matched to
  a <Platform> field."
- Credentials, scopes, limits, formats and prerequisites belong in a list or
  table, never woven into prose.
- No hedging. "May", "might", "possibly", "generally", "should normally" destroy
  citation value. State the fact, or state its condition: "On the free plan, the
  API returns a 403."

**Readability**

- Second person, active voice, present tense. Short sentences - average under
  20 words, split anything longer.
- Paragraphs of three to four sentences at most.
- Around a grade-8 reading level. Expand an acronym on first use.
- No unexplained jargon, no internal code names, no class or method names in the
  public body.
- Bold the real UI labels the reader must find on screen (`Create Integration`,
  `Integration Name`, `Authorize`, `Map Fields`, `Finish & Save`). Bold is for
  UI labels and warnings only, never for general emphasis.
- Lead with the condition, not the consequence: "If your key is read-only, …".

**Banned language**

- Never `simply`, `just`, `easy`, `obviously`, `of course`. They shame a reader
  who is already stuck - and an action doc's reader is usually stuck on
  credentials.
- Never `seamlessly`, `effortlessly`, `revolutionary`, `game-changing`,
  `the possibilities are endless`, `let's dive in`, `in today's fast-paced
  world`, `it's important to note that`.
- Never promise a ranking, an AI citation or a rich snippet anywhere in the doc
  or in the report about it.

**Punctuation**

- **Never use an em dash (`-`) anywhere in the doc.** Not in prose, headings,
  table cells, image alt text, the TL;DR, the meta description or a use-case
  card. Rewrite instead: split the sentence at a full stop, use a colon before
  an explanation, use a comma for an aside, or use brackets. Two short sentences
  almost always beat one dash-joined sentence.
- The en dash (`-`) is out too. Use a plain hyphen for ranges and compounds
  (`150-160 characters`, `two-part model`).
- Grep the finished Gutenberg HTML for the em dash and the en dash before the
  approval preview; both counts must be `0`, including inside the `<style>`
  block and any CSS comment that ships with it.

**Links and images**

- Two to four internal links to related docs on `bit-integrations.com`: the
  matching trigger doc for the same platform when it exists, the conditional
  logic doc, and one or two trigger-plugin docs named in the use-case section.
  Anchor text must be descriptive and carry the destination's own keyword -
  never `click here`, never a bare URL.
- Link once per destination per page. A second identical link adds nothing.
- Link back to prerequisites and concepts, forward to the logical next task.
- One external link to the platform's own site or API docs where credentials are
  created, when the auth type needs them.
- Name the hub or parent page that will link **in** to this doc in the approval
  preview. For action docs that is the `Actions` section
  (`DOC_ACTION_PARENT_POST_ID`), so no doc ships orphaned.
- Every image needs descriptive alt text stating what the shot shows and where
  it is. No empty alts, no filename alts.
- **The alt must describe what is actually in the frame.** Name the platform
  when the platform is visible; when the screenshot is a generic Bit Integrations
  screen that does not contain it, describe that screen honestly and add the
  platform only as context ("…, the first step of the `<Platform>` action
  setup"). Never write an alt claiming a screenshot shows something it does not -
  including a state that is not captured, such as "with a plugin chosen" on a
  shot where nothing is selected.
- Open every screenshot before writing its alt or placing it. The file name and
  the attachment title are not reliable descriptions, and an image placed under
  the wrong sentence is worse than a placeholder.
- Put the primary keyword in exactly one alt, and only where it reads
  accurately. Do not repeat it across every alt.
- Never let a step exist only inside a screenshot. The instruction must be in
  the text; the image only confirms it. This matters most for credential steps,
  where the reader is copying a value between two browser tabs.

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
<Platform> Integration as an Action
```

Examples: `Bit CRM Integration as an Action`,
`Sender Integration as an Action`. Use the exact `type` value from the `integs`
array in `frontend/src/components/Flow/New/SelectAction.jsx`. Use singular
`Integration`, never `Integrations`.

> **Note:** The post title must be SEO-friendly and user-friendly. Include the
> exact platform name, use natural language, and avoid keyword stuffing, vague
> claims, or awkward repetition.

**EazyDocs Pro Secondary Title / sidebar label:**

```text
<Platform>
```

Examples: `Bit CRM`, `Sender`, `Zoho CRM`. Save this value in
`ezd_doc_secondary_title`. EazyDocs' left-sidebar walker reads it and falls back
to `post_title` only when empty.

**URL slug, fixed for action docs:**

```text
<platform-slug>-integration-as-an-action
```

Examples: `bit-crm-integration-as-an-action`,
`sender-integration-as-an-action`. Always singular `-integration-`, and always
the full `-as-an-action` suffix. Trigger docs use the short
`<platform-slug>-integration`, so the two doc types never collide.

| Doc type | Slug |
|---|---|
| Trigger | `<platform-slug>-integration` |
| Action | `<platform-slug>-integration-as-an-action` |

Older docs on the site use legacy slugs (`<platform>-integrations`). Do not copy
those for new docs, but do check whether a legacy doc for this platform already
exists before creating a new one:

```bash
curl -s "$DOC_SITE_URL/wp-json/wp/v2/docs?parent=$DOC_ACTION_PARENT_POST_ID&search=<Platform>&_fields=id,slug,title"
```

Also check the exact slug is free (`wp/v2/docs?slug=...`) - WordPress silently
renames a duplicate to `...-2`. If it is taken, stop and confirm with the user.

When posting the title to the EazyDocs `create-child` endpoint, replace `&` with
`ezd_ampersand`, `#` with `ezd_hash`, and `+` with `ezd_plus`; that endpoint
decodes them back via `decode_special_chars`. Send the title/slug **raw**
(unencoded) to the core `wp/v2/docs/<id>` endpoint - it does not decode these
tokens, so an encoded title would be stored literally.

## Document structure

The content opens with an H1 that repeats the post title - published action docs
on this site keep the H1 inside the content, so match that. H2 for sections, H3
for steps, H4 for event categories inside the accordion.

Step headings use **Title Case** and a **two-digit number**, zero-padded:
`Step 01: Authorize Zoho CRM`, not `Step 01: Authorize Zoho CRM` and not `Step 01: authorize zoho crm`.
Pad every step from `01` to `09`; `10` and beyond are already two digits.
Numbered sub-steps inside a step follow the same rule (`01.`, `02.`), and
prose that refers to a range uses the padded form too (`Steps 01-03`).

```text
<h1>  <Platform> Integration as an Action
      <TL;DR paragraph>
      <2-3 overview paragraphs>
<h2>  How the <Platform> Action Works
<h2>  Before You Start
<h2>  How to Set Up <Platform> Integration as an Action in Bit Integrations
      <one paragraph: how many steps, work through them in order>
<h3>    Step 01: Create the Integration and Set Up Your Trigger
<h3>    Step 02: Search and Select <Platform> as the Action
<h3>    Step 03: Authorize <Platform>
<h3>    Step 04: Choose Your <Platform> Action Event
<h3>    Step 05: Configure the Action Fields
<h3>    Step 06: Map Your Fields and Finish
<h2>  Explore <N> Useful <Platform> Integration as an Action Ideas
```

When the platform needs credentials created on its own site and that takes more
than two clicks, promote it to its own step placed before `Authorize`:
`Step 02: Create Your <Platform> API Token`, with numbered H3 sub-steps
(`1. Open Account Settings`, `2. Open API Access Tokens`, …), then renumber the
remaining steps. This matches the published Sender doc
(`sender-integration-as-an-action`).

### TL;DR - mandatory, always first

One paragraph, placed immediately after the H1 and before the overview
paragraphs. It is the block a reader in a hurry acts on, and the block answer
engines quote, so it carries the whole procedure in compressed form.

```html
<!-- wp:group {"className":"bi-tldr","layout":{"type":"constrained"}} -->
<div class="wp-block-group bi-tldr"><!-- wp:paragraph --><p class="wp-block-paragraph"><strong>TL;DR:</strong> To set up the &lt;Platform&gt; integration as an action, &lt;shortest accurate path in one sentence, naming the real button and event labels&gt;. You need &lt;credential&gt; from &lt;where it is created&gt;. The whole setup takes about &lt;N&gt; minutes.</p><!-- /wp:paragraph --></div>
<!-- /wp:group -->
```

Rules:

- Two to four sentences. Never more.
- It must work **alone**. An experienced reader acts on the TL;DR and never
  scrolls further, so a path that only makes sense after reading Step 03 has
  failed.
- Name the real UI labels and a real action-event label, bolded, under the same
  accuracy rules as the rest of the page - **Create Integration**,
  **Authorize**, **Finish & Save**, and one event copied verbatim from
  `staticData.js`.
- **Name the credential the reader must fetch, and where it comes from.** This
  is the single thing an action-doc reader most needs up front, and the reason
  they bounce when it is buried in Step 03.
- Contain the primary keyword naturally. This is inside the first 100 words, so
  it satisfies that placement requirement.
- State the prerequisites in the same breath, including
  `Bit Integrations Pro` when the action is Pro-only, and any third-party plan
  tier the API requires.
- Give a time estimate only when the step count supports one. Do not invent a
  number to fill the sentence.
- Adjust the path per auth type: an OAuth platform's TL;DR says click
  **Authorize** and approve access, an API-key platform's says paste the key.

### Overview - 2-3 paragraphs

```text
<Paragraph 1: what the platform manages or does, then one line: with Bit Integrations you can automatically send data from your WordPress website to <Platform>.>

For example, when <one concrete actor does one concrete thing>, Bit Integrations can <real event label from staticData.js> in <Platform> <with the static config that event needs>. When <a second, different concrete scenario>, it can <a second real event label>. <One line on what nobody has to do by hand any more.>
```

The example paragraph is subject to **Use-case realism** below - the same rules
that govern the ideas section. In particular:

- **Never write "when someone submits a form, places an order, or registers as a
  user".** That sentence fits every platform, which is exactly why it is worthless
  because it describes no real workflow and pairs generic triggers with whatever events
  happen to exist.
- Pick the two scenarios by reading the required fields of the events you name.
  An event taking `user_id` and `course_id` gets an LMS scenario, not a contact
  form one.
- Name a role, not "someone": a contributor, an editor, a student, a customer.

Human-written, simple, customer-friendly. No stiff marketing copy, no developer
jargon.

### How the `<Platform>` Action Works

One paragraph, a two-item list, then one closing paragraph:

```text
Every integration in Bit Integrations has two halves. The trigger is what starts the workflow. The action is what happens as a result. When <Platform> is the action, <plain-language statement of where the platform sits - e.g. "your CRM sits at the receiving end">.

- Trigger: an event in another app, such as <3 trigger events that genuinely suit this platform, each naming its plugin>.
- Action: a <Platform> operation, such as <3-4 real event labels from staticData.js>.

Bit Integrations catches the incoming data; you decide which incoming field belongs in which <Platform> field, and from that point on, the record is created for you every single time. <For same-site WordPress plugins, add: Everything runs on your own WordPress install.>
```

The three trigger examples in that list must suit **this** platform - a video
plugin gets a video submission, an LMS lesson completion and an opt-in; a CRM
gets a checkout, a signup and a support request. Do not reuse one generic trio
across docs.

### Before You Start

A short bullet list of real prerequisites only:

```text
- Bit Integrations is installed and activated on your WordPress site.
- <Platform> is installed and activated on the same site.   <- only for AUTH_TYPES.WP_PLUGIN_CHECK integrations; use the exact sentence from noteDetails.note when present
- The trigger plugin you want to use, for example, <two plugins that genuinely suit this platform>, is installed and has at least one <form / course / product> ready.
- A <Platform> account with <the credential the connection needs, named with the UI label>.   <- for API/OAuth integrations
- Bit Integrations Pro is active.   <- only when any staticData.js event is is_pro: true
```

### Setup section lead-in

```text
<N> steps from a blank workflow to a live automation. Work through them in order, because each screen depends on the one before it.
```

### Step craft rules

These apply to every `Step N:` heading, including the numbered credential
sub-steps.

- **One action per step.** If the body needs "and then", it is two steps.
- Open each step with an imperative verb the reader can act on: Click, Open,
  Select, Enter, Enable, Copy, Paste. Never "Configure as needed" - a step you
  cannot describe concretely is not a step.
- Name the exact UI element and its exact label, in the real path form:
  **Bit Integrations → Create Integration**. For platform-side navigation, give
  the real menu path on the platform's own site.
- **State the observable result**, so the reader can confirm they are on track:
  "The connection is saved and the action event list loads." Never end a step on
  a click. This matters most after **Authorize**: say what a successful
  connection looks like, and what an expired or read-only credential looks like.
- Put a warning **before** the action it protects, never after.
- When a step branches by auth type or plan tier, give each branch its own
  labelled sentence or bullet rather than nested "if … otherwise" prose.
- The closing paragraph must contain a concrete success check the reader can
  see - run the trigger once, then which screen in the platform to open and what
  record should appear there - not just "you are done".
- Keep the count realistic. Past about ten steps, group them into phases.

### Step 01: Create the Integration and Set Up Your Trigger

This step uses **two fixed screenshots**, not placeholders. Both are the same on
every action doc, so they come from `.env` and are embedded as real images:

| Position | `.env` key | What it shows |
|---|---|---|
| after paragraph 1 | `DOC_CREATE_INTEGRATION_ATTACHMENT_POST_ID` | the welcome screen with the **Create Integration** button highlighted |
| after paragraph 2 | `DOC_TRIGGER_LIST_ATTACHMENT_POST_ID` | the **Please select a Trigger** screen with the trigger plugin grid |

Split the prose so each image sits under the sentence it illustrates. Do not
put both images at the end of the step, and do not use
`{{PLACEHOLDER:select-trigger}}` here - that slot no longer exists.

```text
From your WordPress dashboard, open Bit Integrations and click Create Integration.

<DOC_CREATE_INTEGRATION_ATTACHMENT_POST_ID image>

On the Please select a Trigger screen, type the plugin you want to pull data from into the Search Trigger... box and click its card. Contact Form 7 is a good first choice for a test run.

<DOC_TRIGGER_LIST_ATTACHMENT_POST_ID image>

Complete the trigger setup for that plugin, which usually means picking the specific form and running a test submission so Bit Integrations can read the field structure. Once that is done, you land on the action selection screen.
```

`Please select a Trigger` and `Search Trigger...` are the real strings
(`frontend/src/components/Flow/New/SelectTrigger.jsx`), matching the
`Please select an Action` label used in Step 02.

Resolve both IDs through `GET $DOC_SITE_URL/wp-json/wp/v2/media/<id>` and embed
`source_url` with the real-image block. Alt text must describe what is actually
in the frame - neither screenshot contains the platform, so do not write an alt
claiming it does.

### Step 02: Search and Select `<Platform>` as the Action

```text
On the "Please select an Action" screen, type <Platform> into the search box and click the <Platform> card when it appears.
```

`Please select an Action` is the real screen heading
(`frontend/src/components/Flow/New/SelectAction.jsx`).

Then `{{PLACEHOLDER:select-action-app}}`.

### Step 03: Authorize `<Platform>`

Open with the integration-name sentence, which is the same for every platform:

```text
Give the integration a name so you can recognise it later in your integrations list, then click Authorize.
```

`Integration Name:` and `Authorize` are the real labels
(`frontend/src/components/Connections/`).

Then, depending on `authDetails.authType`:

- **`wp_plugin_check`**: no connection form. Use the canonical wording:
  `Bit Integrations detects the active <Platform> plugin and authorizes it instantly. There is nothing to copy, paste, or configure. Once the authorization succeeds, click Next.`
- **everything else**: in this order:
  1. Explain the **Connections** dropdown: reuse an existing connection, or click
     **+ Add new connection**. Reusing saves time and avoids duplicates.
  2. The auth-type **Add Connection** sentence from the table below.
  3. `{{PLACEHOLDER:add-connection-form}}`.
  4. The credential retrieval lead-in and numbered steps (below).
  5. `{{PLACEHOLDER:credential-source}}`.
  6. The auth-type **Authorize** sentence from the table below.

Then `{{PLACEHOLDER:authorized}}`.

## Auth-type templates

Read the auth type from `authDetails.authType` in `<Name>Authorization.jsx`
(values in `frontend/src/Utils/connectionAuth.js`). Field labels below are the
real UI strings from `frontend/src/components/Connections/`.

| `authType` | Add Connection sentence | Authorize sentence |
|---|---|---|
| `api_key` | `Click + Add new connection. You will be asked for a Connection Name and your <Platform> API Key.` | `Once your <Platform> API Key is entered, click Authorize. The button turns into Authorized ✔ when the credentials check out.` |
| `bearer_token` | `Click + Add new connection. You will be asked for a Connection Name and your <Platform> Bearer Token.` | `Once your <Platform> Bearer Token is entered, click Authorize. The button turns into Authorized ✔ when the credentials check out.` |
| `basic_auth` | `Click + Add new connection. You will be asked for a Connection Name plus the Username and Password of your <Platform> account.` | `Once your <Platform> Username and Password are entered, click Authorize. The button turns into Authorized ✔ when the credentials check out.` |
| `oauth2` | `Click + Add new connection. You will be asked for a Connection Name, your Client ID, and your Client Secret. Copy the Callback / Redirect URL shown in the form and paste it into your <Platform> app before you save it there.` | `Click Authorize - a <Platform> window opens asking you to approve access. Approve it, and you are returned to Bit Integrations with the connection marked Authorized ✔.` |
| `oauth1` | `Click + Add new connection. You will be asked for a Connection Name, your Consumer Key, and your Consumer Secret. Copy the Callback / Return URL shown in the form and paste it into your <Platform> app before you save it there.` | `Click Authorize - a <Platform> window opens asking you to approve access. Approve it, and you are returned to Bit Integrations with the connection marked Authorized ✔.` |
| `wp_plugin_check` | *(no connection form - see Step 03 above)* | `If the check passes, click Next to continue. If it fails, install or activate <Platform> and try again.` |
| `custom` | Derive from the bespoke fields in `<Name>Authorization.jsx`: list every input label in the order it appears. | `Once every field above is filled in, click Authorize to continue.` |

For `oauth2` / `oauth1`, this app model is self-service: the user registers their
own app on the platform and pastes the client/consumer credentials.

## Credential steps

Lead-in, bolded:

```text
To set up the <Platform> integration with Bit Integrations, you will need your <credential name(s) exactly as labelled in the UI>. Follow these steps to get them.
```

Then a numbered list of concrete UI-navigation steps on the platform's own site.

Source priority:

1. Facts from the integration's own note/helper text (`noteDetails.note`,
   placeholders, helper strings in `<Name>Authorization.jsx`, and any
   `documentation`/`docs` URL in the controller). URLs, product names, menu
   names, and credential locations must appear unchanged and must not be
   contradicted.
2. General knowledge fills gaps with plausible settings-navigation steps.

**Flag these steps in the approval preview**: platform UIs change and the
source text is usually thin.

### Step 04: Choose Your `<Platform>` Action Event

```text
Open the Action dropdown and pick the operation you want <Platform> to perform. All <N> supported actions are in this list, grouped by module.
```

`<N>` is the event count computed from `staticData.js`: never a guessed number.

Then the event accordion (below), then:

```text
Common choices to start with:

- <Event Label> for <why someone would pick it>.
- <Event Label> for <why>.
- <Event Label> for <why>.
```

Then `{{PLACEHOLDER:choose-event}}`.

### Event accordion

Collapsed by default, headed
`See all available <Platform> action events in Bit Integrations`.

Inside it, group events into categories derived from the `name` prefixes in
`staticData.js`, each an `<h4>` named `<Module> Actions` (`Lead Actions`,
`Contact Actions`, `Deal Actions`, `Invoice Actions`, …), followed by one
two-column table:

| Column | Content |
|---|---|
| `Action Event` | The exact `label` string from `staticData.js`, bolded. Nothing appended |
| `What It Does` | One or two sentences, grounded in `RecordApiHelper.php`: which endpoint it hits and what it needs mapped |

Example row from the canonical doc:

> **Create Lead** | Adds a brand new lead to Bit CRM using the data that came
> from your trigger app.

Never reword an event label. When the integration has fewer than about eight
events, one ungrouped table without H4s is fine - the published Sender doc does
that.

**Never append a `(PRO)` marker to an event label**, in this table or anywhere
else in the doc. A marker repeated on every row carries no information, and a
marker on some rows reads as an upsell in the middle of a reference table.
State plan gating once, in prose, where it changes what the reader does:
`Bit Integrations Pro` in `Before You Start`, and a third-party plan
requirement as its own sentence at the step where the reader picks the event.

### Step 05: Configure the Action Fields

```text
Now set the static values that apply to every record this integration creates. Using <First Event Label> as the example, you will see the following options.
```

Then a two-column table, one row per field rendered by `<Name>IntegLayout.jsx`,
in render order:

| Column | Content |
|---|---|
| `Field` | The exact field label from the UI |
| `What to Set` | What it is, where its options come from, and what to pick. Spell out dropdown options when the list is fixed (`Available options are Mr, Mrs, Miss, Ms, and Dr.`); say the list is pulled from the platform when it is fetched live |

Mark required fields as required. Then `{{PLACEHOLDER:configure-action}}`.

### Step 06: Map Your Fields and Finish

```text
This is the step that does the real work. The Field Map screen shows two columns. On the left are the fields coming from your trigger plugin, with sample values from your test submission shown in brackets. On the right are the <Platform> fields.

Pair them up. <Real field name> goes to <Real field name>, and so on. Use the plus button to add another mapping row and the trash icon to remove one you do not need. Use Custom Value when you want to send a fixed value instead of a trigger field.

Turn on Conditional Logics at the bottom of the screen if you only want this action to run some of the time - for example, only create a record when a specific field meets your condition.

When the mapping looks right, click Next, then Finish & Save ✔ to save the integration. Bit Integrations confirms with Successfully Integrated. Run the trigger once for real and check <Platform> to confirm the record appeared exactly as you expected.
```

`Map Fields`, `Conditional Logics`, `Next`, `Finish & Save ✔` and
`Successfully Integrated` are the real UI strings
(`IntegrationHelpers/IntegrationStepThree.jsx`). The published Bit CRM doc says
"click Next to finish and save" - use the real button name instead.

Then `{{PLACEHOLDER:map-fields}}`. Add `{{PLACEHOLDER:integration-log}}` and one
sentence about the integration timeline when the doc should cover logs.

## Use-case section

`<h2>` `Explore <N> Useful <Platform> Integration as an Action Ideas`, then:

```text
Each of these uses the same <N>-step setup described above, with a different trigger plugin at the front.
```

Then one block per idea - the title is a **bold linked paragraph**, not a
heading:

```text
**<Trigger Plugin> <Platform> Integration**   <- the whole title is a link
```

```html
<!-- wp:paragraph --><p class="wp-block-paragraph"><a href="CONNECT_URL"><strong>&lt;Trigger Plugin&gt; &lt;Platform&gt; Integration</strong></a></p><!-- /wp:paragraph -->
```

Then the body of the block:

```text
<One short paragraph of rationale: why this automation matters, in human terms.>

- Trigger: <what happens in the trigger plugin>
- Action: <real action event label(s) from staticData.js>
```

Use four or five ideas. Trigger plugin names must come from
`backend/Core/Util/AllTriggersName.php` or a free trigger's
`{Name}Controller::info()`; the operations named must come from `staticData.js`.

### Use-case realism - hard rules

Every idea must be an automation a real site owner would actually build. This is
the section most likely to go wrong, because generic pairings read fine and are
completely wrong.

**Derive the pairing from the action's field signature, not from a generic
trigger list.** Read the required fields in `staticData.js` and the guard clauses
in the Pro helper *before* choosing a trigger. The fields name the caller:

| Required fields on the event | What that implies |
|---|---|
| `user_id`, `course_id`, `step_id` | an LMS trigger - a lesson or course event |
| an email plus a record identifier | an opt-in or registration form |
| a record ID the reader must already know | a form where a human types that ID, or an edit/admin flow |
| only free text | an intake form, submitted by a person |

**Never claim an outcome the code cannot produce.** Check what the helper writes,
then describe exactly that and nothing more. Recurring traps:

- Adding a record to a container is **not** granting a person access to it.
  A playlist, list, group or category is content grouping. Unless the helper
  writes an entitlement, permission or membership row, never write a use case
  about a buyer "getting", "receiving" or "unlocking" anything.
- Writing a row to an email table is **not** sending an email.
- Recording analytics is **not** changing what a visitor sees.
- Creating a draft is **not** publishing.

**Every field the action needs must be obtainable from that trigger.** If the
event requires a record ID and the trigger is a public form, the use case has to
say the submitter supplies that ID - or pick a different trigger. Never leave a
required field unaccounted for.

**Banned opener.** Do not write "when someone submits a form, places an order, or
registers as a user" - or any variant that lists generic triggers and staples
them to whatever events exist. Name one concrete actor doing one concrete thing:
a contributor, an editor, a student, a customer.

**State the manual work removed.** One clause naming what the reader stops doing
by hand is what makes a use case useful rather than decorative.

**Name the real gotcha** when the event has one - a plan requirement, a field
that must already exist, an irreversible write. A use case that hides the
condition sends the reader into a failed run.

Worked example of the failure this rule exists to prevent:

> ✗ "A customer completes an order in WooCommerce → **Add Media to Playlist** →
> the buyer gets the content the moment the order completes."
> The helper appends media IDs to a playlist's settings array. There is no
> per-user playlist and no entitlement. The automation described does not exist.
>
> ✓ "A student completes a lesson in LearnDash LMS → **Record Watch
> Progression**." The event takes `user_id`, `watched_duration`, `course_id` and
> `step_id`, so an LMS is what it was shaped for.

### Use-case title link

Each title links to the marketing-site connect page for that exact pairing:

```text
https://bit-integrations.com/triggers/<trigger-plugin-connect-slug>/connect/<platform-connect-slug>/
```

Example: `https://bit-integrations.com/triggers/gravity-forms/connect/sender/`

**The trigger plugin is always the first slot and this platform is always the
second**, even though this is an action doc. The connect pages only exist under
`/triggers/…/connect/…`. There is no `/actions/<platform>/connect/<x>/` route -
it soft-404s. `/actions/<platform>/` and `/integrations/<platform>/` also
resolve but serve an unrelated page, so never link to either.

Both slugs belong to the marketing site and are **not derived** from anything in
this repo - not the doc slug, not the `AllTriggersName.php` key, not the
`integs` `type` value. Observed mismatches:

| Source value | Connect slug |
|---|---|
| `Mail Chimp` | `mailchimp` |
| `Fluent CRM` | `fluentcrm` |
| `Google Sheet` | `google-sheets` |
| `FluentPlayer` | `fluent-player` |
| `Contact Form 7` | `contact-form-7` |

**Verify every one of these links before the approval preview.**
`bit-integrations.com` soft-404s: a missing connect page still answers HTTP
`200` with a full-size body, so a status-code check proves nothing. The
`<title>` is the only reliable signal.

Verify **positively**. A live connect page's title matches
`<Platform> Integration with <Trigger Plugin> - Automate Your Tasks`. Do not
test for a specific 404 string - the site serves at least two of them
(`Page not found` and `Page Not Found - Bit Integrations`), so a match against
one of those will pass a dead URL through.

```bash
curl -sL "https://bit-integrations.com/triggers/<trigger-plugin>/connect/<platform>/" \
  | grep -o '<title>[^<]*</title>'
# accept only if it reads "<Platform> Integration with <Trigger Plugin> - Automate Your Tasks"
```

Start from the trigger plugin's own index,
`https://bit-integrations.com/triggers/<trigger-plugin-connect-slug>/`, to find
which pairings exist. If a pairing has no live connect page, choose a different
trigger plugin for that idea rather than shipping a dead link. Report the
verified URLs in the approval preview.

Close with one wrap-up paragraph:

```text
These <N> barely scratch the surface. Bit Integrations connects 378+ apps to <Platform>, including <6-8 real trigger plugin names>. The setup process is the same every time.
```

## Block vocabulary - visual hierarchy

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
light slab on a near-black page - or, worse, keeps the theme's light text and
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
zeroing attributes - they exist only to patch inline padding.

### The stylesheet - paste verbatim as the first block of every doc

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

### The accordion `blockStyle` attribute is decorative - never rely on it

The esab accordion's `blockStyle` attribute is **not applied on the front end**
of this site. A doc that puts its colours there ships unstyled: the head renders
the plugin's default purple and the body takes the theme's dark `#494949`. Keep
whatever `blockStyle` the snippet already carries, but never put a colour you
depend on in it - those rules belong in the `<style>` block above.
### The existing note callout

The site's `note_col` block still exists and renders an info icon above the
literal word **Note**. Use it only for genuine asides. Never use it for the
TL;DR - it would label the primary path as an aside - and never for a warning,
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
<figure class="wp-block-table"><table class="has-fixed-layout"><thead><tr><th><strong>Action Event</strong></th><th><strong>What It Does</strong></th></tr></thead><tbody><tr><td><strong>EVENT LABEL</strong></td><td>WHAT IT DOES</td></tr></tbody></table></figure>
<!-- /wp:table -->

<!-- step 5 configuration table -->
<!-- wp:table {"hasFixedLayout":true} -->
<figure class="wp-block-table"><table class="has-fixed-layout"><thead><tr><th><strong>Field</strong></th><th><strong>What to Set</strong></th></tr></thead><tbody><tr><td><strong>FIELD LABEL</strong></td><td>WHAT TO SET</td></tr></tbody></table></figure>
<!-- /wp:table -->

<!-- styled available-events accordion; use this instead of wp:details -->
<!-- wp:esab/accordion {"uniqueId":"ACCORDION_ID","blockStyle":" .ACCORDION_ID.wp-block-esab-accordion, .ACCORDION_ID.wp-block-esab-accordion.nested-accordion{margin:0 0 30px 0;} .ACCORDION_ID.wp-block-esab-accordion > .esab__container{gap:10px;} .ACCORDION_ID.wp-block-esab-accordion .wp-block-esab-accordion-child{border-style:solid;border-color:#f3a77f;border-width:1px;border-radius:3px;overflow:hidden;} .ACCORDION_ID.wp-block-esab-accordion .wp-block-esab-accordion-child > .esab__head{background:#ffc0a6;padding:14px 10px;gap:8px;} .ACCORDION_ID.wp-block-esab-accordion .esab__heading_tag{color:#263a55;font-weight:700;margin:0;} .ACCORDION_ID.wp-block-esab-accordion .esab__icon svg{fill:#111111;width:20px;height:20px;} .ACCORDION_ID.wp-block-esab-accordion .esab__icon svg path{fill:#111111;} .ACCORDION_ID.wp-block-esab-accordion .wp-block-esab-accordion-child > .esab__body{border-top:1px solid #f3a77f;padding:16px;background:#ffffff;} ","allowAllClose":true} -->
<div class="wp-block-esab-accordion ACCORDION_ID" data-mode="global" data-close="true"><div class="esab__container"><!-- wp:esab/accordion-child {"uniqueId":"ACCORDION_CHILD_ID","blockStyle":" .ACCORDION_CHILD_ID.wp-block-esab-accordion-child .esab__badge{border-style: solid;} ","heading":"<strong>See all available PLATFORM action events in Bit Integrations</strong>","headingTag":"p","collapsedIcon":"esab__circle_plus","expandedIcon":"esab__circle_minus"} -->
<div class="wp-block-esab-accordion-child"><div class="esab__head" role="button" aria-expanded="false"><div class="esab__heading_txt"><p class="esab__heading_tag"><strong>See all available PLATFORM action events in Bit Integrations</strong></p></div><div class="esab__icon"><div class="esab__collapse"> <svg version="1.2" viewBox="0 0 24 24" width="24" height="24"><path fill-rule="evenodd" d="m3.5 20.5c-4.7-4.7-4.7-12.3 0-17 4.7-4.7 12.3-4.7 17 0 4.6 4.7 4.6 12.3 0 17-4.7 4.6-12.3 4.6-17 0zm0.9-0.9c4.2 4.2 11 4.2 15.2 0 4.2-4.2 4.2-11 0-15.2-4.2-4.3-11-4.3-15.2 0-4.3 4.2-4.3 11 0 15.2z"></path><path d="m11.4 15.9v-3.3h-3.3c-0.3 0-0.6-0.3-0.6-0.6 0-0.4 0.3-0.6 0.6-0.6h3.3v-3.3c0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6v3.3h3.3c0.3 0 0.6 0.2 0.6 0.6q0 0.2-0.2 0.4-0.2 0.2-0.4 0.2h-3.3v3.3q0 0.2-0.2 0.4-0.2 0.2-0.4 0.2c-0.4 0-0.6-0.3-0.6-0.6z"></path></svg> </div><div class="esab__expand"> <svg version="1.2" viewBox="0 0 24 24" width="24" height="24"><path fill-rule="evenodd" d="m12 24c-6.6 0-12-5.4-12-12 0-6.6 5.4-12 12-12 6.6 0 12 5.4 12 12 0 6.6-5.4 12-12 12zm10.6-12c0-5.9-4.7-10.6-10.6-10.6-5.9 0-10.6 4.7-10.6 10.6 0 5.9 4.7 10.6 10.6 10.6 5.9 0 10.6-4.7 10.6-10.6z"></path><path d="m5.6 11.3h12.8v1.4h-12.8z"></path></svg> </div></div></div><div class="esab__body">H4 CATEGORY HEADINGS + EVENT TABLES GO HERE</div></div>
<!-- /wp:esab/accordion-child --></div></div>
<!-- /wp:esab/accordion -->

<!-- note / info callout -->
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
must follow the site's style - a plain sentence describing the shot. The alts
below are the ones used in the canonical Bit CRM doc, with the platform
substituted.

Step 01 has no placeholder slot - it uses the two fixed screenshots from `.env`
described in the Step 01 section above.

| Slot | Alt text |
|---|---|
| `select-action-app` | `Search and select <Platform> as an action` |
| `add-connection-form` | `Add a <Platform> connection in Bit Integrations` |
| `credential-source` | `<Platform> settings page where the credential is copied from` |
| `authorized` | `Click on <Platform> Authorize button` |
| `choose-event` | `Choose specific <Platform> action event` |
| `configure-action` | `Configure the integration` |
| `field-<id>` | `<Field Label> field filled in, in the <Platform> action settings` |
| `map-fields` | `Map the fields between trigger fields with <Platform> fields` |
| `integration-log` | `<Platform> integration timeline and logs` |

Resolve `DOC_PLACEHOLDER_ATTACHMENT_POST_ID` through
`GET $DOC_SITE_URL/wp-json/wp/v2/media/<id>` and embed its `source_url`. Do not
upload or cache these images.

## Media and EazyDocs API

Read credentials, the parent section post ID, and media IDs from `.env`:
`DOC_SITE_URL`, `DOC_SITE_USERNAME`, `DOC_SITE_PASSWORD`,
`DOC_ACTION_PARENT_POST_ID`, `DOC_PLACEHOLDER_ATTACHMENT_POST_ID`,
`DOC_CREATE_INTEGRATION_ATTACHMENT_POST_ID`,
`DOC_TRIGGER_LIST_ATTACHMENT_POST_ID`.
`DOC_SITE_PASSWORD` must be a WordPress Application Password. Never print it.

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
  -d '{"parent_id":<DOC_ACTION_PARENT_POST_ID>,"title":"<encoded title>","post_status":"draft"}' \
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
  "slug": "<platform-slug>-integration-as-an-action",
  "title": "<Platform> Integration as an Action",
  "ezd_doc_secondary_title": "<Platform>",
  "content": "<gutenberg html beginning with the h1>"
}
```

`ezd_doc_secondary_title` is exposed as a REST **field** on the `docs` post type
(via `register_rest_field`) by a site-specific code snippet - EazyDocs Pro's own
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
