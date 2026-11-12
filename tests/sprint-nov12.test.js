import test from 'node:test';import assert from 'node:assert/strict';
import {clipMarkerPlan,validateMarkerPlan} from '../src/core.js';
const m={start:2,duration:4,name:'user title',comments:'texte utilisateur',markerType:'Comment',captionId:'a'};
test('half-open clipping retains exact source interval and user text',()=>{const p=clipMarkerPlan([m],{start:3,end:5});assert.equal(p[0].start,3);assert.equal(p[0].duration,2);assert.deepEqual(p[0].sourceInterval,{start:2,duration:4});assert.equal(p[0].comments,m.comments);assert.equal(m.start,2);assert.deepEqual(clipMarkerPlan([m],{start:6,end:7}),[]);});
test('repeated clips preserve original provenance and reject overflowing endpoints',()=>{const p=clipMarkerPlan(clipMarkerPlan([m],{start:3,end:6}),{start:4,end:5});assert.deepEqual(p[0].sourceInterval,{start:2,duration:4});assert.throws(()=>clipMarkerPlan([m],{start:5,end:5}));assert.throws(()=>validateMarkerPlan([{...m,start:1e308,duration:1e308}]));});

test('clip provenance does not alias its source',()=>{const a=clipMarkerPlan([m],{start:3,end:6});const b=clipMarkerPlan(a,{start:4,end:5});b[0].sourceInterval.start=99;assert.equal(a[0].sourceInterval.start,2);});
