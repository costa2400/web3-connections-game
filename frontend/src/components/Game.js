import React, { useState, useEffect } from 'react';
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
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaHeart } from 'react-icons/fa';

const MotionButton = motion(Button);

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
  const toast = useToast();

  const loadGame = async (mode) => {
    try {
      const endpoint = mode === 'daily' ? '/daily' : '/new';
      const response = await fetch(`http://localhost:3003/api/games${endpoint}`);
      const data = await response.json();
      setGame(data.game);
      
      // Set initial progress for daily challenges
      if (mode === 'daily' && data.progress) {
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
  };

  useEffect(() => {
    loadGame(gameMode);
  }, [gameMode]);

  const handleWordSelect = (word) => {
    if (isCompleted) return;
    
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
      const response = await fetch('http://localhost:3003/api/games/guess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: game.id,
          selectedWords,
        }),
      });

      const data = await response.json();

      if (data.correct) {
        setSolvedGroups([...solvedGroups, data.groupIndex]);
        setScore(data.totalPoints);
        setStreak(data.streak);
        setSelectedWords([]);
        setLives(data.lives);
        setIsEliminated(data.isEliminated);

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
      // For daily mode, just reload the current daily challenge
      loadGame('daily');
    } else {
      // For practice mode, get a new random game
      loadGame('practice');
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!game) return null;

  return (
    <VStack spacing={6} w="full">
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

      <Grid
        templateColumns="repeat(4, 1fr)"
        gap={4}
        w="full"
        maxW="800px"
      >
        {game.flatWords.map((item, index) => {
          const isGroupSolved = solvedGroups.includes(item.groupIndex);
          return (
            <MotionButton
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleWordSelect(item.word)}
              isDisabled={isGroupSolved || isCompleted || isEliminated}
              bg={
                isGroupSolved
                  ? game.groupColors[item.groupIndex]
                  : selectedWords.includes(item.word)
                  ? 'blue.500'
                  : 'gray.700'
              }
              color="white"
              _hover={{
                bg: isGroupSolved
                  ? game.groupColors[item.groupIndex]
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
              overflow="visible"
            >
              {item.word}
              {isGroupSolved && (
                <Badge
                  position="absolute"
                  top="-2"
                  right="-2"
                  colorScheme="green"
                  borderRadius="full"
                  px={2}
                >
                  {game.groupNames[item.groupIndex]}
                </Badge>
              )}
            </MotionButton>
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