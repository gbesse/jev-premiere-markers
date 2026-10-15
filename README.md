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

## Contrôle d’adoption · Adoption check · Comprobación de adopción

[Français : essayer un cas synthétique](examples/adoption-check.md) · [English: try a synthetic case](examples/adoption-check.md) · [Español: pruebe un caso sintético](examples/adoption-check.md).

## Reviewed sequence binding / Liaison à la séquence / Vínculo a secuencia

EN: The panel captures project/sequence GUIDs before review and refuses to apply markers after switching either context. All marker intervals and fields are validated before host lookup/transaction. `getActiveSequenceIdentity` and the optional `expectedIdentity` application option expose this guard to integrations. Identity checks do not detect edits inside the same timeline or lock it during inference. Tests mock the installed Premiere SDK boundary; native Premiere/UXP loading and undo behavior remain host checks, with no live account or project changed here.

FR : Le panneau capture les GUID projet/séquence avant revue et refuse les marqueurs si le contexte change. Tous les intervalles/champs sont validés avant accès ou transaction hôte. `getActiveSequenceIdentity` et l’option `expectedIdentity` exposent la garde aux intégrations. Elle ne détecte pas les modifications dans la même timeline et ne la verrouille pas pendant l’inférence. Les tests simulent la frontière du SDK installé ; chargement Premiere/UXP et annulation restent à vérifier dans l’hôte, sans compte ni projet réel modifié ici.

ES: El panel captura GUID de proyecto/secuencia antes de revisar y rechaza aplicar marcadores si cambia contexto. Valida intervalos/campos antes de acceso/transacción del host. `getActiveSequenceIdentity` y opción `expectedIdentity` exponen la guarda. No detecta cambios dentro de la misma timeline ni la bloquea durante inferencia. Pruebas simulan la frontera del SDK instalado; carga Premiere/UXP y deshacer siguen siendo comprobaciones del host, sin modificar cuentas/proyectos reales.
