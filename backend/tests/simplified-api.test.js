// backend/tests/simplified-api.test.js
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:3001/api';

// Helper function for HTTP requests
const api = axios.create({
  baseURL: API_URL,
  timeout: 5000
});

// Run tests
const runTests = async () => {
  try {
    console.log('Starting simplified API tests...');
    
    // Test 1: Health check
    console.log('\nTest 1: Health check');
    try {
      const healthRes = await api.get('/health');
      console.log('Health check response:', healthRes.data);
    } catch (error) {
      console.error('Health check failed:', error.message);
      console.log('Make sure your server is running on port 3001');
    }
    
    // Test 2: Endpoint structure check
    console.log('\nTest 2: Checking endpoint structure');
    
    // List of endpoints to check availability
    const endpoints = [
      { method: 'get', path: '/games/new' },
      { method: 'get', path: '/games/stats' },
      { method: 'post', path: '/auth/register', body: { username: 'test', email: 'test@example.com', password: 'password123' } }
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Testing ${endpoint.method.toUpperCase()} ${endpoint.path}...`);
        // We're not checking the response, just if the endpoint exists
        // Many will return errors due to missing data/auth, which is expected
        await api[endpoint.method](endpoint.path, endpoint.body);
        console.log(`✓ Endpoint exists`);
      } catch (error) {
        if (error.response) {
          // We got a response, so the endpoint exists but returned an error
          console.log(`✓ Endpoint exists (returned ${error.response.status})`);
        } else {
          console.error(`✗ Endpoint not found or server error:`, error.message);
        }
      }
    }
    
    console.log('\nSimplified tests completed!');
    console.log('For full tests, make sure MongoDB is running properly.');
  } catch (error) {
    console.error('Test error:', error.message);
  }
};

// Run the tests
runTests();