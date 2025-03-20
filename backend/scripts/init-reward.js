// scripts/init-rewards.js
const rewardController = require('../backend/controllers/reward.controller');

// Mock request and response objects
const req = {};
const res = {
  status: (code) => {
    return {
      json: (data) => {
        console.log(data);
      }
    };
  }
};

// Call the controller function
rewardController.createInitialRewards(req, res);