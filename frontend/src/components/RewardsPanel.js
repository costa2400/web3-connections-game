import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  HStack,
  Icon,
  Progress,
  Badge,
  Divider,
  useToast
} from '@chakra-ui/react';
import { FaMedal, FaCoins, FaTrophy, FaCalendarCheck } from 'react-icons/fa';
import { api } from '../services/api';

const RewardsPanel = ({ walletAddress, gameProgress }) => {
  const [rewards, setRewards] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (walletAddress) {
      loadRewards();
    }
  }, [walletAddress]);

  const loadRewards = async () => {
    try {
      setIsLoading(true);
      const data = await api.getUserRewards(walletAddress);
      setRewards(data);
    } catch (error) {
      console.error('Failed to load rewards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const claimReward = async (rewardType) => {
    try {
      setIsLoading(true);
      const result = await api.claimReward(walletAddress, rewardType);
      
      toast({
        title: 'Reward Claimed!',
        description: `You've successfully claimed ${result.amount} ATOM!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      loadRewards(); // Refresh rewards after claiming
    } catch (error) {
      toast({
        title: 'Claim Failed',
        description: error.message || 'Failed to claim reward',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // For demo purposes, we'll simulate rewards data
  const simulatedRewards = {
    availableBalance: '0.05',
    dailyCompleted: gameProgress?.isCompleted || false,
    dailyClaimed: false,
    dailyProgress: gameProgress ? (gameProgress.solvedGroups / 4) : 0,
    currentStreak: gameProgress?.streak || 0,
    weeklyClaimed: false
  };

  const rewardsData = rewards || simulatedRewards;

  return (
    <Box 
      p={5} 
      bg="whiteAlpha.100" 
      borderRadius="xl"
      backdropFilter="blur(10px)"
      borderWidth="1px"
      borderColor="teal.800"
      w="full"
      maxW="800px"
    >
      <VStack align="stretch" spacing={4}>
        <Heading size="md" color="teal.300">Cosmos Rewards</Heading>
        
        <HStack justify="space-between">
          <Text>Available Balance:</Text>
          <Text fontWeight="bold" color="teal.300">{rewardsData.availableBalance} ATOM</Text>
        </HStack>
        
        <Divider />
        
        <Box>
          <HStack mb={2}>
            <Icon as={FaCalendarCheck} color="yellow.400" />
            <Text fontWeight="bold">Daily Challenge</Text>
            {rewardsData.dailyCompleted ? (
              <Badge colorScheme="green">Completed</Badge>
            ) : (
              <Badge colorScheme="yellow">In Progress</Badge>
            )}
          </HStack>
          <Progress 
            value={rewardsData.dailyProgress * 100} 
            colorScheme="yellow" 
            size="sm" 
            borderRadius="full" 
            mb={2}
          />
          <Button
            size="sm"
            colorScheme="yellow"
            isDisabled={!rewardsData.dailyCompleted || rewardsData.dailyClaimed}
            onClick={() => claimReward('daily')}
            isLoading={isLoading}
          >
            {rewardsData.dailyClaimed ? 'Claimed' : 'Claim 0.01 ATOM'}
          </Button>
        </Box>
        
        <Box>
          <HStack mb={2}>
            <Icon as={FaTrophy} color="purple.400" />
            <Text fontWeight="bold">Weekly Streak</Text>
            <Badge colorScheme="purple">{rewardsData.currentStreak} days</Badge>
          </HStack>
          <Progress 
            value={(rewardsData.currentStreak / 7) * 100} 
            colorScheme="purple" 
            size="sm" 
            borderRadius="full" 
            mb={2}
          />
          <Button
            size="sm"
            colorScheme="purple"
            isDisabled={rewardsData.currentStreak < 7 || rewardsData.weeklyClaimed}
            onClick={() => claimReward('weekly')}
            isLoading={isLoading}
          >
            {rewardsData.weeklyClaimed ? 'Claimed' : 'Claim 0.1 ATOM'}
          </Button>
        </Box>
        
        <Divider />
        
        <Text fontSize="sm" color="gray.400">
          Complete daily challenges and maintain streaks to earn ATOM rewards.
          All rewards are distributed on the Cosmos Hub network.
        </Text>
      </VStack>
    </Box>
  );
};

export default RewardsPanel; 