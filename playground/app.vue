<script lang="ts" setup>
export type SmartLinks = typeof smartLinks
const smartLinks = {
  memory: {
    url: 'https://fakestoreapi.com/products',
    cacheKey: 'memory',
  },
  manual_memory: {
    url: 'https://fakestoreapi.com/products',
    cacheKey: 'manual_memory',
  },
  storage: {
    cacheDuration: 5000,
    url: 'https://fakestoreapi.com/products',
    cacheKey: 'storage',
  },
  manual_storage: {
    cacheDuration: 10000,
    url: 'https://fakestoreapi.com/products',
    cacheKey: 'manual_storage',
  },
}
provideSmartLinks(smartLinks)
provideFetchMemoryCache($fetch)
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
