import type { CreateCacheOptions, CacheOptions, TransformInput } from '../types'
import type { NuxtApp } from '#app'

/**
 * Creates a storage handler for caching data
 * @param data - Data to store in memory cache
 * @returns Storage ref and utility functions for managing cached data
 * @example
 * // useFetch transform
 * transform(input) {
 *   const modifiedProducts = input.map(product => ({
 *     id: product.id,
 *     title: product.title,
 *   }))
 *   return createMemoryHandler(modifiedProducts)
 * }
 */
export function createMemoryHandler<T>(data: T) {
  return {
    data: data,
    fetchedAt: new Date(),
  }
}

/**
 * Validates and retrieves data from memory cache
 * @param options - Configuration options for cache validation
 * @param options.key - Key to lookup data in Nuxt payload
 * @param options.nuxtApp - Nuxt app instance
 * @param options.duration - Duration in milliseconds before cache expires
 * @returns Cached data if valid and not expired, undefined if cache miss or expired
 * @example
 * // useFetch transform
 * getCachedData(key, nuxtApp) {
 *   return createMemoryCache({
 *     key,
 *     nuxtApp,
 *     duration: 10000,
 *   })
 * }
 */
export function createMemoryCache({
  key,
  nuxtApp,
  duration,
}: {
  key: string
  nuxtApp: NuxtApp
  duration: number
}) {
  const data = nuxtApp.payload.data[key] || nuxtApp.static.data[key]

  if (!data)
  // refetch
    return

  const expirationDate = new Date(data.fetchedAt)
  expirationDate.setTime(expirationDate.getTime() + duration)

  const isExpired = expirationDate.getTime() < Date.now()
  if (isExpired) {
    // refetch
    return
  }

  return data
}

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
    key: cacheOptions.key,
    transform(input: TransformInput<T>) {
      return createMemoryHandler(input) as T
    },
    getCachedData(key: string, nuxtApp: NuxtApp) {
      return createMemoryCache({
        key,
        nuxtApp,
        duration: cacheOptions.duration,
      })
    },
  }
}
