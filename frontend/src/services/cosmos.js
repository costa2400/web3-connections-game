export const COSMOS_CHAINS = {
  'cosmoshub-4': {
    chainId: 'cosmoshub-4',
    chainName: 'Cosmos Hub',
    rpc: 'https://rpc.cosmoshub.strange.love',
    rest: 'https://api.cosmoshub.strange.love',
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'cosmos',
      bech32PrefixAccPub: 'cosmospub',
      bech32PrefixValAddr: 'cosmosvaloper',
      bech32PrefixValPub: 'cosmosvaloperpub',
      bech32PrefixConsAddr: 'cosmosvalcons',
      bech32PrefixConsPub: 'cosmosvalconspub',
    },
    currencies: [
      {
        coinDenom: 'ATOM',
        coinMinimalDenom: 'uatom',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'ATOM',
        coinMinimalDenom: 'uatom',
        coinDecimals: 6,
      },
    ],
    stakeCurrency: {
      coinDenom: 'ATOM',
      coinMinimalDenom: 'uatom',
      coinDecimals: 6,
    },
    gasPriceStep: {
      low: 0.01,
      average: 0.025,
      high: 0.04,
    },
  },
  'osmosis-1': {
    chainId: 'osmosis-1',
    chainName: 'Osmosis',
    rpc: 'https://rpc.osmosis.zone',
    rest: 'https://lcd.osmosis.zone',
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: 'osmo',
      bech32PrefixAccPub: 'osmopub',
      bech32PrefixValAddr: 'osmovaloper',
      bech32PrefixValPub: 'osmovaloperpub',
      bech32PrefixConsAddr: 'osmovalcons',
      bech32PrefixConsPub: 'osmovalconspub',
    },
    currencies: [
      {
        coinDenom: 'OSMO',
        coinMinimalDenom: 'uosmo',
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: 'OSMO',
        coinMinimalDenom: 'uosmo',
        coinDecimals: 6,
      },
    ],
    stakeCurrency: {
      coinDenom: 'OSMO',
      coinMinimalDenom: 'uosmo',
      coinDecimals: 6,
    },
    gasPriceStep: {
      low: 0.01,
      average: 0.025,
      high: 0.04,
    },
  }
};

export const suggestChain = async (chainId) => {
  if (!window.keplr || !window.keplr.experimentalSuggestChain) {
    throw new Error('Keplr extension is not installed or does not support suggestChain');
  }

  const chainInfo = COSMOS_CHAINS[chainId];
  if (!chainInfo) {
    throw new Error(`Chain configuration not found for ${chainId}`);
  }

  await window.keplr.experimentalSuggestChain(chainInfo);
  return true;
};

export const connectKeplr = async (chainId = 'cosmoshub-4') => {
  if (!window.keplr) {
    throw new Error('Keplr extension is not installed');
  }

  // Suggest the chain to Keplr if it's not already added
  try {
    await suggestChain(chainId);
  } catch (error) {
    console.warn('Failed to suggest chain, attempting to enable anyway:', error);
  }

  // Enable the chain
  await window.keplr.enable(chainId);
  const offlineSigner = window.keplr.getOfflineSigner(chainId);
  const accounts = await offlineSigner.getAccounts();
  
  return {
    address: accounts[0].address,
    offlineSigner,
    chainId
  };
}; 