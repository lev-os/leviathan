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
import { UniswapUniversalAdapter } from '../../dex/adapters/UniswapUniversalAdapter';
import { EthereumUniversalWallet } from '../../wallet/adapters/EthereumUniversalWallet';

/**
 * Ethereum chain provider implementation
 */
export class EthereumChainProvider implements IChainProvider {
  readonly chainId: ChainId = 'ethereum';

  constructor(private config: IMultiChainConfig) {}

  createBlockchainAdapter(): IUniversalBlockchainAdapter {
    return new EthereumUniversalAdapter(this.getChainConfig());
  }

  createDEXAdapter(): IUniversalDEXAdapter {
    return new UniswapUniversalAdapter(this.getChainConfig());
  }

  async createWallet(privateKey?: string): Promise<IUniversalWallet> {
    return new EthereumUniversalWallet(privateKey, this.getChainConfig());
  }

  getChainConfig(): ChainConfig {
    return this.config.chainConfigs[this.chainId] || {
      chainId: 'ethereum',
      name: 'Ethereum',
      nativeCurrency: {
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: ['https://eth.llamarpc.com'],
      blockExplorerUrls: ['https://etherscan.io'],
      supportedDEXs: ['uniswap', 'sushiswap'],
      isTestnet: false,
    };
  }
}