/**
 * discovery.js — MCP tool definitions for public discovery endpoints.
 *
 * Tools in this file wrap unauthenticated (public) backend REST endpoints
 * for browsing states, events, artists, and timeslots.
 */

import { apiGet } from '../api-client.js';

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
        state_id: { type: 'string', description: 'The ID of the state (e.g., Karnataka)' },
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
    description: 'Get artist cards (name, rating, etc.) performing at a specific event.',
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
    description: 'Get a public view of an artist\'s available timeslots.',
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
  let result;
  try {
    switch (name) {
      case 'get_states':
        result = await apiGet('/states');
        break;
      case 'get_events_by_state':
        result = await apiGet(`/states/${args.state_id}/events`);
        break;
      case 'get_event_detail':
        result = await apiGet(`/events/${args.event_id}`);
        break;
      case 'get_event_artists':
        result = await apiGet(`/events/${args.event_id}/artists`);
        break;
      case 'get_artist_timeslots':
        result = await apiGet(`/artists/${args.artist_id}/timeslots`);
        break;
      default:
        return null; // Not a discovery tool
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    // Format error for MCP
    return {
      content: [{ 
        type: 'text', 
        text: JSON.stringify({ 
          error: error.error || error.message || 'Unknown error', 
          status: error.status || 0 
        }, null, 2) 
      }],
      isError: true,
    };
  }
}
