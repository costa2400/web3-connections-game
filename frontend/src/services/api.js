const API_BASE_URL = 'http://localhost:3004/api';

export const api = {
  // Game endpoints
  getNewGame: async () => {
    const response = await fetch(`${API_BASE_URL}/games/new`);
    if (!response.ok) {
      throw new Error('Failed to fetch new game');
    }
    return response.json();
  },

  getDailyChallenge: async () => {
    const response = await fetch(`${API_BASE_URL}/games/daily`);
    if (!response.ok) {
      throw new Error('Failed to fetch daily challenge');
    }
    return response.json();
  },

  submitGuess: async (gameId, selectedWords) => {
    const response = await fetch(`${API_BASE_URL}/games/guess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameId, selectedWords }),
    });
    if (!response.ok) {
      throw new Error('Failed to submit guess');
    }
    return response.json();
  },

  // Health check
  checkHealth: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error('Backend is not healthy');
    }
    return response.json();
  }
}; 