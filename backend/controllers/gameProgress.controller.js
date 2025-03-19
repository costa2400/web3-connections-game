// backend/controllers/gameProgress.controller.js
const GameProgress = require('../models/gameProgress.model');
const Game = require('../models/game.model');

// Get player's active games
exports.getActiveGames = async (req, res) => {
  try {
    const playerIdentifier = req.headers['x-player-id'] || 'anonymous';
    
    // Find all in-progress games for this player
    const activeGames = await GameProgress.find({
      playerIdentifier,
      isCompleted: false
    }).populate('gameId');
    
    res.status(200).json({
      activeGames: activeGames.map(progress => ({
        id: progress.gameId._id,
        solvedGroups: progress.solvedGroups,
        points: progress.points,
        streak: progress.streak,
        timeStarted: progress.timeStarted
      }))
    });
  } catch (error) {
    console.error('Get active games error:', error);
    res.status(500).json({ message: 'Server error while fetching active games' });
  }
};

// Get player stats
exports.getPlayerStats = async (req, res) => {
  try {
    const playerIdentifier = req.headers['x-player-id'] || 'anonymous';
    
    // Get stats for this player
    const totalGames = await GameProgress.countDocuments({ playerIdentifier });
    const completedGames = await GameProgress.countDocuments({ 
      playerIdentifier, 
      isCompleted: true 
    });
    
    // Calculate total points
    const totalPointsResult = await GameProgress.aggregate([
      { $match: { playerIdentifier } },
      { $group: { _id: null, total: { $sum: '$points' } } }
    ]);
    
    const totalPoints = totalPointsResult.length > 0 ? totalPointsResult[0].total : 0;
    
    // Get best game (highest points)
    const bestGame = await GameProgress.findOne({ playerIdentifier })
      .sort({ points: -1 })
      .limit(1);
    
    // Calculate completion rate
    const completionRate = totalGames > 0 ? (completedGames / totalGames) * 100 : 0;
    
    // Get recent games
    const recentGames = await GameProgress.find({ playerIdentifier })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('gameId');
    
    res.status(200).json({
      stats: {
        totalGames,
        completedGames,
        totalPoints,
        bestScore: bestGame ? bestGame.points : 0,
        completionRate: Math.round(completionRate),
        recentGames: recentGames.map(game => ({
          id: game.gameId._id,
          isCompleted: game.isCompleted,
          points: game.points,
          timeStarted: game.timeStarted,
          timeCompleted: game.timeCompleted
        }))
      }
    });
  } catch (error) {
    console.error('Get player stats error:', error);
    res.status(500).json({ message: 'Server error while fetching player stats' });
  }
};

// Reset a game in progress
exports.resetGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const playerIdentifier = req.headers['x-player-id'] || 'anonymous';
    
    // Find the game progress
    const progress = await GameProgress.findOne({ playerIdentifier, gameId });
    
    if (!progress) {
      return res.status(404).json({ message: 'Game progress not found' });
    }
    
    // Reset progress
    progress.solvedGroups = [];
    progress.points = 0;
    progress.streak = 0;
    progress.attempts = 0;
    progress.isCompleted = false;
    progress.timeCompleted = null;
    
    await progress.save();
    
    res.status(200).json({
      message: 'Game progress reset successfully',
      gameId
    });
  } catch (error) {
    console.error('Reset game error:', error);
    res.status(500).json({ message: 'Server error while resetting game' });
  }
};