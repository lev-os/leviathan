import { 
  ChainId, 
  IChainProvider, 
  IUniversalBlockchainAdapter, 
  IUniversalDEXAdapter, 
  IUniversalWallet,
  ChainConfig,
  IMultiChainConfig 
} from '../../../domain/multi-chain-interfaces';
import { SolanaUniversalAdapter } from '../adapters/SolanaUniversalAdapter';
import { JupiterUniversalAdapter } from '../../dex/adapters/JupiterUniversalAdapter';
import { SolanaUniversalWallet } from '../../wallet/adapters/SolanaUniversalWallet';

/**
 * Solana chain provider implementation
 */
export class SolanaChainProvider implements IChainProvider {
  readonly chainId: ChainId = 'solana';

  constructor(private config: IMultiChainConfig) {}

  createBlockchainAdapter(): IUniversalBlockchainAdapter {
    return new SolanaUniversalAdapter(this.getChainConfig());
  }

  createDEXAdapter(): IUniversalDEXAdapter {
    return new JupiterUniversalAdapter(this.getChainConfig());
  }

  async createWallet(privateKey?: string): Promise<IUniversalWallet> {
    return new SolanaUniversalWallet(privateKey);
  }

  getChainConfig(): ChainConfig {
    return this.config.chainConfigs[this.chainId] || {
      chainId: 'solana',
      name: 'Solana',
      nativeCurrency: {
        symbol: 'SOL',
        decimals: 9,
      },
      rpcUrls: ['https://api.mainnet-beta.solana.com'],
      blockExplorerUrls: ['https://explorer.solana.com'],
      supportedDEXs: ['jupiter'],
      isTestnet: false,
    };
  }
}