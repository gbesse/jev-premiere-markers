import test from 'node:test';import assert from 'node:assert/strict';
import {addMarkersToActiveSequence,getActiveSequenceIdentity} from '../src/premiere.js';
const plan=[{name:'Jev: issue',markerType:'Comment',start:1,duration:2,comments:'exact caption'}];
function host(){let mutations=0,reads=0;const sequence={guid:{toString:()=> 'sequence-one'}};
 const project={guid:{toString:()=> 'project-one'},getActiveSequence:async()=>sequence,lockedAccess:fn=>fn(),executeTransaction:fn=>fn({addAction(){mutations++;}})};
 const premiere={Project:{getActiveProject:async()=>{reads++;return project;}},Markers:{getMarkers:async()=>({createAddMarkerAction:()=>({})})},TickTime:{createWithSeconds:x=>x}};
 return {premiere,sequence,get mutations(){return mutations;},get reads(){return reads;}};}
test('marker application is bound to the reviewed sequence and remains one host transaction',async()=>{
 const mock=host(),expectedIdentity=await getActiveSequenceIdentity(mock.premiere);
 assert.equal(await addMarkersToActiveSequence(plan,mock.premiere,{expectedIdentity}),1);assert.equal(mock.mutations,1);
});
test('changed sequence blocks every marker mutation',async()=>{
 const mock=host(),expectedIdentity=await getActiveSequenceIdentity(mock.premiere);mock.sequence.guid.toString=()=> 'other-sequence';
 await assert.rejects(addMarkersToActiveSequence(plan,mock.premiere,{expectedIdentity}),/Sequence changed/);assert.equal(mock.mutations,0);
});
test('a later invalid marker fails before any host lookup or transaction',async()=>{
 const mock=host();await assert.rejects(addMarkersToActiveSequence([...plan,{...plan[0],duration:NaN}],mock.premiere),/Invalid marker/);assert.equal(mock.reads,0);assert.equal(mock.mutations,0);
});
