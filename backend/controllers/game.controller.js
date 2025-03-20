// backend/controllers/game.controller.js
const Game = require('../models/game.model');
const GameProgress = require('../models/gameProgress.model');
const User = require('../models/user.model');
const userService = require('../services/user.service');

// Get a new practice game
exports.getNewGame = async (req, res) => {
  try {
    // Use user ID if authenticated, otherwise use header or 'anonymous'
    const playerIdentifier = req.userId || req.headers['x-player-id'] || 'anonymous';
    
    // Create a new practice game
    const newGame = await Game.createNewGame(false);
    
    // Initialize game progress
    await GameProgress.create({
      playerIdentifier,
      gameId: newGame._id,
      isDaily: false
    });
    
    res.status(201).json({
      message: 'New practice game created successfully',
      game: {
        id: newGame._id,
        groups: newGame.groups, 
        groupNames: newGame.groupNames,
        groupColors: newGame.groupColors,
        isDaily: false
      }
    });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ message: 'Server error while creating new game' });
  }
};

// Get daily challenge
exports.getDailyChallenge = async (req, res) => {
  try {
    const playerIdentifier = req.userId || req.headers['x-player-id'] || 'anonymous';
    
    // Get or create today's daily challenge
    const dailyGame = await Game.getDailyChallenge();
    
    // Check if the player has already started this daily challenge
    let progress = await GameProgress.findOne({
      playerIdentifier,
      gameId: dailyGame._id
    });
    
    // If not, create progress entry
    if (!progress) {
      progress = await GameProgress.create({
        playerIdentifier,
        gameId: dailyGame._id,
        isDaily: true
      });
    }
    
    res.status(200).json({
      message: 'Daily challenge retrieved successfully',
      game: {
        id: dailyGame._id,
        groups: dailyGame.groups,
        groupNames: dailyGame.groupNames,
        groupColors: dailyGame.groupColors,
        isDaily: true,
        date: dailyGame.dailyDate
      },
      progress: {
        solvedGroups: progress.solvedGroups,
        attempts: progress.attempts,
        isCompleted: progress.isCompleted,
        points: progress.points,
        streak: progress.streak
      }
    });
  } catch (error) {
    console.error('Get daily challenge error:', error);
    res.status(500).json({ message: 'Server error while retrieving daily challenge' });
  }
};

// Submit a guess
exports.submitGuess = async (req, res) => {
  try {
    const { gameId, selectedWords } = req.body;
    const playerIdentifier = req.userId || req.headers['x-player-id'] || 'anonymous';
    
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
        gameId,
        isDaily: game.isDaily
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
    
    // Initialize rewards info
    let xpAwarded = 0;
    let levelUp = false;
    
    if (correct) {
      // Calculate points based on streak
      const basePoints = 100;
      const streakMultiplier = 1 + Math.min(progress.streak, 5) * 0.25;
      const earnedPoints = Math.round(basePoints * streakMultiplier);
      
      // Award points and update progress
      progress.points += earnedPoints;
      progress.streak += 1;
      progress.solvedGroups.push(groupIndex);
      
      // Update user XP and points if authenticated
      if (req.userId) {
        try {
          // Award XP for correct guesses
          const xpResult = await userService.awardXP(req.userId, 10);
          xpAwarded = 10;
          levelUp = xpResult.leveledUp;
          
          // Award points to user
          await userService.awardPoints(req.userId, earnedPoints);
        } catch (userError) {
          console.error('User update error:', userError);
          // Continue with the game even if user update fails
        }
      }
      
      // Check if all groups are solved
      if (progress.solvedGroups.length === game.groups.length) {
        progress.isCompleted = true;
        progress.timeCompleted = new Date();
        
        // Award completion bonus
        const completionBonus = 200;
        progress.points += completionBonus;
        
        // Award completion XP and check achievements if authenticated
        if (req.userId) {
          try {
            // Award XP for game completion
            const xpResult = await userService.awardXP(req.userId, 50);
            xpAwarded += 50;
            levelUp = levelUp || xpResult.leveledUp;
            
            // Award bonus points to user
            await userService.awardPoints(req.userId, completionBonus);
            
            // Check for new achievements
            await userService.checkAchievements(req.userId);
          } catch (userError) {
            console.error('User completion update error:', userError);
            // Continue with the game even if user update fails
          }
        }
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
        isCompleted: progress.isCompleted,
        isDaily: game.isDaily,
        xpAwarded,
        levelUp
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

// Get game stats
exports.getGameStats = async (req, res) => {
  try {
    const gameCount = await Game.countDocuments();
    
    // Get more detailed stats if user is authenticated
    if (req.userId) {
      const userCompletedGames = await GameProgress.countDocuments({
        playerIdentifier: req.userId,
        isCompleted: true
      });
      
      const userTotalGames = await GameProgress.countDocuments({
        playerIdentifier: req.userId
      });
      
      // Calculate completion rate
      const completionRate = userTotalGames > 0 
        ? Math.round((userCompletedGames / userTotalGames) * 100) 
        : 0;
      
      res.status(200).json({
        gameCount,
        userStats: {
          totalGames: userTotalGames,
          completedGames: userCompletedGames,
          completionRate
        },
        message: 'Game stats retrieved successfully'
      });
    } else {
      // Basic stats for non-authenticated users
      res.status(200).json({
        gameCount,
        message: 'Game stats retrieved successfully'
      });
    }
  } catch (error) {
    console.error('Get game stats error:', error);
    res.status(500).json({ message: 'Server error while retrieving game stats' });
  }
};