import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Button,
  Text,
  VStack,
  HStack,
  useToast,
  Badge,
  Tabs,
  TabList,
  Tab,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Icon,
  Tooltip,
  Divider,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaHeart } from 'react-icons/fa';
import { api } from '../services/api';
import KeplrConnect from './KeplrConnect';
import RewardsPanel from './RewardsPanel';

const MotionButton = motion(Button);

// Cosmos-themed difficulty levels
const DIFFICULTY_LEVELS = {
  0: 'EASY',      // Yellow groups
  1: 'MEDIUM',    // Green groups
  2: 'HARD',      // Blue groups
  3: 'VERY_HARD'  // Purple groups
};

// Cosmos-themed color scheme
const DIFFICULTY_COLORS = {
  EASY: '#FFB347',    // Cosmic orange-yellow
  MEDIUM: '#7AA874',  // Sage green
  HARD: '#85C0F9',    // Celestial blue
  VERY_HARD: '#9D8CFF' // Cosmic purple
};

// Add category descriptions
const CATEGORY_DESCRIPTIONS = {
  'Layer 1 Blockchains': 'Primary blockchain networks that process and validate transactions',
  'DeFi Concepts': 'Fundamental concepts in decentralized finance',
  'Wallet Components': 'Essential elements of blockchain wallets and key management',
  'NFT Concepts': 'Core concepts in non-fungible token technology',
  // ... add more categories with descriptions
};

