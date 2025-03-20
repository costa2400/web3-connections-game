// backend/data/wordDatabase.js

const wordDatabase = {
  categories: {
    // Layer 1 Blockchains
    blockchains: {
      name: 'Layer 1 Blockchains',
      color: '#FF6B6B',
      words: [
        'Ethereum', 'Bitcoin', 'Solana', 'Cardano', 
        'Polkadot', 'Avalanche', 'Cosmos', 'Near',
        'Algorand', 'Tezos', 'Fantom', 'BNB Chain'
      ]
    },

    // DeFi Terms
    defi: {
      name: 'DeFi Concepts',
      color: '#4ECDC4',
      words: [
        'Liquidity', 'Staking', 'Yield', 'APY',
        'Lending', 'Borrowing', 'Swap', 'Pool',
        'Farm', 'Harvest', 'Vault', 'Bridge'
      ]
    },

    // Wallet Terms
    wallets: {
      name: 'Wallet Components',
      color: '#45B7D1',
      words: [
        'Private Key', 'Seed Phrase', 'Address', 'Signature',
        'Hardware', 'Hot Wallet', 'Cold Storage', 'Keystore',
        'Recovery', 'Backup', 'Password', 'PIN'
      ]
    },

    // NFT Terms
    nft: {
      name: 'NFT Concepts',
      color: '#96CEB4',
      words: [
        'Metadata', 'Collection', 'Mint', 'Royalty',
        'Rarity', 'Attribute', 'Token ID', 'Floor Price',
        'Airdrop', 'Whitelist', 'Reveal', 'Trait'
      ]
    },

    // Consensus Mechanisms
    consensus: {
      name: 'Consensus Methods',
      color: '#FFBE0B',
      words: [
        'Proof of Work', 'Proof of Stake', 'Mining', 'Validation',
        'Slashing', 'Forging', 'Delegation', 'Node',
        'Block Time', 'Finality', 'Epoch', 'Reward'
      ]
    },

    // Smart Contract Terms
    smartContracts: {
      name: 'Smart Contracts',
      color: '#FB5607',
      words: [
        'Function', 'Contract', 'Deploy', 'Gas',
        'Oracle', 'ABI', 'Bytecode', 'Compiler',
        'Interface', 'Library', 'Proxy', 'Event'
      ]
    },

    // Crypto Trading
    trading: {
      name: 'Trading Terms',
      color: '#FF006E',
      words: [
        'Spot', 'Futures', 'Long', 'Short',
        'Leverage', 'Margin', 'Order Book', 'Limit',
        'Market', 'Stop Loss', 'Take Profit', 'Volume'
      ]
    },

    // Governance
    governance: {
      name: 'Governance',
      color: '#8338EC',
      words: [
        'DAO', 'Proposal', 'Vote', 'Quorum',
        'Snapshot', 'Treasury', 'Delegate', 'Token',
        'Forum', 'Execution', 'Veto', 'Power'
      ]
    },

    // Layer 2 Solutions
    layer2: {
      name: 'Layer 2 Solutions',
      color: '#3A86FF',
      words: [
        'Rollup', 'Sidechain', 'Channel', 'Plasma',
        'Optimistic', 'ZK-Proof', 'Batch', 'Scale',
        'Bridge', 'State', 'Commit', 'Verify'
      ]
    },

    // Security Terms
    security: {
      name: 'Security Concepts',
      color: '#FF69B4',
      words: [
        'Encryption', 'Hash', 'Audit', 'Bug Bounty',
        'Multisig', 'Timelock', 'Whitelist', 'Access',
        'Permission', 'Role', 'Guard', 'Lock'
      ]
    }
  },

  // Function to get a seeded random number between 0 and 1
  seededRandom: function(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  },

  // Function to shuffle an array using a seed
  shuffleArray: function(array, seed) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(this.seededRandom(seed + i) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  // Function to get daily categories and words
  getDailyGame: function(date = new Date()) {
    // Create a seed based on the date
    const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    
    // Get all category keys and shuffle them
    const categoryKeys = Object.keys(this.categories);
    const shuffledCategories = this.shuffleArray(categoryKeys, seed);
    
    // Take the first 4 categories
    const dailyCategories = shuffledCategories.slice(0, 4);
    
    // For each category, shuffle its words and take the first 4
    const gameData = {
      groups: [],
      groupNames: [],
      groupColors: []
    };

    dailyCategories.forEach(categoryKey => {
      const category = this.categories[categoryKey];
      const shuffledWords = this.shuffleArray(category.words, seed + categoryKey.length);
      
      gameData.groups.push(shuffledWords.slice(0, 4));
      gameData.groupNames.push(category.name);
      gameData.groupColors.push(category.color);
    });

    return gameData;
  }
};

module.exports = wordDatabase; 