import React from 'react';
import { ChakraProvider, Box, VStack, Heading, Text, Container, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import Game from './components/Game';

const MotionBox = motion(Box);

const App = () => {
  const bgColor = useColorModeValue('gray.900', 'gray.800');
  const textColor = useColorModeValue('white', 'gray.100');

  return (
    <ChakraProvider>
      <Box
        minH="100vh"
        bg={bgColor}
        bgGradient="linear(to-b, gray.900, gray.800)"
        color={textColor}
        position="relative"
        overflow="hidden"
      >
        {/* Animated background stars */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          backgroundImage="radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 1%)"
          backgroundSize="50px 50px"
          animation="twinkle 4s infinite"
        />

        <Container maxW="container.xl" py={10}>
          <VStack spacing={8} align="center">
            <MotionBox
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Heading
                size="2xl"
                bgGradient="linear(to-r, blue.400, purple.500)"
                bgClip="text"
                textAlign="center"
              >
                Web3 Connections Game
              </Heading>
            </MotionBox>

            <Text fontSize="xl" textAlign="center" color="gray.300">
              Connect the dots in the Cosmos ecosystem
            </Text>

            {/* Game component */}
            <Box
              w="full"
              maxW="800px"
              bg="rgba(255,255,255,0.05)"
              borderRadius="xl"
              p={6}
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor="whiteAlpha.200"
            >
              <Game />
            </Box>
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
};

export default App; 