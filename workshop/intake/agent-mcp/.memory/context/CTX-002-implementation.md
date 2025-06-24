# Context CTX-002-implementation
Task: TASK-002 - Implement secure wallet manager
Type: subtask
Created: 2025-05-23T15:00:00Z

## Implementation Details

### Current Code (TO REPLACE)
```typescript
// packages/tg/src/modules/bot.ts:45-89
class Bot {
  private privateKey: string; // SECURITY ISSUE
  
  async executeTrade(params: TradeParams) {
    const wallet = new Wallet(this.privateKey); // EXPOSED
    const tx = await wallet.signTransaction(transaction);
    return await provider.sendTransaction(tx);
  }
}
```

### New Implementation
```typescript
// packages/tg/src/modules/secure-wallet.ts
interface IWalletProvider {
  signTransaction(tx: Transaction): Promise<SignedTransaction>;
  getAddress(): Promise<string>;
}

class SecureWalletManager implements IWalletProvider {
  private provider: IWalletProvider;
  
  constructor(config: WalletConfig) {
    this.provider = WalletFactory.create(config);
  }
  
  async signTransaction(tx: Transaction): Promise<SignedTransaction> {
    return await this.provider.signTransaction(tx);
  }
}
```

## Acceptance Criteria
- [ ] Private keys never exposed in memory
- [ ] Support for hardware wallets (Ledger/Trezor)
- [ ] Backward compatible with existing Bot interface
- [ ] Unit tests with 100% coverage
- [ ] Integration tests with mock hardware