<script setup lang="ts">
const MEMORY_CACHE_KEY = 'memory'
const MANUAL_MEMORY_CACHE_KEY = 'manual_memory'
const STORAGE_CACHE_KEY = 'storage'
const MANUAL_STORAGE_CACHE_KEY = 'manual_storage'
</script>

<template>
  <div class="container">
    <MemoryLink
      to="/memoryCache"
      :cache-key="MEMORY_CACHE_KEY"
      url="https://fakestoreapi.com/products"
    >
      Smart Link - Memory
    </MemoryLink>
    <MemoryLink
      to="/manualMemoryCache"
      :cache-key="MANUAL_MEMORY_CACHE_KEY"
      url="https://fakestoreapi.com/products"
    >
      Smart Link - Manual Memory
    </MemoryLink>
    <StorageLink
      to="/storageCache"
      :cache-key="STORAGE_CACHE_KEY"
      :cache-duration="5000"
      url="https://fakestoreapi.com/products"
    >
      Smart Link - Storage
    </StorageLink>
    <StorageLink
      to="/manualStorageCache"
      :cache-key="MANUAL_STORAGE_CACHE_KEY"
      :cache-duration="10000"
      url="https://fakestoreapi.com/products"
    >
      Smart Link - Manual Storage
    </StorageLink>
  </div>
</template>

<style lang="css" scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 1em;
}
</style>
