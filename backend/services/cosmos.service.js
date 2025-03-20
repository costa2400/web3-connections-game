// backend/services/cosmos.service.js
const { 
    DirectSecp256k1HdWallet, 
    EncodeObject, 
    StargateClient, 
    makeCosmoshubPath 
  } = require('@cosmjs/stargate');
  const { 
    SigningCosmWasmClient, 
    CosmWasmClient 
  } = require('@cosmjs/cosmwasm-stargate');
  const { verifyADR36Amino } = require('@cosmjs/proto-signing');
  
  // Verify a signature from a Cosmos wallet
  const verifyCosmosSignature = async (address, signature, message) => {
    try {
      // Convert signature from base64 to bytes if needed
      const signatureBytes = Buffer.from(signature, 'base64');
      
      // Verify the signature using ADR-36 specification
      const isValid = await verifyADR36Amino(
        process.env.CHAIN_ID,
        address,
        message,
        signatureBytes
      );
      
      return isValid;
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  };
  
  // Connect to the Cosmos blockchain
  const connectToChain = async () => {
    try {
      const client = await StargateClient.connect(process.env.COSMOS_RPC_URL);
      console.log('Connected to Cosmos chain:', await client.getChainId());
      return client;
    } catch (error) {
      console.error('Cosmos chain connection error:', error);
      throw error;
    }
  };
  
  // Get account balance
  const getAccountBalance = async (address) => {
    try {
      const client = await connectToChain();
      const account = await client.getAccount(address);
      
      if (!account) {
        return { address, balance: [] };
      }
      
      return {
        address,
        balance: account.balance
      };
    } catch (error) {
      console.error('Get account balance error:', error);
      throw error;
    }
  };
  
  // Mint an NFT reward (would connect to an actual NFT contract)
  const mintReward = async (recipientAddress, rewardType) => {
    try {
      // This is a placeholder - in production, you would:
      // 1. Connect to your deployed NFT contract
      // 2. Execute the mint function with proper parameters
      // 3. Return the transaction hash and NFT ID
      
      // For now, we'll just return a mock response
      return {
        success: true,
        txHash: `mock_tx_${Date.now()}`,
        nftId: `reward_${rewardType}_${Date.now()}`
      };
    } catch (error) {
      console.error('Mint reward error:', error);
      throw error;
    }
  };
  
  module.exports = {
    verifyCosmosSignature,
    connectToChain,
    getAccountBalance,
    mintReward
  };