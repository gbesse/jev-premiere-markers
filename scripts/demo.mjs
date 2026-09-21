import risk from '../packs/risk.json' with { type: 'json' };
import { parseSrt, buildDetectionRequest, issuesToLocate, buildLocationRequest, createMarkerPlan } from '../src/core.js';
const captions = parseSrt('1\n00:00:01,000 --> 00:00:03,500\nGuaranteed to double your output.\n\n2\n00:00:04,000 --> 00:00:06,000\nSee the method in action.');
const first = { model:'jev-1.13.0', answers:Object.fromEntries(risk.issues.map(issue => [issue.id,{type:'noul',noul:issue.id==='unsupported'?.9:.1}])), usage:{input_tokens:80,output_tokens:0} };
const issues = issuesToLocate(first, risk), request = buildLocationRequest(captions, issues);
const second = { model:'jev-1.13.0', answers:{unsupported:{type:'choice',choice:'caption_1'}}, usage:{input_tokens:60,output_tokens:0} };
console.log(JSON.stringify({ detection: buildDetectionRequest(captions,risk), location: request, markers: createMarkerPlan(captions,issues,second) }, null, 2));

