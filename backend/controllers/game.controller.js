const Game = require('../models/game.model');
const GameProgress = require('../models/gameProgress.model');

// Get a new game
exports.getNewGame = async (req, res) => {
  try {
    // For now, we'll use a simple identifier (later this will be the user's wallet)
    const playerIdentifier = req.headers['x-player-id'] || 'anonymous';
    
    // Create a new game
    const newGame = await Game.createNewGame();
    
    // Initialize game progress
    await GameProgress.create({
      playerIdentifier,
      gameId: newGame._id
    });
    
    res.status(201).json({
      message: 'New game created successfully',
      game: {
        id: newGame._id,
        groups: newGame.groups, 
        groupNames: newGame.groupNames,
        groupColors: newGame.groupColors
      }
    });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ message: 'Server error while creating new game' });
  }
};

// Submit a guess
exports.submitGuess = async (req, res) => {
  try {
    const { gameId, selectedWords } = req.body;
    const playerIdentifier = req.headers['x-player-id'] || 'anonymous';
    
    if (!gameId || !selectedWords || !Array.isArray(selectedWords) || selectedWords.length !== 4) {
      return res.status(400).json({ message: 'Valid game ID and exactly 4 selected words are required' });
    }
    
    // Find the game
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    // Find or create game progress
    let progress = await GameProgress.findOne({ playerIdentifier, gameId });
    if (!progress) {
      progress = await GameProgress.create({
        playerIdentifier,
        gameId
      });
    }
    
    // Check if game is already completed
    if (progress.isCompleted) {
      return res.status(400).json({ message: 'Game is already completed' });
    }
    
    // Increment attempts
    progress.attempts += 1;
    
    // Check if the guess matches any unsolved group
    let correct = false;
    let groupIndex = -1;
    
    for (let i = 0; i < game.groups.length; i++) {
      // Skip already solved groups
      if (progress.solvedGroups.includes(i)) {
        continue;
      }
      
      // Check if all words in the selected group match
      const currentGroup = game.groups[i];
      const allWordsInGroup = currentGroup.every(word => selectedWords.includes(word));
      
      if (allWordsInGroup) {
        correct = true;
        groupIndex = i;
        break;
      }
    }
    
    if (correct) {
      // Calculate points based on streak
      const basePoints = 100;
      const streakMultiplier = 1 + Math.min(progress.streak, 5) * 0.25;
      const earnedPoints = Math.round(basePoints * streakMultiplier);
      
      // Award points and update progress
      progress.points += earnedPoints;
      progress.streak += 1;
      progress.solvedGroups.push(groupIndex);
      
      // Check if all groups are solved
      if (progress.solvedGroups.length === game.groups.length) {
        progress.isCompleted = true;
        progress.timeCompleted = new Date();
        
        // Award completion bonus
        const completionBonus = 200;
        progress.points += completionBonus;
      }
      
      await progress.save();
      
      res.status(200).json({
        correct: true,
        groupIndex,
        groupName: game.groupNames[groupIndex],
        groupColor: game.groupColors[groupIndex],
        pointsEarned: earnedPoints,
        totalPoints: progress.points,
        streak: progress.streak,
        solvedGroups: progress.solvedGroups,
        isCompleted: progress.isCompleted
      });
    } else {
      // Incorrect guess
      progress.streak = 0;
      await progress.save();
      
      res.status(200).json({
        correct: false,
        solvedGroups: progress.solvedGroups
      });
    }
  } catch (error) {
    console.error('Submit guess error:', error);
    res.status(500).json({ message: 'Server error while processing guess' });
  }
};

// Get player progress
exports.getPlayerProgress = async (req, res) => {
  try {
    const playerIdentifier = req.headers['x-player-id'] || 'anonymous';
    
    // Get all progress for this player
    const progress = await GameProgress.find({ playerIdentifier })
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Calculate stats
    const completedGames = await GameProgress.countDocuments({ 
      playerIdentifier, 
      isCompleted: true 
    });
    
    const totalPoints = await GameProgress.aggregate([
      { $match: { playerIdentifier } },
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]);
    
    const stats = {
      completedGames,
      totalPoints: totalPoints.length > 0 ? totalPoints[0].total : 0,
      recentGames: progress
    };
    
    res.status(200).json({ stats });
  } catch (error) {
    console.error('Get player progress error:', error);
    res.status(500).json({ message: 'Server error while retrieving progress' });
  }
};