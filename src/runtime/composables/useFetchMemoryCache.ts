import type { InjectionKey } from 'vue'
import { provide, inject, computed } from 'vue'
import { useState } from '#app'

/**
 * Configuration options for memory caching behavior in cachedFetch
 */
interface FetchMemoryCacheOptions {
  /**
   * Unique cache key for storing/retrieving data. Used to identify cached entries.
   * @required
   */
  key: string

  /**
   * Cache duration in milliseconds before data expires and requires refetch
   * @default 3600000 (1 hour)
   */
  duration?: number

  /**
   * Force refresh by skipping cache lookup and always fetching fresh data
   * @default false
   */
  force?: boolean
}

interface CachedData<T> {
  data: T
  fetchedAt: Date
}

/**
 * Creates a memory cache handler for the $fetch method and other custom implementations
 * @param fetcher - The fetch function to use
 * @returns Object with cachedFetch function
 * @example
 * ```ts
 * const { cachedFetch } = useFetchMemoryCache($fetch)
 * const data = await cachedFetch('/api/products', {
 *   key: 'products',
 *   duration: 300000
 * })
 * ```
 */
export function fetchMemoryCache(fetcher: typeof $fetch = $fetch) {
  const cache = useState('fetch-memory-cache', () => new Map<string, CachedData<unknown>>())

  /**
   * Stores data in memory cache with timestamp
   */
  function createMemoryHandler<T>(data: T, key: string): CachedData<T> {
    const cachedData = {
      data,
      fetchedAt: new Date(),
    }

    cache.value.set(key, cachedData)
    return cachedData
  }

  /**
   * Retrieves and validates the cached data
   */
  function getMemoryCache<T>(key: string, duration: number): T | undefined {
    const data = cache.value.get(key) as CachedData<T> | undefined

    if (!data) return undefined

    const expirationDate = new Date(data.fetchedAt)
    expirationDate.setTime(expirationDate.getTime() + duration)
    const isExpired = expirationDate.getTime() < Date.now()

    if (isExpired) {
      cache.value.delete(key)
      return undefined
    }

    return data.data
  }

  /**
   * Cache fetch function that uses memory caching to avoid redundant network requests.
   * When cached data is available and not expired, it returns the cached data immediately
   * without making any network request. Only fetches from the network when cache is
   * missing, expired, or force refresh is requested.
   * @param url - The URL to fetch data from
   * @param options - Same as $fetch options plus duration, key, and force for caching
   * @param options.duration - Cache duration in milliseconds (default: 1 hour)
   * @param options.key - Cache key for storing/retrieving data (default: url)
   * @param options.force - Force refresh ignoring cache (default: false)
   * @returns Promise that resolves to the fetched and cached data
   * @example
   * ```ts
   * const products = await cachedFetch('/api/products', {
   *   key: 'products-list',
   *   duration: 300000, // 5 minutes
   *   method: 'POST',
   *   headers: { 'Authorization': 'Bearer token' }
   * })
   * ```
   */
  async function cachedFetch<T>(
    url: string,
    options: FetchMemoryCacheOptions & Parameters<typeof fetcher>[1],
  ): Promise<T> {
    const ONE_HOUR = 3_600_000
    const {
      duration = ONE_HOUR,
      key,
      force = false,
      ...fetchOptions
    } = options

    // Check cache first (unless forced refresh)
    if (!force) {
      const cached = getMemoryCache<T>(key, duration)
      if (cached !== undefined) {
        return cached
      }
    }

    // Fetch fresh data
    const data = await fetcher(url, fetchOptions) as T

    // Store in cache - use the provided key, not url
    createMemoryHandler(data, key)

    return data
  }

  /**
   * Clears a specific cached entry from memory by its key.
   * @param key - The cache key to clear
   * @returns True if the cache entry was found and cleared, false if key was not found
   * @example
   * ```ts
   * // Clear specific cache entry
   * const cleared = clearCache('products-list')
   * if (cleared) {
   *   console.log('Cache cleared successfully')
   * }
   * ```
   */
  function clearCacheKey(key: string): boolean {
    return cache.value.delete(key)
  }

  /**
   * Clears all cached data from memory. This is a destructive operation
   * that will remove all cached entries.
   * @returns Always returns true
   * @example
   * ```ts
   * // Clear all cache (e.g., on user logout)
   * clearAllCache()
   * ```
   */
  function clearCache(): boolean {
    cache.value.clear()
    return true
  }

  /**
   * Gets all cache keys currently stored in memory.
   * Useful for debugging and cache inspection purposes.
   * @returns A computed Array of all cache keys
   * @example
   * ```ts
   * // Get all cached keys
   * const keys = getCacheKeys()
   * console.log('Cached entries:', keys)
   * // Output: ['products-list', '/api/users', 'user-profile']
   *
   * // Check if specific key exists
   * if (keys.includes('products-list')) {
   *   console.log('Products are cached')
   * }
   * ```
   */
  function getCacheKeys() {
    return computed(() => Array.from(cache.value.keys()))
  }

  return {
    cachedFetch,
    clearCache,
    clearCacheKey,
    getCacheKeys,
  }
}

