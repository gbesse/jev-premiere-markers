import { MODEL, validateResponse } from './core.js';

export async function callJev(request, { apiKey, fetchImpl = fetch, timeoutMs = 30000, retries = 2 } = {}) {
  if (!apiKey?.trim()) throw new TypeError('Enter a TypeSafe API key');
  if (request.model !== MODEL) throw new TypeError('Model must remain pinned');
  for (let attempt = 0; ; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl('https://api.typesafe.ai/v1/systemone', {
        method: 'POST', redirect: 'error',
        headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify(request), signal: controller.signal
      });
      if ([429, 529].includes(response.status) && attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 250 * 2 ** attempt));
        continue;
      }
      if (!response.ok) throw new Error(`Jev HTTP ${response.status}: ${(await response.text()).slice(0, 160).replaceAll(apiKey, '[redacted]')}`);
      return validateResponse(await response.json(), request.questions);
    } catch (error) {
      if (error instanceof TypeError && attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 250 * 2 ** attempt));
        continue;
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
