// backend/models/game.model.js
const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  groups: [[String]],
  groupNames: [String],
  groupColors: [String],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '7d' // Automatically deleted after 7 days
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

gameSchema.statics.createNewGame = async function() {
  // Define all available groups
  const allGroups = [
    {
      words: ["Block", "Chain", "Proof", "State"],
      name: "Blockchain Terms"
    },
    {
      words: ["Yield", "Stake", "Vault", "Asset"],
      name: "DeFi Terms"
    },
    {
      words: ["Floor", "Whale", "Owner", "Buyer"],
      name: "NFT Terms"
    },
    {
      words: ["Logic", "Event", "Token", "Miner"],
      name: "Smart Contract Terms"
    },
    {
      words: ["Layer", "Shard", "Nodes", "Forge"],
      name: "Blockchain Architecture"
    },
    {
      words: ["Pools", "Farms", "Loans", "Swap"],
      name: "DeFi Products"
    },
    {
      words: ["Degen", "Hodl", "Moon", "Rekt"],
      name: "Crypto Slang"
    },
    {
      words: ["Seed", "Keys", "Claim", "Vote"],
      name: "Wallet Actions"
    }
  ];
  
  // Shuffle and pick 4 random groups
  const shuffled = [...allGroups].sort(() => 0.5 - Math.random());
  const selectedGroups = shuffled.slice(0, 4);
  
  // Extract data
  const groups = selectedGroups.map(group => group.words);
  const groupNames = selectedGroups.map(group => group.name);
  
  // Define group colors
  const groupColors = ["#ffcccc", "#ccffcc", "#ccccff", "#ffffcc"];
  
  // Create new game
  return this.create({
    groups,
    groupNames,
    groupColors
  });
};

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;