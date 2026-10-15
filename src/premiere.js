import { validateMarkerPlan } from './core.js';
export async function getActiveSequenceIdentity(premiere = require('premierepro')) {
  const project = await premiere.Project.getActiveProject();
  const sequence = project && await project.getActiveSequence();
  if (!project || !sequence) throw new Error('Projet et séquence actifs requis / Active project and sequence required / Se requieren proyecto y secuencia activos');
  return { projectGuid: project.guid.toString(), sequenceGuid: sequence.guid.toString() };
}

export async function addMarkersToActiveSequence(plan, premiere = require('premierepro'), { expectedIdentity } = {}) {
  validateMarkerPlan(plan);
  if (!plan.length) return 0;
  const project = await premiere.Project.getActiveProject();
  if (!project) throw new Error('Open a Premiere project first');
  const sequence = await project.getActiveSequence();
  if (!sequence) throw new Error('Open an active sequence first');
  if (expectedIdentity && (project.guid.toString() !== expectedIdentity.projectGuid || sequence.guid.toString() !== expectedIdentity.sequenceGuid))
    throw new Error('Séquence changée : refaire la revue / Sequence changed: review again / Secuencia cambiada: repita la revisión');
  const markers = await premiere.Markers.getMarkers(sequence);
  project.lockedAccess(() => {
    project.executeTransaction(compoundAction => {
      for (const marker of plan) {
        const start = premiere.TickTime.createWithSeconds(marker.start);
        const duration = premiere.TickTime.createWithSeconds(marker.duration);
        compoundAction.addAction(markers.createAddMarkerAction(marker.name, marker.markerType, start, duration, marker.comments));
      }
    }, `Add ${plan.length} Jev review marker${plan.length === 1 ? '' : 's'}`);
  });
  return plan.length;
}

