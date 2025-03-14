const userService = require('../services/user.service');

// Get player progression (level, XP, etc.)
exports.getProgression = async (req, res) => {
  try {
    const playerIdentifier = req.headers['x-player-id'] || 'anonymous';
    
    const progression = await userService.getPlayerProgression(playerIdentifier);
    
    res.status(200).json({ progression });
  } catch (error) {
    console.error('Get progression error:', error);
    res.status(500).json({ message: 'Server error while fetching progression' });
  }
};

// Get player inventory
exports.getInventory = async (req, res) => {
  try {
    const playerIdentifier = req.headers['x-player-id'] || 'anonymous';
    
    // For now, using mock data
    // Later this will come from database or blockchain
    const inventory = [
      { 
        itemId: 'hint', 
        name: 'Hint Token',
        quantity: 3,
        icon: '💡',
        description: 'Reveals one correct word'
      },
      {
        itemId: 'theme_dark',
        name: 'Dark Theme',
        quantity: 1,
        icon: '🌙',
        description: 'Switch to a sleek dark mode'
      }
    ];
    
    res.status(200).json({ inventory });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ message: 'Server error while fetching inventory' });
  }
};

// Use an item from inventory
exports.useItem = async (req, res) => {
  try {
    const { itemId, gameId } = req.body;
    const playerIdentifier = req.headers['x-player-id'] || 'anonymous';
    
    if (!itemId) {
      return res.status(400).json({ message: 'Item ID is required' });
    }
    
    // For now, just mock the usage
    // Later this would update inventory in database or blockchain
    
    res.status(200).json({
      message: `Item ${itemId} used successfully`,
      success: true,
      effectApplied: true
    });
  } catch (error) {
    console.error('Use item error:', error);
    res.status(500).json({ message: 'Server error while using item' });
  }
};