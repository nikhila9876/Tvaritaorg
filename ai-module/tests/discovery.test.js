/**
 * discovery.test.js — Unit tests for discovery tools.
 *
 * ⚠️ MOCKED: These tests mock apiGet from api-client to verify tool logic
 * and error handling without calling a real backend.
 */

import { jest } from '@jest/globals';
// Mock api-client
jest.unstable_mockModule('../src/api-client.js', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
}));

const { apiGet } = await import('../src/api-client.js');
const { discoveryTools, handleDiscoveryToolCall } = await import('../src/tools/discovery.js');

describe('discoveryTools', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('registers 5 discovery tools', () => {
    expect(discoveryTools.length).toBe(5);
    const names = discoveryTools.map(t => t.name);
    expect(names).toContain('get_states');
    expect(names).toContain('get_events_by_state');
    expect(names).toContain('get_event_detail');
    expect(names).toContain('get_event_artists');
    expect(names).toContain('get_artist_timeslots');
  });

  test('handleDiscoveryToolCall handles get_states', async () => {
    apiGet.mockResolvedValueOnce({ states: ['Karnataka'] });
    const result = await handleDiscoveryToolCall('get_states', {});
    
    expect(apiGet).toHaveBeenCalledWith('/states');
    expect(result.isError).toBeUndefined();
    expect(JSON.parse(result.content[0].text)).toEqual({ states: ['Karnataka'] });
  });

  test('handleDiscoveryToolCall handles get_events_by_state', async () => {
    apiGet.mockResolvedValueOnce({ events: [{ id: 'e1', title: 'Yakshagana' }] });
    const result = await handleDiscoveryToolCall('get_events_by_state', { state_id: 'KA' });
    
    expect(apiGet).toHaveBeenCalledWith('/states/KA/events');
    expect(JSON.parse(result.content[0].text).events[0].title).toBe('Yakshagana');
  });

  test('handleDiscoveryToolCall formats API errors as MCP errors', async () => {
    apiGet.mockRejectedValueOnce({ error: 'Not found', status: 404 });
    const result = await handleDiscoveryToolCall('get_event_detail', { event_id: 'invalid' });
    
    expect(apiGet).toHaveBeenCalledWith('/events/invalid');
    expect(result.isError).toBe(true);
    
    const errContent = JSON.parse(result.content[0].text);
    expect(errContent.error).toBe('Not found');
    expect(errContent.status).toBe(404);
  });

  test('handleDiscoveryToolCall returns null for unknown tools', async () => {
    const result = await handleDiscoveryToolCall('unknown_tool', {});
    expect(result).toBeNull();
  });

  test('get_events_by_state requires state_id', async () => {
    const result = await handleDiscoveryToolCall('get_events_by_state', {});
    expect(result.isError).toBe(true);
    expect(apiGet).not.toHaveBeenCalled();
    expect(JSON.parse(result.content[0].text).code).toBe('VALIDATION_ERROR');
  });
});
