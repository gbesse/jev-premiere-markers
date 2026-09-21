import test from 'node:test';
import assert from 'node:assert/strict';
import risk from '../packs/risk.json' with { type: 'json' };
import { parseSrt, buildDetectionRequest, issuesToLocate, buildLocationRequest, createMarkerPlan, validateResponse } from '../src/core.js';

const sample = '1\r\n00:00:01,250 --> 00:00:03,750\r\nGuaranteed results.\r\n\r\n2\r\n00:00:04.000 --> 00:00:06.500\r\nSecond line\r\ncontinues here.';
test('parses SRT timing and preserves exact caption text', () => {
  assert.deepEqual(parseSrt(sample), [
    {id:'caption_1',sourceIndex:'1',start:1.25,end:3.75,text:'Guaranteed results.'},
    {id:'caption_2',sourceIndex:'2',start:4,end:6.5,text:'Second line\ncontinues here.'}
  ]);
});
test('rejects malformed and oversized subtitle sets', () => {
  assert.throws(() => parseSrt('not subtitles'), /No valid/);
  const huge = Array.from({length:256},(_,i)=>`${i+1}\n00:00:00,000 --> 00:00:01,000\nx`).join('\n\n');
  assert.throws(() => parseSrt(huge), /at most 255/);
});
test('builds typed two-pass requests and exact-caption markers', () => {
  const captions = parseSrt(sample), detection = buildDetectionRequest(captions, risk);
  assert.equal(detection.model, 'jev-1.13.0');
  assert.ok(Object.values(detection.questions).every(q => q.type === 'noul'));
  const answers = Object.fromEntries(risk.issues.map(issue => [issue.id,{type:'noul',noul:issue.id==='absolute'?.9:.1}]));
  const issues = issuesToLocate({answers}, risk);
  const location = buildLocationRequest(captions, issues);
  assert.deepEqual(Object.keys(location.questions.absolute.criteria), ['caption_1','caption_2']);
  const plan = createMarkerPlan(captions, issues, {answers:{absolute:{type:'choice',choice:'caption_1'}}});
  assert.deepEqual(plan[0], {issueId:'absolute',name:'Jev: Absolute wording',markerType:'Comment',start:1.25,duration:2.5,comments:'Guaranteed results.',captionId:'caption_1'});
});
test('validates finite responses', () => {
  const captions = parseSrt(sample), request = buildLocationRequest(captions,[risk.issues[0]]);
  assert.throws(()=>validateResponse({model:'jev-1.13.0',answers:{unsupported:{type:'choice',choice:'invented'}},usage:{input_tokens:1}},request.questions),/Invalid choice/);
});

