<script setup lang="ts">
import { ref } from 'vue'
import { useNuxtApp, type NuxtLinkProps } from '#app'
import { createMemoryCache, createMemoryHandler } from '#imports'

interface SmartLinkProps extends NuxtLinkProps {
  /**
   * Unique key used to store and retrieve the cached API response
   * Should match the key used in useFetch on the target page
   */
  cacheKey: string

  /**
   * API endpoint URL to prefetch data from
   * should match the URL used in useFetch on the target page
   */
  url: string

  /**
   * Duration in milliseconds before the cached data expires
   * @default 10000
   */
  cacheDuration?: number
}

const props = withDefaults(defineProps<SmartLinkProps>(), {
  prefetch: true,
  prefetchOn: 'interaction',
  cacheDuration: 10_000,
})

/**
 * Fetches and caches API data, or returns existing cached data if valid
 * @returns The API response data, either from cache or fresh fetch
 */
async function useCacheLink() {
  const nuxtApp = useNuxtApp()

  // Check for existing cached data using createMemoryCache
  const cachedData = createMemoryCache({
    key: props.cacheKey,
    nuxtApp,
    duration: props.cacheDuration,
  })

  if (cachedData) {
    return cachedData.data
  }

  // If no valid cache exists, fetch and store
  const response = await $fetch(props.url)
  const cached = createMemoryHandler(response)

  // Store in Nuxt's payload
  nuxtApp.payload.data[props.cacheKey] = cached
  return response
}

/**
 * Checks if there is valid cached data available
 * @returns boolean indicating if valid cache exists
 */
function hasValidCache(): boolean {
  const nuxtApp = useNuxtApp()
  const cachedData = createMemoryCache({
    key: props.cacheKey,
    nuxtApp,
    duration: props.cacheDuration,
  })
  return !!cachedData
}

const isPrefetching = ref(false)

/**
 * Handles mouse hover events to trigger data prefetching
 * Will prefetch if there's no valid cache and not currently prefetching
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
