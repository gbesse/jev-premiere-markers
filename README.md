# jev-premiere-markers

A Premiere UXP panel that turns typed Jev review findings into timeline markers. Paste an SRT export, choose a declared review pack, inspect the exact-caption findings, then add every marker to the active sequence in one undoable transaction.

The model never writes feedback. Pass one answers finite `noul` issue questions. Pass two selects one of the submitted caption IDs. Marker comments are copied byte-for-byte from that caption.

## Develop

Requirements: Node 22+, Premiere 25.6+, and UXP Developer Tool 2.2+.

```bash
npm install
npm test
npm run check
npm run demo
```

Load this repository's `manifest.json` in UXP Developer Tool after `npm run build`, then open **Window → UXP Plugins → Jev Review Markers** in Premiere.

## Try the caption-ID guard offline

`npm run demo:guard` parses a short synthetic SRT, builds finite caption choices and rejects a fabricated `caption_99` response before any marker plan can be created. It uses no API key or Premiere session. The host-specific marker transaction still requires validation in Premiere.

## Security and privacy

- The API key is held in the panel's memory and is never persisted.
- Network permission is restricted to `https://api.typesafe.ai`.
- Caption text leaves Premiere only when **Review** is clicked.
- No live Jev call runs in tests or the demo.
- Large subtitle sets are deliberately capped at 255 captions, matching the finite choice boundary.

## Status

The SRT parser, typed request construction, response guards, exact-quote marker plan, UXP manifest, and Premiere action scoping are implemented and tested. This environment did not have Premiere or UXP Developer Tool installed, so loading the panel and executing its marker transaction still require host validation.

MIT — see [LICENSE](LICENSE).