const Game = () => {
  const [game, setGame] = useState(null);
  const [selectedWords, setSelectedWords] = useState([]);
  const [solvedGroups, setSolvedGroups] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameMode, setGameMode] = useState('daily'); // 'daily' or 'practice'
  const [isCompleted, setIsCompleted] = useState(false);
  const [lives, setLives] = useState(4);
  const [isEliminated, setIsEliminated] = useState(false);
  const [showingExplanation, setShowingExplanation] = useState(null);
  const [userWallet, setUserWallet] = useState(null);
  const [showRewards, setShowRewards] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const toast = useToast();

  // Get difficulty level for a group
  const getDifficultyLevel = (groupIndex) => {
    return DIFFICULTY_LEVELS[groupIndex] || 'EASY';
  };

  // Handle wallet connection
  const handleWalletConnect = async (address, signer) => {
    // Prevent multiple simultaneous connection attempts
    if (isConnecting) return;
    
    try {
      setIsConnecting(true);
      setUserWallet({ address, signer });
      
      // Authenticate with backend using the wallet address
      const response = await api.authenticateWallet(address);
      if (response.token) {
        localStorage.setItem('game_auth_token', response.token);
        
        toast({
          title: 'Wallet Connected',
          description: 'Your Cosmos wallet is now linked to your game progress!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Load user-specific game data
        loadGame(gameMode);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      // Only show error toast if it's not a duplicate key error
      if (!error.message?.includes('duplicate key')) {
        toast({
          title: 'Authentication Notice',
          description: 'Continuing as guest with your connected wallet',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
      // Continue as guest if authentication fails
      loadGame(gameMode);
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Update loadGame to use wallet address if available
  const loadGame = useCallback(async (mode) => {
    try {
      const data = mode === 'daily' 
        ? await api.getDailyChallenge(userWallet?.address)
        : await api.getNewGame(userWallet?.address);
      
      setGame(data.game);
      
      if (data.progress) {
        setSolvedGroups(data.progress.solvedGroups || []);
        setScore(data.progress.points || 0);
        setStreak(data.progress.streak || 0);
        setIsCompleted(data.progress.isCompleted || false);
        setLives(data.progress.lives);
        setIsEliminated(data.progress.isEliminated || false);
      } else {
        setSelectedWords([]);
        setSolvedGroups([]);
        setScore(0);
        setStreak(0);
        setIsCompleted(false);
        setLives(4);
        setIsEliminated(false);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to load ${mode} game`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast, userWallet]);

  useEffect(() => {
    loadGame(gameMode);
  }, [gameMode, loadGame]);

  const handleWordSelect = (word) => {
    if (isCompleted || isEliminated) return;
    
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else if (selectedWords.length < 4) {
      setSelectedWords([...selectedWords, word]);
    } else {
      toast({
        title: 'Maximum selection',
        description: 'You can only select 4 words at a time',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  // Update submitGuess to include wallet address if available
  const submitGuess = async () => {
    if (selectedWords.length !== 4) {
      toast({
        title: 'Invalid selection',
        description: 'Please select exactly 4 words',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    try {
      const data = await api.submitGuess(game.id, selectedWords, userWallet?.address);

      if (data.correct) {
        setSolvedGroups([...solvedGroups, data.groupIndex]);
        setScore(data.totalPoints);
        setStreak(data.streak);
        setSelectedWords([]);
        setLives(data.lives);
        setIsEliminated(data.isEliminated);
        handleGroupSolved(data.groupIndex);

        toast({
          title: 'Correct!',
          description: `You found the ${data.groupName} group!`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        if (data.isCompleted) {
          setIsCompleted(true);
          toast({
            title: 'Congratulations!',
            description: `You completed the ${gameMode} game!`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        }
      } else {
        setStreak(0);
        setSelectedWords([]);
        setLives(data.lives);
        setIsEliminated(data.isEliminated);

        if (data.isEliminated) {
          toast({
            title: 'Game Over!',
            description: 'You ran out of lives!',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } else {
          toast({
            title: 'Try again',
            description: `These words don't form a group. ${data.lives} lives remaining.`,
            status: 'error',
            duration: 2000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit guess',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const startNewGame = () => {
    if (gameMode === 'daily') {
      loadGame('daily');
    } else {
      loadGame('practice');
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleGroupSolved = (groupIndex) => {
    const groupName = game.groupNames[groupIndex];
    setShowingExplanation({
      name: groupName,
      description: CATEGORY_DESCRIPTIONS[groupName],
      color: DIFFICULTY_COLORS[getDifficultyLevel(groupIndex)]
    });
    
    // Hide explanation after 5 seconds
    setTimeout(() => setShowingExplanation(null), 5000);
  };

  // Toggle rewards panel
  const toggleRewards = () => {
    setShowRewards(!showRewards);
  };

  if (!game) return null;

  return (
    <VStack spacing={6} w="full">
      <Heading fontSize="2xl" color="teal.300" mb={2}>
        Web3 Connections
      </Heading>
      
      {/* Wallet and rewards section */}
      <HStack spacing={4} w="full" maxW="800px" justify="space-between">
        <KeplrConnect onConnect={handleWalletConnect} />
        
        {userWallet && (
          <Button
            size="sm"
            colorScheme="teal"
            variant="outline"
            onClick={toggleRewards}
          >
            {showRewards ? 'Hide Rewards' : 'Show Rewards'}
          </Button>
        )}
      </HStack>
      
      {/* Show rewards panel if toggled */}
      {showRewards && userWallet && (
        <RewardsPanel 
          walletAddress={userWallet.address} 
          gameProgress={{
            score,
            streak,
            solvedGroups: solvedGroups.length,
            isCompleted
          }}
        />
      )}
      
      {/* Rest of the existing game UI */}
      <Tabs 
        variant="soft-rounded" 
        colorScheme="blue" 
        onChange={(index) => setGameMode(index === 0 ? 'daily' : 'practice')}
        defaultIndex={0}
        w="full"
        maxW="800px"
      >
        <TabList justifyContent="center">
          <Tab fontSize="lg" fontWeight="bold">Daily Challenge</Tab>
          <Tab fontSize="lg" fontWeight="bold">Practice</Tab>
        </TabList>
      </Tabs>

      {game.isDaily && (
        <Text color="gray.400" fontSize="lg" fontWeight="medium">
          {formatDate(game.date)}
        </Text>
      )}

      <StatGroup w="full" maxW="800px" bg="whiteAlpha.100" p={4} borderRadius="xl">
        <Stat>
          <StatLabel fontSize="md">Score</StatLabel>
          <StatNumber fontSize="2xl" color="blue.400">{score}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel fontSize="md">Streak</StatLabel>
          <StatNumber fontSize="2xl" color="purple.400">{streak}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel fontSize="md">Groups Found</StatLabel>
          <StatNumber fontSize="2xl" color="green.400">{solvedGroups.length}/4</StatNumber>
        </Stat>
        <Stat>
          <StatLabel fontSize="md">Lives</StatLabel>
          <HStack spacing={1}>
            {[...Array(4)].map((_, i) => (
              <Icon
                key={i}
                as={FaHeart}
                color={i < lives ? "red.500" : "gray.500"}
                w={6}
                h={6}
              />
            ))}
          </HStack>
        </Stat>
      </StatGroup>

      {/* Category explanation popup */}
      {showingExplanation && (
        <Box
          position="fixed"
          top="20%"
          left="50%"
          transform="translateX(-50%)"
          bg={showingExplanation.color}
          color="white"
          p={4}
          borderRadius="xl"
          boxShadow="lg"
          maxW="600px"
          zIndex={1000}
          textAlign="center"
        >
          <Text fontSize="xl" fontWeight="bold" mb={2}>
            {showingExplanation.name}
          </Text>
          <Text fontSize="md">
            {showingExplanation.description}
          </Text>
        </Box>
      )}

      <Grid
        templateColumns="repeat(4, 1fr)"
        gap={4}
        w="full"
        maxW="800px"
      >
        {game.flatWords.map((item, index) => {
          const isGroupSolved = solvedGroups.includes(item.groupIndex);
          return (
            <Tooltip
              key={index}
              label={isGroupSolved ? game.groupNames[item.groupIndex] : ""}
              isDisabled={!isGroupSolved}
            >
              <MotionButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleWordSelect(item.word)}
                isDisabled={isGroupSolved || isCompleted || isEliminated}
                bg={
                  isGroupSolved
                    ? DIFFICULTY_COLORS[getDifficultyLevel(item.groupIndex)]
                    : selectedWords.includes(item.word)
                    ? 'blue.500'
                    : 'gray.700'
                }
                color="white"
                _hover={{
                  bg: isGroupSolved
                    ? DIFFICULTY_COLORS[getDifficultyLevel(item.groupIndex)]
                    : selectedWords.includes(item.word)
                    ? 'blue.600'
                    : 'gray.600',
                }}
                h="100px"
                fontSize="lg"
                fontWeight="bold"
                borderRadius="xl"
                border="1px solid"
                borderColor="whiteAlpha.200"
                backdropFilter="blur(10px)"
                position="relative"
              >
                {item.word}
              </MotionButton>
            </Tooltip>
          );
        })}
      </Grid>

      <HStack spacing={4}>
        <Button
          colorScheme="blue"
          onClick={submitGuess}
          isDisabled={selectedWords.length !== 4 || isCompleted || isEliminated}
          size="lg"
          w="200px"
          h="60px"
          fontSize="xl"
        >
          Submit Guess
        </Button>
        <Button
          colorScheme="purple"
          onClick={startNewGame}
          size="lg"
          w="200px"
          h="60px"
          fontSize="xl"
        >
          {gameMode === 'daily' ? 'Reset Daily' : 'New Game'}
        </Button>
      </HStack>

      {(isCompleted || isEliminated) && (
        <Box
          bg={isCompleted ? "green.500" : "red.500"}
          color="white"
          p={6}
          borderRadius="xl"
          textAlign="center"
          w="full"
          maxW="800px"
        >
          <Heading size="lg" mb={2}>
            {isCompleted ? '🎉 Game Completed! 🎉' : '❌ Game Over! ❌'}
          </Heading>
          <Text fontSize="xl">
            {isCompleted
              ? (gameMode === 'practice' 
                ? 'Great job! Try another game to improve your skills!'
                : 'Excellent work! Come back tomorrow for a new daily challenge!')
              : 'You ran out of lives! Try again with a new game.'}
          </Text>
          <Text fontSize="lg" mt={2} color="whiteAlpha.800">
            Final Score: {score} | Best Streak: {streak}
          </Text>
        </Box>
      )}
    </VStack>
  );
};

export default Game; 