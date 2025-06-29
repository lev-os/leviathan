import { 
  ChainId, 
  IChainProvider, 
  IUniversalBlockchainAdapter, 
  IUniversalDEXAdapter, 
  IUniversalWallet,
  ChainConfig,
  IMultiChainConfig 
} from '../../../domain/multi-chain-interfaces';
import { EthereumUniversalAdapter } from '../adapters/EthereumUniversalAdapter';
import { CamelotUniversalAdapter } from '../../dex/adapters/CamelotUniversalAdapter';
import { EthereumUniversalWallet } from '../../wallet/adapters/EthereumUniversalWallet';

/**
 * Arbitrum chain provider implementation
 */
export class ArbitrumChainProvider implements IChainProvider {
  readonly chainId: ChainId = 'arbitrum';

  constructor(private config: IMultiChainConfig) {}

  createBlockchainAdapter(): IUniversalBlockchainAdapter {
    return new EthereumUniversalAdapter(this.getChainConfig());
  }

  createDEXAdapter(): IUniversalDEXAdapter {
    return new CamelotUniversalAdapter(this.getChainConfig());
  }

  async createWallet(privateKey?: string): Promise<IUniversalWallet> {
    return new EthereumUniversalWallet(privateKey, this.getChainConfig());
  }

  getChainConfig(): ChainConfig {
    return this.config.chainConfigs[this.chainId] || {
      chainId: 'arbitrum',
      name: 'Arbitrum One',
      nativeCurrency: {
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: ['https://arb1.arbitrum.io/rpc'],
      blockExplorerUrls: ['https://arbiscan.io'],
      supportedDEXs: ['camelot', 'uniswap'],
      isTestnet: false,
    };
  }
}