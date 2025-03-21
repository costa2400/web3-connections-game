const Reward = require('../models/reward.model');
const User = require('../models/user.model');
const { mintReward } = require('../services/cosmos.service');
const authMiddleware = require('../middleware/auth.middleware');
const GameProgress = require('../models/gameProgress.model');

// Get all rewards
exports.getAllRewards = async (req, res) => {
  try {
    const rewards = await Reward.find({ isActive: true });
    
    res.status(200).json({ rewards });
  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({ message: 'Server error while fetching rewards' });
  }
};

// Get reward by ID
exports.getRewardById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const reward = await Reward.findOne({ id, isActive: true });
    
    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }
    
    res.status(200).json({ reward });
  } catch (error) {
    console.error('Get reward error:', error);
    res.status(500).json({ message: 'Server error while fetching reward' });
  }
};

// Create initial rewards (for development/setup)
exports.createInitialRewards = async (req, res) => {
  try {
    // Check if rewards already exist
    const existingCount = await Reward.countDocuments();
    
    if (existingCount > 0) {
      return res.status(400).json({ message: 'Rewards already initialized' });
    }
    
    // Define initial rewards
    const initialRewards = [
      {
        id: 'theme_dark',
        name: 'Dark Theme',
        description: 'Switch to a sleek dark mode',
        cost: 200,
        icon: '🌙',
        levelRequired: 1,
        type: 'theme'
      },
      {
        id: 'hint',
        name: 'Hint Token',
        description: 'Reveals one correct word',
        cost: 150,
        icon: '💡',
        levelRequired: 1,
        type: 'consumable'
      },
      {
        id: 'shuffle',
        name: 'Grid Shuffle',
        description: 'Rearrange all remaining words',
        cost: 100,
        icon: '🔄',
        levelRequired: 2,
        type: 'consumable'
      },
      {
        id: 'time_freeze',
        name: 'Time Freeze',
        description: 'Freezes timer for 30 seconds',
        cost: 300,
        icon: '⏱️',
        levelRequired: 3,
        type: 'consumable'
      },
      {
        id: 'double_points',
        name: '2x Points',
        description: 'Double points for next solve',
        cost: 250,
        icon: '✨',
        levelRequired: 2,
        type: 'consumable'
      },
      {
        id: 'nft_beginner',
        name: 'Beginner Trophy',
        description: 'NFT reward for completing 10 games',
        cost: 0, // Achievement reward, not purchasable
        icon: '🏆',
        levelRequired: 1,
        type: 'nft',
        blockchain: {
          isOnChain: true,
          contractAddress: process.env.NFT_CONTRACT_ADDRESS
        }
      },
      {
        id: 'token_reward',
        name: 'COSMOS Token Reward',
        description: 'Earn COSMOS tokens for your achievements',
        cost: 0, // Achievement reward, not purchasable
        icon: '💰',
        levelRequired: 5,
        type: 'token'
      }
    ];
    
    // Create rewards
    await Reward.insertMany(initialRewards);
    
    res.status(201).json({
      message: 'Initial rewards created successfully',
      count: initialRewards.length
    });
  } catch (error) {
    console.error('Create initial rewards error:', error);
    res.status(500).json({ message: 'Server error while creating rewards' });
  }
};

// Purchase a reward with in-game points
exports.purchaseReward = async (req, res) => {
  try {
    const { rewardId } = req.body;
    const userId = req.userId; // From auth middleware
    
    // Find the reward
    const reward = await Reward.findOne({ id: rewardId, isActive: true });
    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has enough points
    if (user.totalPoints < reward.cost) {
      return res.status(400).json({ message: 'Insufficient points' });
    }
    
    // Check if user meets level requirement
    if (user.level < reward.levelRequired) {
      return res.status(400).json({ message: 'Level requirement not met' });
    }
    
    // Deduct points
    user.totalPoints -= reward.cost;
    
    // Add item to inventory
    const existingItem = user.inventory.find(item => item.itemId === reward.id);
    
    if (existingItem) {
      // Increment quantity for existing item
      existingItem.quantity += 1;
    } else {
      // Add new item to inventory
      user.inventory.push({
        itemId: reward.id,
        name: reward.name,
        quantity: 1,
        icon: reward.icon,
        description: reward.description
      });
    }
    
    // If it's an on-chain reward (NFT or token), process it
    if (reward.blockchain && reward.blockchain.isOnChain && user.walletAddress) {
      // Process blockchain reward
      try {
        const blockchainResult = await mintReward(user.walletAddress, reward.id);
        
        // Save blockchain transaction details
        if (blockchainResult && blockchainResult.success) {
          // Add metadata to the inventory item
          const inventoryItem = user.inventory.find(item => item.itemId === reward.id);
          if (inventoryItem) {
            inventoryItem.txHash = blockchainResult.txHash;
            inventoryItem.tokenId = blockchainResult.nftId;
          }
        }
      } catch (blockchainError) {
        console.error('Blockchain reward processing error:', blockchainError);
        // Continue with the purchase even if blockchain process fails
        // We can implement a retry mechanism later
      }
    }
    
    await user.save();
    
    res.status(200).json({
      message: 'Reward purchased successfully',
      reward: {
        id: reward.id,
        name: reward.name,
        type: reward.type
      },
      remainingPoints: user.totalPoints
    });
  } catch (error) {
    console.error('Purchase reward error:', error);
    res.status(500).json({ message: 'Server error while purchasing reward' });
  }
};

