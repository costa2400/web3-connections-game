const Reward = require('../models/reward.model');

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