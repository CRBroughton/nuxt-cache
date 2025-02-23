<script setup lang="ts">
import { ref } from 'vue'
import { useNuxtApp, type NuxtLinkProps } from '#app'
import { createStorageCache, createStorageHandler } from '#imports'

interface SmartStorageLinkProps extends NuxtLinkProps {
  /**
   * Unique key used to store and retrieve the cached API response
   * Should match the key used in useFetch on the target page
   */
  cacheKey: string

  /**
   * API endpoint URL to prefetch data from
   * Should match the URL used in useFetch on the target page
   */
  url: string

  /**
   * Duration in milliseconds before the cached data expires
   * @default 10000
   */
  cacheDuration?: number
}

const props = withDefaults(defineProps<SmartStorageLinkProps>(), {
  prefetch: true,
  prefetchOn: 'interaction',
  cacheDuration: 10_000,
  storageKey: undefined,
})
/**
 * Fetches and caches API data, or returns existing cached data if valid
 * Stores data in both localStorage and Nuxt's payload
 * @returns The API response data, either from cache or fresh fetch
 */
async function useCacheLink() {
  const nuxtApp = useNuxtApp()

  // Check for existing cached data using createStorageCache
  const cachedData = createStorageCache({
    key: props.cacheKey,
    nuxtApp,
    storageKey: props.cacheKey,
    duration: props.cacheDuration,
  })

  if (cachedData) {
    return cachedData
  }

  // If no valid cache exists, fetch and store
  const response = await $fetch(props.url)

  // Store in both localStorage and Nuxt's payload
  createStorageHandler({
    storageKey: props.cacheKey,
    data: response,
  })

  return response
}

/**
 * Checks if there is valid cached data available in storage
 * @returns boolean indicating if valid cache exists
 */
function hasValidCache(): boolean {
  const nuxtApp = useNuxtApp()
  const cachedData = createStorageCache({
    key: props.cacheKey,
    nuxtApp,
    storageKey: props.cacheKey,
    duration: props.cacheDuration,
  })
  return !!cachedData
}

const isPrefetching = ref(false)

/**
 * Handles mouse hover events to trigger data prefetching
 * Will prefetch if there's no valid cache and not currently prefetching
 * Data is stored in both localStorage and Nuxt's payload
 */
function onHover() {
  if (props.prefetch === false || isPrefetching.value || hasValidCache()) {
    return
  }

  isPrefetching.value = true
  useCacheLink().finally(() => {
    isPrefetching.value = false
  })
}
</script>

<template>
  <NuxtLink
    v-bind="props"
    @mouseenter="onHover"
  >
    <slot />
  </NuxtLink>
</template>
