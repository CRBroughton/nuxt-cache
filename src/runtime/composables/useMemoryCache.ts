import type { CreateCacheOptions, CacheOptions, TransformInput } from '../types'
import type { NuxtApp } from '#app'

/**
 * Creates cache options with transform and getCachedData functions for in memory caching
 * @param cacheOptions - Configuration for cache behaviour including duration
 * @returns Cache options compatible with useFetch that will cache responses for the specified duration
 * @example
 * ```ts
 * const { data, status, error } = await useFetch<Product[]>(
 * '/products',
 *  {
 *    // other useFetch options
 *   ...useMemoryCache({ duration: 10000 }),
 *  },
 * )
 * ```
 */
export function useMemoryCache<T>(cacheOptions: CreateCacheOptions = { duration: 3_600_000 }): CacheOptions<T> {
  return {
    transform(input: TransformInput<T>) {
      return {
        ...input,
        fetchedAt: new Date(),
      }
    },
    getCachedData(key: string, nuxtApp: NuxtApp) {
      const data = nuxtApp.payload.data[key] || nuxtApp.static.data[key]

      if (!data)
      // refetch
        return

      const expirationDate = new Date(data.fetchedAt)
      expirationDate.setTime(expirationDate.getTime() + cacheOptions.duration)

      const isExpired = expirationDate.getTime() < Date.now()
      if (isExpired) {
        // refetch
        return
      }

      return data
    },
  }
}
