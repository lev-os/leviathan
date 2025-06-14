# Storage Architecture - Key Points

**Source**: 12-storage-architecture.md  
**Research Date**: 2025-05-30

---

## Critical Technical Findings

### Model Swap Performance
> "ext4 + NVMe achieves <2 second model swap with 90%+ storage efficiency through compression and deduplication."

**Performance by Media**:
- **NVMe SSD**: 0.4s average, 0.8s worst-case ✅
- **eMMC 5.1**: 1.2s average, 2.1s worst-case ✅
- **SD UHS-II**: 1.8s average, 3.2s worst-case ✅
- Target <2s: Achieved on NVMe, eMMC, UHS-II ✅

### File System Strategy
> "ext4 provides best overall performance and lowest latency for everyday tasks, making it suitable for workloads where raw speed is essential."

**Selection Criteria**:
- **Performance**: ext4 wins for raw speed
- **Advanced features**: Btrfs/ZFS for compression/deduplication
- **Embedded**: ext4 optimal for resource constraints

### Storage Efficiency
> "Combined efficiency: 92-94% ✅ (Target: 90%)"

**Efficiency Components**:
- Compression (LZ4): 2.1x average ratio
- Compression (Zstd): 2.8x average ratio  
- Deduplication: 15-25% space savings
- **Total savings**: 3.5x combined

### Caching Hierarchy
> "Multi-level caching: RAM cache (fastest access), Persistent memory cache, Local storage tiers"

**Cache Levels**:
- L1: Hot contexts (16MB) - <10ms access
- L2: Recent contexts (32MB) - <50ms access
- L3: Vector index (40MB) - <250ms search
- L4: Cold storage - background load

### Adaptive I/O Optimization
> "Storage-specific optimizations: NVMe: 32 queue depth, 64KB I/O; eMMC: 8 queue depth, 32KB I/O; SD: 1 queue depth, 16KB I/O"

**Media-Specific Tuning**: Each storage type optimized for its characteristics and limitations.

---

## Cross-Reference Dependencies
- **Foundation for**: All model swapping and data persistence requirements
- **Enables**: Dynamic model loading with power efficiency
- **Critical for**: Zero-configuration operation through efficient context storage