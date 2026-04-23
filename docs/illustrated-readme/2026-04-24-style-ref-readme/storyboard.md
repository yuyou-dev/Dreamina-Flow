# Workflow Studio OSS Illustrated README Storyboard

## Audience

- First-time visitors who need to understand what this repository is for.
- Contributors who need a fast map of the runtime chain, directories, and verification entry points.

## Visual Direction

- Language: Simplified Chinese
- Ratio: `16:9` for every generated image
- Style source: `style-ref/style-reference.jpg`
- Adapted cues: cobalt-blue oversized type, pale-gray paper texture, rounded white cards, sticker labels, halftone dots, black-outline arrows
- Constraint: preserve repo facts; do not imitate the reference brand, logo, or characters

## Image Slots

1. `images/style-board.png`
   - Purpose: lock palette, card language, typography direction, and background motifs before production images.
2. `images/hero.png`
   - Purpose: explain the project in one glance.
   - Must show: workflow canvas, CLI bridge, four-layer repo cards, `.workflow.json`.
3. `images/architecture.png`
   - Purpose: support the architecture section.
   - Must show: `apps/studio-web`, `apps/studio-api`, `packages/dreamina-adapter`, `packages/workflow-core`.
4. `images/workflow.png`
   - Purpose: explain one execution path end to end.
   - Must show: validation, node/flow run, device login, polling, result writeback.
5. `images/highlights.png`
   - Purpose: summarize top capabilities in one board.
   - Must show: node packaging, browser canvas, `.workflow.json`, starter/examples, login recovery.
6. `images/quick-start.png`
   - Purpose: support setup and first-run instructions.
   - Must show: Dreamina CLI install, `npm install`, `npm run dev`, `3000/3100`, `macOS`, `Node.js 20+`.

## Grounding Notes

- Facts sourced from `README.md`, `docs/technical-overview.md`, `docs/workflow-json-format.md`, workspace `package.json`, and package-level `package.json` files.
- No claim about hosted deployment, production scale, or cloud service is included.
- The README remains usable in plain Markdown even if images fail to load.
