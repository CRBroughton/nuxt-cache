import { useStorage } from '@vueuse/core'
import type { CreateCacheOptions, CacheOptions, TransformInput } from '../types'
import { useRoute, type NuxtApp } from '#app'

// Storage structure that keeps array data and metadata separate
interface StorageData<T> {
  data: T
  fetchedAt: Date
}

/**
 * Creates a storage handler for caching data
 * @param storageKey - Storage key for cached data
 * @param data - Data to store in cache
 * @returns Storage ref and utility functions for managing cached data
 * @example
 * // useFetch transformc
 * transform(input) {
 *   const modifiedProducts = input.map(product => ({
 *     id: product.id,
 *     title: product.title,
 *   }))
 *   // Must be the same key used in createStorageCache
 *   return createStorageHandler(CACHE_KEY, modifiedProducts).value.data
 * }
 */
export function createStorageHandler<T>(storageKey: string, data: T) {
  const storageData: StorageData<T> = {
    data,
    fetchedAt: new Date(),
  }

  return useStorage<StorageData<T>>(
    storageKey,
    storageData,
    undefined,
    { mergeDefaults: true },
  )
}

/**
 * Validates and retrieves data from storage cache
 * @param options - Configuration options for cache validation
 * @param options.key - Key to lookup data in Nuxt payload
 * @param options.nuxtApp - Nuxt app instance
 * @param options.storageKey - Storage key for cached data from createStorageHandler
 * @param options.duration - Duration in milliseconds before cache expires
 * @returns Cached data if valid and not expired, undefined if cache miss or expired
 * @example
 * // useFetch transform
 * getCachedData(key, nuxtApp) {
 *   return createStorageCache({
 *     key,
 *     nuxtApp,
 *     storageKey: CACHE_KEY, // Must be the same key used in createStorageHandler
 *     duration: 10000,
 *   })
 * }
 */
export function createStorageCache<T>({
  key,
  nuxtApp,
  storageKey,
  duration,
}: {
  key: string
  nuxtApp: NuxtApp
  storageKey: string
  duration: number
}) {
  const app = nuxtApp.payload.data[key]
  const storage = useStorage<StorageData<T>>(
    storageKey,
    {
      data: app,
      fetchedAt: new Date(),
    },
  )
  if (!storage.value) {
    return // refetch
  }

  const expirationDate = new Date(storage.value.fetchedAt)
  expirationDate.setTime(expirationDate.getTime() + duration)
  const isExpired = expirationDate.getTime() < Date.now()

  if (isExpired) {
    storage.value = null
    return // refetch
  }

  return storage.value.data
}

/** Configuration options for cache behaviour */
interface CreateStorageCacheOptions extends CreateCacheOptions {
  /** Optional cache key, defaults to the current route */
  key?: string
}
/**
 * Creates cache options with transform and getCachedData functions using VueUse's useStorage
 * @param cacheOptions - Configuration for cache behaviour including duration
 * @returns Cache options compatible with useFetch that will cache responses for the specified duration
 * @example
 * ```ts
 * const { data, status, error } = await useFetch<Product[]>(
 * '/products',
 *  {
 *    // other useFetch options
 *   ...useStorageCache({ duration: 10000 }),
 *  },
 * )
 * ```
 */
export function useStorageCache<T>(cacheOptions: CreateStorageCacheOptions = { duration: 3_600_000 }): CacheOptions<T> {
  const route = useRoute()
  const cacheKey = cacheOptions.key || route.fullPath
  const storageKey = `__memory_cache__${cacheKey}`

  return {
    transform(input: TransformInput<T>) {
      return createStorageHandler(storageKey, input).value.data
    },

    getCachedData(key: string, nuxtApp: NuxtApp) {
      return createStorageCache({
        key,
        nuxtApp,
        storageKey,
        duration: cacheOptions.duration,
      })
    },
  }
}
