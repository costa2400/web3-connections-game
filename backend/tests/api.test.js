// backend/tests/api.test.js
const axios = require('axios');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:3001/api';
let authToken = '';
let userId = '';
let gameId = '';

// Test user
const testUser = {
  username: `test_user_${Date.now()}`,
  email: `test${Date.now()}@example.com`,
  password: 'Test123!',
  walletAddress: `cosmos1test${Date.now()}`
};

// Helper function for HTTP requests
const api = axios.create({
  baseURL: API_URL,
  timeout: 5000
});

// Set auth token for authenticated requests
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete api.defaults.headers.common['x-auth-token'];
  }
};

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Disconnect from database
const disconnectDB = async () => {
  await mongoose.connection.close();
  console.log('MongoDB disconnected');
};

// Clean up test data
const cleanUp = async () => {
  try {
    if (userId) {
      await mongoose.connection.collection('users').deleteOne({ _id: new mongoose.Types.ObjectId(userId) });
      console.log('Test user deleted');
    }
  } catch (error) {
    console.error('Clean up error:', error);
  }
};

// Run tests
const runTests = async () => {
  try {
    console.log('Starting API tests...');
    
    // Test 1: Health check
    console.log('\nTest 1: Health check');
    const healthRes = await api.get('/health');
    console.log('Health check response:', healthRes.data);
    
    // Test 2: Register user
    console.log('\nTest 2: Register user');
    const registerRes = await api.post('/auth/register', testUser);
    console.log('Register response status:', registerRes.status);
    console.log('User created with ID:', registerRes.data.user.id);
    
    // Save user ID and token
    userId = registerRes.data.user.id;
    authToken = registerRes.data.token;
    setAuthToken(authToken);
    
    // Test 3: Get user profile
    console.log('\nTest 3: Get user profile');
    const profileRes = await api.get('/auth/profile');
    console.log('Profile response:', profileRes.data);
    
    // Test 4: Create a new game
    console.log('\nTest 4: Create a new game');
    const newGameRes = await api.get('/games/new');
    console.log('New game created with ID:', newGameRes.data.game.id);
    gameId = newGameRes.data.game.id;
    
    // Test 5: Submit guess (this will likely fail since we don't know the correct words)
    console.log('\nTest 5: Submit guess');
    try {
      // Get all words from the first group to simulate a correct guess
      const words = newGameRes.data.game.groups[0];
      const guessRes = await api.post('/games/guess', {
        gameId,
        selectedWords: words
      });
      console.log('Guess response:', guessRes.data);
    } catch (error) {
      console.log('Expected guess error (since we don\'t know the correct answer):', error.response?.data || error.message);
    }
    
    // Test 6: Get game stats
    console.log('\nTest 6: Get game stats');
    const statsRes = await api.get('/games/stats');
    console.log('Game stats:', statsRes.data);
    
    // Test 7: Get daily challenge
    console.log('\nTest 7: Get daily challenge');
    const dailyRes = await api.get('/games/daily');
    console.log('Daily challenge ID:', dailyRes.data.game.id);
    
    // Test 8: Get user progression
    console.log('\nTest 8: Get user progression');
    const progressionRes = await api.get('/users/progression');
    console.log('User progression:', progressionRes.data);
    
    // Test 9: Initialize rewards
    console.log('\nTest 9: Initialize rewards');
    try {
      const rewardsRes = await api.post('/rewards/init');
      console.log('Rewards initialized:', rewardsRes.data);
    } catch (error) {
      console.log('Rewards initialization error (might already exist):', error.response?.data || error.message);
    }
    
    // Test 10: Get rewards
    console.log('\nTest 10: Get rewards');
    const getRewardsRes = await api.get('/rewards');
    console.log('Available rewards count:', getRewardsRes.data.rewards.length);
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test error:', error.response?.data || error.message);
  } finally {
    await cleanUp();
    await disconnectDB();
  }
};

// Run the tests
connectDB().then(() => {
  runTests();
});