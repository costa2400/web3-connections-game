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
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionButton = motion(Button);

const Game = () => {
  const [game, setGame] = useState(null);
  const [selectedWords, setSelectedWords] = useState([]);
  const [solvedGroups, setSolvedGroups] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameMode, setGameMode] = useState('daily'); // 'daily' or 'practice'
  const [isCompleted, setIsCompleted] = useState(false);
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
      } else {
        setSelectedWords([]);
        setSolvedGroups([]);
        setScore(0);
        setStreak(0);
        setIsCompleted(false);
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
        toast({
          title: 'Try again',
          description: 'These words don\'t form a group',
          status: 'error',
          duration: 2000,
          isClosable: true,
        });
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
      >
        <TabList>
          <Tab>Daily Challenge</Tab>
          <Tab>Practice</Tab>
        </TabList>
      </Tabs>

      {game.isDaily && (
        <Text color="gray.400" fontSize="md">
          {formatDate(game.date)}
        </Text>
      )}

      <HStack spacing={4} justify="space-between" w="full" maxW="800px">
        <Badge colorScheme="blue" fontSize="lg" p={2}>
          Score: {score}
        </Badge>
        <Badge colorScheme="purple" fontSize="lg" p={2}>
          Streak: {streak}
        </Badge>
      </HStack>

      <Grid
        templateColumns="repeat(4, 1fr)"
        gap={4}
        w="full"
        maxW="800px"
      >
        {game.groups.flat().map((word, index) => (
          <MotionButton
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleWordSelect(word)}
            isDisabled={solvedGroups.includes(Math.floor(index / 4)) || isCompleted}
            bg={selectedWords.includes(word) ? 'blue.500' : 'gray.700'}
            color="white"
            _hover={{
              bg: selectedWords.includes(word) ? 'blue.600' : 'gray.600',
            }}
            h="100px"
            fontSize="lg"
            borderRadius="xl"
            border="1px solid"
            borderColor="whiteAlpha.200"
            backdropFilter="blur(10px)"
          >
            {word}
          </MotionButton>
        ))}
      </Grid>

      <HStack spacing={4}>
        <Button
          colorScheme="blue"
          onClick={submitGuess}
          isDisabled={selectedWords.length !== 4 || isCompleted}
          size="lg"
        >
          Submit Guess
        </Button>
        <Button
          colorScheme="purple"
          onClick={startNewGame}
          size="lg"
        >
          {gameMode === 'daily' ? 'Reset Daily' : 'New Game'}
        </Button>
      </HStack>

      {isCompleted && (
        <Badge colorScheme="green" fontSize="xl" p={3}>
          Game Completed! {gameMode === 'practice' ? 'Try another game!' : 'Come back tomorrow for a new challenge!'}
        </Badge>
      )}
    </VStack>
  );
};

export default Game; 