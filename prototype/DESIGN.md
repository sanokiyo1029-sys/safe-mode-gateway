# Design: Safe-Mode Gateway operator dashboard

The dashboard is a tool an operator keeps open while agents work, so it is built for scanning and fast decisions, in the same white and purple world as the demo video.

## Color

The color strategy is restrained: tinted neutrals plus one purple accent. Purple marks actions, the current selection, and "waiting for you". Green, amber and red only ever mean read, write and destructive, or success and failure.

| Token | Value | Use |
|---|---|---|
| `--ink` | `#2b2540` | Body text, the decision card's outline |
| `--muted` | `#6b6484` | Secondary text and placeholders (4.5:1 or better on white) |
| `--bg` / `--panel` | `#f6f4fb` / `#ffffff` | App background and panels |
| `--line` / `--line-2` | `#e7e3f0` / `#d9d3ea` | Dividers and control borders |
| `--accent` | `#6b5bc2` | Primary buttons, focus rings, selected tab, "waiting" status |
| `--lilac` / `--wash` | `#cfc6f5` / `#f3f0fb` | Text selection, soft fills, the decision card's arrival ring |
| `--read` | `#13834a` on `#e9f6ee` | Read calls, "Ran" |
| `--write` | `#9a5c08` on `#fdf3e3` | Write calls |
| `--danger` | `#c22f3b` on `#fdecee` | Destructive calls, "Denied", Approve delete |

## Type

- **Inter** does all the work: UI, labels, buttons, and the 14px base size.
- **JetBrains Mono** is only for tool names, arguments, paths and timestamps (with tabular numbers).
- **Fraunces 800** is only for the wordmark, carried over from the video.
- Scale: 12, 12.5, 13.5, 14, 15 (panel titles), 17 (decision title), 20 (wordmark).

## Demo story and at-risk files

- **Demo story** (top of the left column) is the presenter's checklist. Five steps each have a Run button and tick themselves off from the activity log. The step up next gets a lavender row, a purple number and a primary Run button. Only that step shows its hint, so the list stays short. Done steps turn into green checks.
- **While a call waits**, the workspace tree tints what it would touch: red (`--danger-bg`) for a delete, which tints the whole folder, and amber (`--write-bg`) for a write or rename.

## Shape and depth

- Panels: 14px radius, a 1px line, and a soft two-layer shadow.
- Controls: 10px radius. Pills are fully rounded.
- **The decision card** is the one sticker element, borrowed from the video: a 2px ink outline, a white ring, a hairline ring, and a deeper shadow. Nothing else uses it, so a waiting decision always reads first.

## Layout

| Width | Layout |
|---|---|
| ≥1180px | Three columns: demo story, workspace and policy (300px), decisions and live calls (flexible), agent (350px). The app fills the viewport at 1440×900 with no page scroll, and each panel scrolls on its own. |
| 760 to 1180px | Two columns, decisions and calls beside the agent, with demo story, workspace and policy as a full-width row below. The header's endpoint chip hides below 1000px; the endpoint is still in "Connect your own agent". |
| <760px | One column, with decisions first. The top bar collapses to icon buttons, and Deny and Approve split the card's width. |

## Motion

There is one signature moment: a decision card arrives in 320ms (exponential ease-out, rising 12px, with a lilac ring that settles into the sticker ring) and leaves in 180ms. Everything else is state feedback at 150 to 240ms:
- new call rows slide in and flash lilac
- tree items that changed flash
- the dot on a waiting status pulses

Items already on screen at page load appear without motion. `prefers-reduced-motion` turns all of it off.

## Interaction and accessibility

- A and D approve or deny the oldest waiting decision, unless focus is in a text field. The hints only show where there's a keyboard.
- The policy controls are radio groups (Run, Ask, Block) that work with the arrow keys.
- The tabs follow the ARIA tabs pattern.
- Decisions, chat and toasts are live regions for screen readers.
- Focus rings, text selection, the caret and scrollbars are all themed from the palette.
- Icons are one drawn SVG set (1.85 stroke, round caps); there are no emoji.
