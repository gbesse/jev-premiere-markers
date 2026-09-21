export async function addMarkersToActiveSequence(plan, premiere = require('premierepro')) {
  if (!plan.length) return 0;
  const project = await premiere.Project.getActiveProject();
  if (!project) throw new Error('Open a Premiere project first');
  const sequence = await project.getActiveSequence();
  if (!sequence) throw new Error('Open an active sequence first');
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

