# Architecture

`src/core.js` owns deterministic SRT parsing and the two finite Jev request shapes. `src/client.js` owns the pinned model, timeout, bounded retries, and response validation. `src/premiere.js` is the only host boundary: it obtains the active sequence and creates all marker actions synchronously inside `lockedAccess` and `executeTransaction`. `src/panel.js` coordinates the UI.

The split keeps the expensive and host-specific edges thin while making the input-to-marker provenance testable in ordinary Node.

