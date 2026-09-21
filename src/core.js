export const MODEL = 'jev-1.13.0';

function seconds(value) {
  const match = /^(\d{2}):(\d{2}):(\d{2})[,.](\d{3})$/.exec(value.trim());
  if (!match) throw new TypeError(`Invalid SRT timecode: ${value}`);
  const [, hours, minutes, secs, millis] = match.map(Number);
  if (minutes > 59 || secs > 59) throw new TypeError(`Invalid SRT timecode: ${value}`);
  return hours * 3600 + minutes * 60 + secs + millis / 1000;
}

export function parseSrt(input) {
  if (typeof input !== 'string') throw new TypeError('SRT input must be text');
  const blocks = input.replaceAll('\r\n', '\n').trim().split(/\n{2,}/);
  const captions = [];
  for (const block of blocks) {
    const lines = block.split('\n');
    const timingIndex = lines.findIndex(line => line.includes('-->'));
    if (timingIndex < 0) continue;
    const [startRaw, endRaw] = lines[timingIndex].split('-->').map(part => part.trim().split(/\s+/)[0]);
    const text = lines.slice(timingIndex + 1).join('\n').trim();
    if (!text) continue;
    const start = seconds(startRaw), end = seconds(endRaw);
    if (end <= start) throw new TypeError(`Caption must end after it starts: ${lines[timingIndex]}`);
    captions.push({ id: `caption_${captions.length + 1}`, sourceIndex: lines[0]?.trim() || String(captions.length + 1), start, end, text });
  }
  if (!captions.length) throw new TypeError('No valid SRT captions found');
  if (captions.length > 255) throw new TypeError('This release accepts at most 255 captions per review');
  return captions;
}

export function validatePack(pack) {
  if (!pack?.id || !Array.isArray(pack.issues) || !pack.issues.length) throw new TypeError('Pack requires id and issues');
  const ids = new Set();
  for (const issue of pack.issues) {
    if (!issue.id || ids.has(issue.id) || !issue.label || !issue.instructions) throw new TypeError('Issue requires a unique id, label and instructions');
    if (typeof issue.markAbove !== 'number' || issue.markAbove < 0 || issue.markAbove > 1) throw new TypeError(`${issue.id}: markAbove must be in [0,1]`);
    ids.add(issue.id);
  }
  return pack;
}

export function buildDetectionRequest(captions, pack) {
  validatePack(pack);
  return {
    model: MODEL,
    state: { captions: captions.map(({ id, text }) => ({ id, text })) },
    questions: Object.fromEntries(pack.issues.map(issue => [issue.id, { type: 'noul', instructions: issue.instructions }]))
  };
}

export function issuesToLocate(response, pack) {
  return pack.issues.filter(issue => response.answers[issue.id]?.type === 'noul' && response.answers[issue.id].noul >= issue.markAbove);
}

export function buildLocationRequest(captions, issues) {
  const criteria = Object.fromEntries(captions.map(caption => [caption.id, { text: caption.text }]));
  return {
    model: MODEL,
    state: { captions: captions.map(({ id, text }) => ({ id, text })) },
    questions: Object.fromEntries(issues.map(issue => [issue.id, {
      type: 'choice', instructions: `Which exact caption most strongly demonstrates this issue? ${issue.instructions}`, criteria
    }]))
  };
}

export function createMarkerPlan(captions, issues, locationResponse) {
  const byId = new Map(captions.map(caption => [caption.id, caption]));
  return issues.flatMap(issue => {
    const answer = locationResponse.answers[issue.id];
    const caption = answer?.type === 'choice' ? byId.get(answer.choice) : null;
    return caption ? [{
      issueId: issue.id, name: `Jev: ${issue.label}`, markerType: 'Comment',
      start: caption.start, duration: caption.end - caption.start,
      comments: caption.text, captionId: caption.id
    }] : [];
  });
}

export function validateResponse(response, questions) {
  if (response?.model !== MODEL || !response.answers || !Number.isInteger(response.usage?.input_tokens)) throw new TypeError('Invalid Jev response envelope');
  for (const [id, question] of Object.entries(questions)) {
    const answer = response.answers[id];
    if (!answer || answer.type !== question.type) throw new TypeError(`Missing or mismatched answer: ${id}`);
    if (answer.type === 'noul' && (!Number.isFinite(answer.noul) || answer.noul < 0 || answer.noul > 1)) throw new TypeError(`Invalid noul: ${id}`);
    if (answer.type === 'choice' && !(answer.choice in question.criteria)) throw new TypeError(`Invalid choice: ${id}`);
  }
  return response;
}