// Get user rewards
exports.getUserRewards = async (req, res) => {
  try {
    const walletAddress = req.headers['x-wallet-address'];
    
    if (!walletAddress) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }
    
    // Find user by wallet address
    const user = await User.findOne({ walletAddress });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's current streak and game progress
    const latestProgress = await GameProgress.findOne({ 
      playerIdentifier: walletAddress,
      isDaily: true
    }).sort({ createdAt: -1 });
    
    // Get all daily challenges completed by the user
    const completedChallenges = await GameProgress.find({
      playerIdentifier: walletAddress,
      isDaily: true,
      isCompleted: true
    });
    
    // Check if today's challenge is completed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayChallenge = completedChallenges.find(challenge => {
      const challengeDate = new Date(challenge.createdAt);
      challengeDate.setHours(0, 0, 0, 0);
      return challengeDate.getTime() === today.getTime();
    });
    
    // Calculate current streak
    let currentStreak = 0;
    if (latestProgress) {
      currentStreak = latestProgress.streak || 0;
    }
    
    // Check if rewards are claimed
    const dailyClaimed = user.claimedRewards && user.claimedRewards.includes(`daily-${today.toISOString().split('T')[0]}`);
    const weeklyClaimed = currentStreak >= 7 && user.claimedRewards && user.claimedRewards.includes(`weekly-${today.toISOString().split('T')[0]}`);
    
    res.status(200).json({
      availableBalance: user.rewardBalance || '0',
      dailyCompleted: !!todayChallenge,
      dailyClaimed,
      dailyProgress: latestProgress ? (latestProgress.solvedGroups.length / 4) : 0,
      currentStreak,
      weeklyClaimed
    });
  } catch (error) {
    console.error('Get user rewards error:', error);
    res.status(500).json({ message: 'Server error while getting rewards' });
  }
};

// Claim reward
exports.claimReward = async (req, res) => {
  try {
    const walletAddress = req.headers['x-wallet-address'];
    const { rewardType } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }
    
    if (!rewardType || !['daily', 'weekly'].includes(rewardType)) {
      return res.status(400).json({ message: 'Valid reward type is required' });
    }
    
    // Find user by wallet address
    const user = await User.findOne({ walletAddress });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Calculate reward amount
    const today = new Date().toISOString().split('T')[0];
    let amount = 0;
    let rewardId = '';
    
    if (rewardType === 'daily') {
      rewardId = `daily-${today}`;
      amount = 0.01; // 0.01 ATOM for daily rewards
    } else if (rewardType === 'weekly') {
      rewardId = `weekly-${today}`;
      amount = 0.1; // 0.1 ATOM for weekly streak rewards
    }
    
    // Check if reward is already claimed
    if (user.claimedRewards && user.claimedRewards.includes(rewardId)) {
      return res.status(400).json({ message: 'Reward already claimed' });
    }
    
    // Update user's reward balance and claimed rewards
    const rewardBalance = (parseFloat(user.rewardBalance || 0) + amount).toFixed(2);
    const claimedRewards = user.claimedRewards || [];
    claimedRewards.push(rewardId);
    
    await User.updateOne(
      { _id: user._id },
      { 
        rewardBalance,
        claimedRewards
      }
    );
    
    res.status(200).json({
      message: 'Reward claimed successfully',
      amount,
      rewardBalance
    });
  } catch (error) {
    console.error('Claim reward error:', error);
    res.status(500).json({ message: 'Server error while claiming reward' });
  }
};