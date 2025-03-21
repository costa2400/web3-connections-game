import React, { useState, useEffect } from 'react';
import { Button, Box, Text, HStack, Icon, useToast } from '@chakra-ui/react';
import { FaWallet } from 'react-icons/fa';

const KeplrConnect = ({ onConnect }) => {
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState('cosmoshub-4');
  const toast = useToast();

  useEffect(() => {
    // Check if Keplr is already connected
    const checkConnection = async () => {
      if (window.keplr && window.keplr.getOfflineSigner && window.keplr.experimentalSuggestChain) {
        try {
          // Enable access to Cosmos Hub
          await window.keplr.enable(chainId);
          const offlineSigner = window.keplr.getOfflineSigner(chainId);
          const accounts = await offlineSigner.getAccounts();
          
          if (accounts.length > 0) {
            setAddress(accounts[0].address);
            onConnect(accounts[0].address, offlineSigner);
          }
        } catch (error) {
          console.error("Error checking Keplr connection:", error);
        }
      }
    };
    
    checkConnection();
  }, [chainId, onConnect]);

  const connectKeplr = async () => {
    // Check if Keplr extension is installed
    if (!window.keplr) {
      toast({
        title: "Keplr wallet not found",
        description: "Please install Keplr extension first.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right"
      });
      window.open("https://www.keplr.app/download", "_blank");
      return;
    }

    try {
      // Enable the Cosmos Hub chain
      await window.keplr.enable(chainId);
      
      // Get the offline signer for the chain
      const offlineSigner = window.keplr.getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();
      
      if (accounts.length > 0) {
        setAddress(accounts[0].address);
        onConnect(accounts[0].address, offlineSigner);
        
        toast({
          title: "Wallet connected",
          description: "Your Keplr wallet has been connected successfully!",
          status: "success",
          duration: 3000,
          isClosable: true
        });
      }
    } catch (error) {
      console.error("Error connecting to Keplr:", error);
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect to Keplr wallet",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };
  
  return (
    <Box mb={4}>
      {address ? (
        <HStack>
          <Icon as={FaWallet} color="teal.400" />
          <Text fontSize="sm" color="teal.400">
            Connected: {address.slice(0, 10)}...{address.slice(-4)}
          </Text>
        </HStack>
      ) : (
        <Button 
          leftIcon={<FaWallet />} 
          colorScheme="teal" 
          onClick={connectKeplr}
          size="md"
          bgGradient="linear(to-r, teal.400, cyan.500)"
        >
          Connect Keplr
        </Button>
      )}
    </Box>
  );
};

export default KeplrConnect; 