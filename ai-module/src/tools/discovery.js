/**
 * discovery.js — MCP tool definitions for public discovery endpoints.
 *
 * Tools in this file wrap unauthenticated (public) backend REST endpoints
 * for browsing states, events, artists, and timeslots.
 */

import { apiGet } from '../api-client.js';
import { mcpOk, mcpError, mcpFromCaught } from '../mcp-result.js';

export const discoveryTools = [
  {
    name: 'get_states',
    description: 'List states with active Tvarita events.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_events_by_state',
    description: 'Get a list of events happening in a specific state.',
    inputSchema: {
      type: 'object',
      properties: {
        state_id: {
          type: 'string',
          description:
            'The state id returned by get_states (the `id` field). ' +
            'This is a Mongo ObjectId, not the state name (e.g. pass the id, not "Karnataka").',
        },
      },
      required: ['state_id'],
    },
  },
  {
    name: 'get_event_detail',
    description: 'Get full details for a specific event.',
    inputSchema: {
      type: 'object',
      properties: {
        event_id: { type: 'string', description: 'The ID of the event' },
      },
      required: ['event_id'],
    },
  },
  {
    name: 'get_event_artists',
    description:
      'Get artists already booked or assigned on this event (name, rating, art_form). ' +
      'This is "who is on this event," not a catalog of who is available to book. ' +
      'An empty artists array is expected when the event has no bookings yet. ' +
      'Individual booking does not use event_id — it needs artist_id + slot_id from get_artist_timeslots.',
    inputSchema: {
      type: 'object',
      properties: {
        event_id: { type: 'string', description: 'The ID of the event' },
      },
      required: ['event_id'],
    },
  },
  {
    name: 'get_artist_timeslots',
    description:
      'Get an artist\'s publicly available timeslots. No auth. Returns only slots with ' +
      'available: true (locked/taken slots are omitted — do not filter again). ' +
      'Each timeslot `id` is the slot_id for create_individual_booking. ' +
      'Unknown artist_id returns 404.',
    inputSchema: {
      type: 'object',
      properties: {
        artist_id: { type: 'string', description: 'The ID of the artist' },
      },
      required: ['artist_id'],
    },
  },
];

/**
 * Executes a discovery tool call and returns the formatted result for MCP.
 * @param {string} name 
 * @param {Object} args 
 * @returns {Promise<{ content: { type: string, text: string }[], isError?: boolean } | null>}
 */
export async function handleDiscoveryToolCall(name, args) {
  try {
    let result;
    switch (name) {
      case 'get_states':
        result = await apiGet('/states');
        break;
      case 'get_events_by_state':
        if (!args?.state_id) {
          return mcpError('state_id is required. Call get_states first and use the `id` field.', {
            code: 'VALIDATION_ERROR',
          });
        }
        result = await apiGet(`/states/${args.state_id}/events`);
        break;
      case 'get_event_detail':
        if (!args?.event_id) {
          return mcpError('event_id is required.', { code: 'VALIDATION_ERROR' });
        }
        result = await apiGet(`/events/${args.event_id}`);
        break;
      case 'get_event_artists':
        if (!args?.event_id) {
          return mcpError('event_id is required.', { code: 'VALIDATION_ERROR' });
        }
        result = await apiGet(`/events/${args.event_id}/artists`);
        break;
      case 'get_artist_timeslots':
        if (!args?.artist_id) {
          return mcpError('artist_id is required.', { code: 'VALIDATION_ERROR' });
        }
        result = await apiGet(`/artists/${args.artist_id}/timeslots`);
        break;
      default:
        return null; // Not a discovery tool
    }

    return mcpOk(result);
  } catch (error) {
    return mcpFromCaught(error);
  }
}
