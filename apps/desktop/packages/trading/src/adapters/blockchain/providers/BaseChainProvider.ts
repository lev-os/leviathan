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
import { BaseSwapUniversalAdapter } from '../../dex/adapters/BaseSwapUniversalAdapter';
import { EthereumUniversalWallet } from '../../wallet/adapters/EthereumUniversalWallet';

/**
 * Base chain provider implementation
 */
export class BaseChainProvider implements IChainProvider {
  readonly chainId: ChainId = 'base';

  constructor(private config: IMultiChainConfig) {}

  createBlockchainAdapter(): IUniversalBlockchainAdapter {
    return new EthereumUniversalAdapter(this.getChainConfig());
  }

  createDEXAdapter(): IUniversalDEXAdapter {
    return new BaseSwapUniversalAdapter(this.getChainConfig());
  }

  async createWallet(privateKey?: string): Promise<IUniversalWallet> {
    return new EthereumUniversalWallet(privateKey, this.getChainConfig());
  }

  getChainConfig(): ChainConfig {
    return this.config.chainConfigs[this.chainId] || {
      chainId: 'base',
      name: 'Base',
      nativeCurrency: {
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: ['https://mainnet.base.org'],
      blockExplorerUrls: ['https://basescan.org'],
      supportedDEXs: ['baseswap', 'uniswap'],
      isTestnet: false,
    };
  }
}