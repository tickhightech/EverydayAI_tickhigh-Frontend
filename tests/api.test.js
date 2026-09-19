import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { ApiService } from '../src/services/api.js';

const originalFetch = globalThis.fetch;
beforeEach(() => {
  const storage = new Map();
  globalThis.localStorage = {
    getItem: key => storage.get(key),
    setItem: (key, value) => storage.set(key, value),
    removeItem: key => storage.delete(key),
  };
  ApiService._pendingGets.clear();
});
afterEach(() => { globalThis.fetch = originalFetch; delete globalThis.localStorage; });
const response = data => ({ ok: true, status: 200, json: async () => data });

test('concurrent GETs share network work, return independent data, and refetch after completion', async () => {
  let calls = 0;
  let release;
  globalThis.fetch = async () => { calls++; return new Promise(resolve => { release = resolve; }); };
  const a = ApiService.get('/plans');
  const b = ApiService.get('/plans');
  assert.equal(calls, 1);
  release(response({ data: [{ name: 'Daily' }] }));
  const [first, second] = await Promise.all([a, b]);
  first.data[0].name = 'Edited';
  assert.equal(second.data[0].name, 'Daily');
  const fresh = ApiService.get('/plans');
  assert.equal(calls, 2);
  release(response({ data: [] }));
  await fresh;
});

test('requests are isolated by auth token and mutations invalidate pending reads', async () => {
  const releases = [];
  globalThis.fetch = async () => new Promise(resolve => releases.push(resolve));
  ApiService.setToken('account-a');
  const a = ApiService.get('/plans');
  ApiService.setToken('account-b');
  const b = ApiService.get('/plans');
  const save = ApiService.put('/plans/1', {});
  const fresh = ApiService.get('/plans');
  assert.equal(releases.length, 4);
  releases.forEach(resolve => resolve(response({ data: [] })));
  await Promise.all([a, b, save, fresh]);
});

test('failed GET is removed so retry can recover', async () => {
  globalThis.fetch = async () => ({ ok: false, status: 503, json: async () => ({}) });
  await assert.rejects(ApiService.get('/plans'));
  globalThis.fetch = async () => response({ success: true });
  assert.equal((await ApiService.get('/plans')).success, true);
});

test('read after save does not reuse a read that began during the mutation', async () => {
  const releases = [];
  globalThis.fetch = async () => new Promise(resolve => releases.push(resolve));
  const save = ApiService.put('/plans/1', {});
  const during = ApiService.get('/plans');
  releases[0](response({ success: true }));
  await save;
  const after = ApiService.get('/plans');
  assert.equal(releases.length, 3);
  releases[1](response({ data: 'old' }));
  releases[2](response({ data: 'new' }));
  assert.equal((await during).data, 'old');
  assert.equal((await after).data, 'new');
});

test('late 401 reuses refreshed access token without rotating refresh token twice', async () => {
  ApiService.setToken('expired');
  ApiService.setRefreshToken('refresh');
  const requests = [];
  globalThis.fetch = async (url, options) => new Promise(resolve => requests.push({url, options, resolve}));
  const result = ApiService.get('/plans');
  ApiService.setToken('renewed');
  requests[0].resolve({ status: 401 });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requests.length, 2);
  assert.equal(requests[1].url, '/plans');
  assert.equal(requests[1].options.headers.Authorization, 'Bearer renewed');
  requests[1].resolve(response({ success: true }));
  assert.equal((await result).success, true);
});
