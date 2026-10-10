import assert from 'node:assert/strict';
import { parseSrt } from '../src/core.js';

const invalid = '1\n00:00:03,000 --> 00:00:01,000\nSynthetic caption.';
assert.throws(() => parseSrt(invalid), /Caption must end after it starts/);
console.log(JSON.stringify({ caseId: 'invalid_subtitle_interval', rejectedBeforeMarkerPlan: true }, null, 2));
