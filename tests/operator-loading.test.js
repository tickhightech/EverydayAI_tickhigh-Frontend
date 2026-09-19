import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { getItem: () => '', setItem: () => {} };
const { OperatorDetailView } = await import('../src/views/OperatorDetailView.js');
const { ApiService } = await import('../src/services/api.js');
const { AppState } = await import('../src/services/state.js');

test('operator form renders before slow analytics, metrics update without rerendering forms', async () => {
  const original = ApiService.get;
  let releaseAnalytics;
  let renders = 0;
  const metric = { dataset: { metric: 'subscribers.active' }, textContent: '' };
  const container = { querySelectorAll: () => [metric] };
  const view = new OperatorDetailView(() => {}, 'operator-a');
  AppState.activeOperatorId = 'operator-a';
  view.renderFullPage = () => { renders++; };
  ApiService.get = async endpoint => {
    if (endpoint.endsWith('/analytics')) return new Promise(resolve => { releaseAnalytics = resolve; });
    if (endpoint === '/api/v1/admin/operators/operator-a') return { success: true, data: { id: 'operator-a', languages: [] } };
    return { success: true, data: [] };
  };
  try {
    await view.loadDataAndRender(container);
    assert.equal(renders, 1);
    assert.equal(view.analyticsStatus, 'loading');
    releaseAnalytics({ success: true, data: { subscribers: { active: 42 } } });
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(metric.textContent, '42');
    assert.equal(renders, 1);
  } finally { ApiService.get = original; }
});

test('late analytics from previous refresh cannot overwrite current metrics', async () => {
  const original = ApiService.get;
  const pending = [];
  const view = new OperatorDetailView(() => {}, 'operator-a');
  const metric = { dataset: { metric: 'subscribers.active' }, textContent: '' };
  const container = { querySelectorAll: () => [metric] };
  ApiService.get = () => new Promise(resolve => pending.push(resolve));
  try {
    view.loadVersion = 1;
    const first = view.loadAnalytics(container, 1);
    view.loadVersion = 2;
    const second = view.loadAnalytics(container, 2);
    pending[1]({ success: true, data: { subscribers: { active: 20 } } });
    await second;
    pending[0]({ success: true, data: { subscribers: { active: 10 } } });
    await first;
    assert.equal(metric.textContent, '20');
  } finally { ApiService.get = original; }
});
