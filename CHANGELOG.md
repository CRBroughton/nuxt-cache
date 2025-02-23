# @crbroughton/nuxt-cache

## 1.2.0

### Minor Changes

- 3591f83: create MemoryLink and StorageLink - smart links that prefetch and execute useFetches before navigation

## 1.1.1

### Patch Changes

- move MemoryCache type to module.ts for exporting

## 1.1.0

### Minor Changes

- Fix fetchedAt date being part of the data object, clean up documentation, provide helper type for using in-memory caching

## 1.0.0

### Major Changes

- 5e8930c: change internal key name in useStorageCache

### Minor Changes

- 26a2387: create createStorageHandler and createStorageCache for finer control over caching strategies
- 166d4d6: create createMemoryHandler and createMemoryCache for finer control over caching strategies

## 0.1.1

### Patch Changes

- clean up documentation

## 0.1.0

### Minor Changes

- b4aecd2: create useMemoryCache and useStorageCache
