import editorial from '../packs/editorial.json';
import risk from '../packs/risk.json';
import { parseSrt, buildDetectionRequest, issuesToLocate, buildLocationRequest, createMarkerPlan } from './core.js';
import { callJev } from './client.js';
import { addMarkersToActiveSequence } from './premiere.js';

const packs = { editorial, risk };
let markerPlan = [];
const byId = id => document.getElementById(id);
const escapeHtml = value => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

async function review() {
  const status = byId('status');
  try {
    byId('review').disabled = true; byId('apply').disabled = true; markerPlan = [];
    const captions = parseSrt(byId('srt').value), pack = packs[byId('pack').value], apiKey = byId('key').value;
    status.textContent = `Checking ${captions.length} captions…`;
    const detection = await callJev(buildDetectionRequest(captions, pack), { apiKey });
    const issues = issuesToLocate(detection, pack);
    if (!issues.length) {
      byId('results').innerHTML = '<p class="empty">No issue crossed the pack thresholds.</p>';
      status.textContent = `Review complete · ${detection.usage.input_tokens} input tokens`;
      return;
    }
    status.textContent = `Locating ${issues.length} issue${issues.length === 1 ? '' : 's'}…`;
    const location = await callJev(buildLocationRequest(captions, issues), { apiKey });
    markerPlan = createMarkerPlan(captions, issues, location);
    byId('results').innerHTML = markerPlan.map(marker => `<div class="finding"><strong>${escapeHtml(marker.name)}</strong><span>${escapeHtml(marker.comments)}</span></div>`).join('');
    byId('apply').disabled = !markerPlan.length;
    status.textContent = `${markerPlan.length} exact-caption marker${markerPlan.length === 1 ? '' : 's'} ready · ${detection.usage.input_tokens + location.usage.input_tokens} input tokens`;
  } catch (error) { status.textContent = error instanceof Error ? error.message : String(error); }
  finally { byId('review').disabled = false; }
}

async function apply() {
  try {
    byId('apply').disabled = true;
    const count = await addMarkersToActiveSequence(markerPlan);
    byId('status').textContent = `${count} marker${count === 1 ? '' : 's'} added in one undoable transaction.`;
  } catch (error) { byId('status').textContent = error instanceof Error ? error.message : String(error); }
  finally { byId('apply').disabled = !markerPlan.length; }
}

byId('review').addEventListener('click', review);
byId('apply').addEventListener('click', apply);
require('uxp').entrypoints.setup({ panels: { jevMarkers: {} } });

