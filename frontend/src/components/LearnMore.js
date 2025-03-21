import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  VStack,
  Link,
  Box,
  Badge,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';

const LearnMore = ({ isOpen, onClose, category }) => {
  const getResourceLinks = (categoryName) => {
    // Customize these links based on the category
    const resources = {
      'Layer 1 Blockchains': [
        { text: 'Cosmos Network Documentation', url: 'https://docs.cosmos.network/' },
        { text: 'Cosmos Hub', url: 'https://hub.cosmos.network/' },
        { text: 'IBC Protocol', url: 'https://ibcprotocol.org/' },
      ],
      // Add more categories and their resources
    };
    return resources[categoryName] || [];
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent bg="gray.800" color="white">
        <ModalHeader>
          {category?.name}
          <Badge ml={2} colorScheme={category?.difficulty.toLowerCase()}>
            {category?.difficulty}
          </Badge>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4} pb={6}>
            <Text>{category?.description}</Text>
            
            <Box>
              <Text fontWeight="bold" mb={2}>Examples in the Cosmos Ecosystem:</Text>
              <Text>{category?.examples}</Text>
            </Box>

            <Box>
              <Text fontWeight="bold" mb={2}>Learn More:</Text>
              {getResourceLinks(category?.name).map((resource, index) => (
                <Link 
                  key={index}
                  href={resource.url}
                  isExternal
                  color="blue.300"
                  display="block"
                  mb={2}
                >
                  {resource.text} <ExternalLinkIcon mx="2px" />
                </Link>
              ))}
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LearnMore; 