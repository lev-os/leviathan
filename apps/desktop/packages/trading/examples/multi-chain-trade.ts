import {
  createMultiChainTradingPackage,
  MultiChainConfigManager,
  ITradableAsset,
  ChainId,
} from '../src';
import { ElectronWalletStorageProvider } from '../src/wallet/ElectronWalletStorageProvider';
import { WalletEncryptionProvider } from '../src/wallet/WalletEncryptionProvider';

/**
 * Example demonstrating multi-chain trading capabilities
 */
async function multiChainTradingExample() {
  // Create multi-chain configuration
  const configManager = MultiChainConfigManager.createMainnetConfig({
    ENABLED_CHAINS: 'solana,arbitrum,base',
    DEFAULT_CHAIN: 'solana',
    SOLANA_RPC_URL: process.env.SOLANA_RPC_URL,
    ARBITRUM_RPC_URL: process.env.ARBITRUM_RPC_URL,
    BASE_RPC_URL: process.env.BASE_RPC_URL,
  });

  // Create wallet providers
  const walletStorageProvider = new ElectronWalletStorageProvider();
  const walletEncryptionProvider = new WalletEncryptionProvider('your-encryption-key');

  // Create multi-chain trading package
  const {
    tradingEngine,
    walletManager,
    configManager: config,
  } = createMultiChainTradingPackage(
    configManager,
    walletStorageProvider,
    walletEncryptionProvider,
    {
      preferredChains: ['arbitrum', 'base', 'solana'],
      enableCrossChainArbitrage: true,
      maxGasPrices: {
        ethereum: BigInt(30e9), // 30 gwei
        arbitrum: BigInt(0.1e9), // 0.1 gwei
        base: BigInt(0.1e9),
        polygon: BigInt(50e9),
        avalanche: BigInt(30e9),
        solana: BigInt(5000),
      },
    }
  );

  try {
    // Create or get multi-chain wallet
    const wallet = await walletManager.createMultiChainWallet(
      'My Trading Wallet',
      ['solana', 'arbitrum', 'base']
    );

    console.log('Multi-chain wallet created:');
    console.log('Solana address:', wallet.addresses.solana);
    console.log('Arbitrum address:', wallet.addresses.arbitrum);
    console.log('Base address:', wallet.addresses.base);

    // Define assets for trading
    const solanaUSDC: ITradableAsset = {
      symbol: 'USDC',
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      decimals: 6,
      chainId: 'solana',
      standard: 'SPL',
      coingeckoId: 'usd-coin',
    };

    const arbitrumETH: ITradableAsset = {
      symbol: 'ETH',
      address: '0x0000000000000000000000000000000000000000', // Native ETH
      decimals: 18,
      chainId: 'arbitrum',
      standard: 'ERC20',
      coingeckoId: 'ethereum',
      bridgeAddresses: {
        solana: 'So11111111111111111111111111111111111111112', // Wrapped SOL
        base: '0x0000000000000000000000000000000000000000',
      },
    };

    // Create a cross-chain trade (USDC on Solana -> ETH on Arbitrum)
    const trade = await tradingEngine.createTrade({
      inputAsset: solanaUSDC,
      outputAsset: arbitrumETH,
      inputAmount: BigInt(100 * 1e6), // 100 USDC
      strategies: [], // Add your strategies here
      metadata: {
        walletId: wallet.id,
        maxSlippage: 0.5,
        crossChainAllowed: true,
      },
    });

    console.log('Trade created:', {
      id: trade.id,
      inputAsset: `${trade.inputAsset.symbol} (${trade.inputAsset.chainId})`,
      outputAsset: `${trade.outputAsset.symbol} (${trade.outputAsset.chainId})`,
      amount: trade.inputAmount.toString(),
      status: trade.status,
    });

    // Get chain statistics before execution
    const chainStats = await (tradingEngine as any).getChainStatistics();
    console.log('Chain statistics:', chainStats);

    // Execute the trade
    console.log('Executing trade...');
    const result = await tradingEngine.executeTrade(trade.id);

    if (result.success) {
      console.log('Trade executed successfully!');
      console.log('Transaction ID:', result.transactionId);
      console.log('Output amount:', result.trade.actualOutputAmount?.toString());
    } else {
      console.error('Trade failed:', result.error?.message);
    }

    // Check balances across all chains
    const balances = await walletManager.getAllBalances(wallet.id);
    console.log('Wallet balances across chains:', {
      solana: `${balances.solana} lamports`,
      arbitrum: `${balances.arbitrum} wei`,
      base: `${balances.base} wei`,
    });

  } catch (error) {
    console.error('Error in multi-chain trading example:', error);
  }
}

/**
 * Example demonstrating chain-specific operations
 */
async function chainSpecificExample() {
  const configManager = MultiChainConfigManager.createTestnetConfig();
  
  console.log('Enabled chains:', configManager.getEnabledChains());
  console.log('Default chain:', configManager.getDefaultChain());
  
  // Get chain-specific configurations
  const solanaConfig = configManager.getChainConfig('solana');
  console.log('Solana config:', {
    name: solanaConfig.name,
    rpcUrls: solanaConfig.rpcUrls[0],
    supportedDEXs: solanaConfig.supportedDEXs,
  });

  const arbitrumConfig = configManager.getChainConfig('arbitrum');
  console.log('Arbitrum config:', {
    name: arbitrumConfig.name,
    rpcUrls: arbitrumConfig.rpcUrls[0],
    supportedDEXs: arbitrumConfig.supportedDEXs,
  });
}

/**
 * Example demonstrating asset bridge mapping
 */
function bridgeExample() {
  // USDC with bridge addresses across multiple chains
  const multiChainUSDC: ITradableAsset = {
    symbol: 'USDC',
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // Solana address
    decimals: 6,
    chainId: 'solana',
    standard: 'SPL',
    coingeckoId: 'usd-coin',
    bridgeAddresses: {
      ethereum: '0xA0b86a33E6441bDFfBB6b02B7AeBcD0a7dDe45A2',
      arbitrum: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      polygon: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    },
  };

  console.log('Multi-chain USDC configuration:');
  console.log('Native chain:', multiChainUSDC.chainId);
  console.log('Bridge addresses:', multiChainUSDC.bridgeAddresses);
  
  // Check which chains support this asset
  const supportedChains = Object.keys(multiChainUSDC.bridgeAddresses || {});
  supportedChains.push(multiChainUSDC.chainId);
  console.log('Supported chains:', supportedChains);
}

// Run examples
if (require.main === module) {
  console.log('=== Multi-Chain Trading Example ===');
  multiChainTradingExample().catch(console.error);

  console.log('\n=== Chain-Specific Configuration Example ===');
  chainSpecificExample().catch(console.error);

  console.log('\n=== Bridge Mapping Example ===');
  bridgeExample();
}