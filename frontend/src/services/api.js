const API_BASE_URL = 'http://localhost:3004/api';

export const api = {
  // Game endpoints
  getNewGame: async (walletAddress = null) => {
    const headers = walletAddress ? { 'x-wallet-address': walletAddress } : {};
    const response = await fetch(`${API_BASE_URL}/games/new`, { headers });
    if (!response.ok) {
      throw new Error('Failed to fetch new game');
    }
    return response.json();
  },

  getDailyChallenge: async (walletAddress = null) => {
    const headers = walletAddress ? { 'x-wallet-address': walletAddress } : {};
    const response = await fetch(`${API_BASE_URL}/games/daily`, { headers });
    if (!response.ok) {
      throw new Error('Failed to fetch daily challenge');
    }
    return response.json();
  },

  submitGuess: async (gameId, selectedWords, walletAddress = null) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(walletAddress && { 'x-wallet-address': walletAddress })
    };
    
    const response = await fetch(`${API_BASE_URL}/games/guess`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ gameId, selectedWords }),
    });
    if (!response.ok) {
      throw new Error('Failed to submit guess');
    }
    return response.json();
  },

  // Wallet authentication
  authenticateWallet: async (address) => {
    const response = await fetch(`${API_BASE_URL}/auth/wallet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
    });
    if (!response.ok) {
      throw new Error('Failed to authenticate wallet');
    }
    return response.json();
  },
  
  // Rewards endpoints
  getUserRewards: async (walletAddress) => {
    const response = await fetch(`${API_BASE_URL}/rewards/user`, {
      headers: { 'x-wallet-address': walletAddress }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user rewards');
    }
    return response.json();
  },
  
  claimReward: async (walletAddress, rewardType) => {
    const response = await fetch(`${API_BASE_URL}/rewards/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-wallet-address': walletAddress
      },
      body: JSON.stringify({ rewardType }),
    });
    if (!response.ok) {
      throw new Error('Failed to claim reward');
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