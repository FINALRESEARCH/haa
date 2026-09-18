# HAA

The Horowitz Andreessen Academy site. Next.js 16 (App Router, Turbopack) with an
embedded Sanity Studio.

## Getting started

```bash
npm install
cp .env.example .env.local   # then paste in the two tokens
npm run dev
```

- Site: <http://localhost:3000>
- Studio: <http://localhost:3000/studio>

## Content

Everything on the page is editable in the Studio. Nothing is hard-coded in a
component any more:

| Studio document   | What it drives                                               |
| ----------------- | ------------------------------------------------------------ |
| **Home page**     | All six screens — hero, network, program, admissions, people wall, partners. Copy, links, images, and which partner layout ships. |
| **Navigation**    | The menu bar and each drop-down panel.                        |
| **Site settings** | Page title and description, the nav button, the logo and wordmark, the mark's SVG path, and the five theme colours. |
| **People**        | Portraits used by the network grid and the people wall.       |
| **Partners**      | Partner marks, with a per-mark optical scale.                 |

`src/content/defaults.ts` holds the site exactly as it read before Sanity, and
backs every field. If a field is cleared, or the Content Lake is unreachable,
that value renders instead of a hole.

### Seeding

```bash
npm run sanity:seed
```

Uploads everything in `public/` as Sanity assets and writes the documents. It
uses `createIfNotExists`, so it never overwrites an editor's work — delete a
document in the Studio first if you want it rebuilt.

## Previewing drafts

The Studio's **Presentation** tool renders the site next to the editor with
click-to-edit overlays. Published changes stream to open pages over Sanity's
Live Content API, so a publish shows up without a redeploy.

## Variants

Some sections ship more than one layout. The Studio picks the default (Home
page → Partners → Layout); `?partners=2` still overrides it locally, and the
switcher in the bottom-right corner writes those params. The switcher is
compiled out of production builds unless `NEXT_PUBLIC_VARIANTS=1`.

Adding a variant: drop `v2.tsx` into the section's folder, add a line to its
`index.ts`, and — if the section has a layout picker — add the matching option
in `src/sanity/schema/sections.ts`.

## Deploying

Set the four variables from `.env.example` on the host (`SANITY_API_WRITE_TOKEN`
is not needed at runtime), and add the deployed origin under
[CORS origins](https://www.sanity.io/manage/project/itsaouhp/api) so the Studio
can reach the API from it.

## Layout

```
src/app/(site)      the marketing site: palette, live content, editing overlays
src/app/studio      the embedded Studio
src/content         the content shape and its defaults
src/sanity          client, queries, schema, and the Sanity → props mapper
src/variants        the section registry behind the layout switcher
```