const storeKey: InjectionKey<ReturnType<typeof fetchMemoryCache>> = Symbol('fetch-memory-cache-store')

/**
 * Provides a fetch memory cache instance to child components using Vue's dependency injection.
 * This function creates a fetchMemoryCache instance and makes it available to all descendant
 * components through Vue's provide/inject system.
 *
 * @param fetcher - The fetch function to use for network requests (defaults to $fetch)
 * @returns The fetch memory cache instance that was provided
 *
 * @example
 * ```vue
 * <script setup>
 * // In a parent component or plugin
 * import { provideFetchMemoryCache } from './fetchMemoryCache'
 *
 * // Provide the cache to all child components
 * const cache = provideFetchMemoryCache($fetch)
 *
 * // Can also use the cache directly in this component
 * const data = await cache.cachedFetch('/api/data')
 * </script>
 * ```
 */
export const provideFetchMemoryCache = (fetcher: typeof $fetch) => {
  const state = fetchMemoryCache(fetcher)
  provide(storeKey, state)
  return state
}

/**
 * Injects and returns the fetch memory cache instance from a parent component.
 * This composable retrieves the cache instance that was provided by a parent component
 * using provideFetchMemoryCache. Must be called within a component that has access
 * to the provided cache (i.e., is a descendant of a component that called provideFetchMemoryCache).
 *
 * @returns The fetch memory cache instance with cachedFetch method
 * @throws Will throw an error if no cache was provided by a parent component
 *
 * @example
 * ```vue
 * <script setup>
 * // In a child component
 * import { useFetchMemoryCache } from './fetchMemoryCache'
 *
 * const { cachedFetch, clearCache, clearAllCache, getCacheKeys } = useFetchMemoryCache()
 *
 * // Use cached fetch with automatic memory caching
 * const products = await cachedFetch('/api/products', {
 *   key: 'products-list',
 *   duration: 300000 // 5 minutes
 * })
 *
 * // Force refresh ignoring cache
 * const freshData = await cachedFetch('/api/products', {
 *   key: 'products-list',
 *   force: true
 * })
 *
 * // Get all cache keys for debugging
 * const allKeys = getCacheKeys()
 * console.log('Current cache keys:', allKeys)
 *
 * // Clear specific cache entry
 * clearCache('products-list')
 *
 * // Clear all cache (deliberate action)
 * clearAllCache()
 * </script>
 * ```
 *
 * @example
 * ```ts
 * // In a composable
 * export function useProducts() {
 *   const { cachedFetch, clearCache, clearAllCache, getCacheKeys } = useFetchMemoryCache()
 *
 *   const getProducts = () => cachedFetch('/api/products', {
 *     key: 'products',
 *     duration: 600000 // 10 minutes
 *   })
 *
 *   const refreshProducts = () => {
 *     clearCache('products')
 *     return getProducts()
 *   }
 *
 *   const logout = () => {
 *     // Clear all cached data on logout
 *     clearAllCache()
 *   }
 *
 *   const debugCache = () => {
 *     const keys = getCacheKeys()
 *     console.log('Active cache entries:', keys)
 *   }
 *
 *   return { getProducts, refreshProducts, logout, debugCache }
 * }
 * ```
 */
export const useFetchMemoryCache = () => {
  return inject(storeKey)!
}
