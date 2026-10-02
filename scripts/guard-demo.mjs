// Reject an invented caption citation before planning Premiere markers.
import {parseSrt, buildLocationRequest, validateResponse} from '../src/core.js';
const captions = parseSrt('1\n00:00:01,000 --> 00:00:03,000\nGuaranteed results.');
const request = buildLocationRequest(captions, [{id: 'unsupported', instructions: 'Is this claim supported?'}]);
const fabricated = {model: 'jev-1.13.0', usage: {input_tokens: 10}, answers: {unsupported: {type: 'choice', choice: 'caption_99'}}};
let rejected = false;
try { validateResponse(fabricated, request.questions); }
catch (error) { rejected = /Invalid choice/.test(error.message); }
if (!rejected) throw new Error('Invented caption was accepted');
console.log(JSON.stringify({source: 'synthetic SRT and response; no Premiere or Jev', allowedCaptionIds: captions.map(caption => caption.id), inventedCaptionRejected: rejected}, null, 2));
