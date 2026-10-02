// Purpose: Verify the UXP transport's timeout lifecycle, retry boundary, redaction, and typed validation offline.
import test from 'node:test';
import assert from 'node:assert/strict';
import { callJev } from '../src/client.js';

const request = { model: 'jev-1.13.0', state: { text: 'Hello' }, questions: { clear: { type: 'noul' } } };
const payload = { model: 'jev-1.13.0', answers: { clear: { type: 'noul', noul: 0.8 } }, usage: { input_tokens: 3, output_tokens: 0 } };
const response = (body = payload, status = 200) => new Response(JSON.stringify(body), { status });

test('passes an active abort signal and clears its timer after success', async () => {
  let signal;
  await callJev(request, { apiKey: 'x', timeoutMs: 5, fetchImpl: async (_url, init) => { signal = init.signal; return response(); } });
  assert.equal(signal.aborted, false);
  await new Promise(resolve => setTimeout(resolve, 15));
  assert.equal(signal.aborted, false);
});

test('retries network TypeError and validates the response', async () => {
  let calls = 0;
  const result = await callJev(request, { apiKey: 'x', retries: 2, fetchImpl: async () => { calls++; if (calls < 3) throw new TypeError('offline'); return response(); } });
  assert.equal(calls, 3);
  assert.equal(result.answers.clear.noul, 0.8);
});

test('redacts the key from HTTP errors', async () => {
  await assert.rejects(
    () => callJev(request, { apiKey: 'do-not-leak', retries: 0, fetchImpl: async () => new Response('failure do-not-leak', { status: 400 }) }),
    error => error instanceof Error && !error.message.includes('do-not-leak') && error.message.includes('[redacted]'),
  );
});
