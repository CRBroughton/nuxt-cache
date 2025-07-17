import { useState } from '#app'

/**
 * Configuration options for memory caching behavior in cachedFetch
 */
interface FetchMemoryCacheOptions {
  /**
   * Cache duration in milliseconds before data expires and requires refetch
   * @default 3600000 (1 hour)
   */
  duration?: number

  /**
   * Unique cache key for storing/retrieving data. Used to identify cached entries.
   * @default url (the fetch URL)
   */
  key?: string

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
export function useFetchMemoryCache(fetcher: typeof $fetch = $fetch) {
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
    options: FetchMemoryCacheOptions & Parameters<typeof fetcher>[1] = {},
  ): Promise<T> {
    const ONE_HOUR = 3_600_000
    const {
      duration = ONE_HOUR,
      key = url,
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

  return {
    cachedFetch,
  }
}
