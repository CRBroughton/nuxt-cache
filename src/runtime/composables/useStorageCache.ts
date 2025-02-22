import { useStorage } from '@vueuse/core'
import type { CreateCacheOptions, CacheOptions, TransformInput } from '../types'
import { useRoute, type NuxtApp } from '#app'

/** Configuration options for cache behaviour */
interface CreateStorageCacheOptions extends CreateCacheOptions {
  /** Optional cache key, defaults to the current route */
  key?: string
}

// Storage structure that keeps array data and metadata separate
interface StorageData<T> {
  data: T
  fetchedAt: Date
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
      const storageData: StorageData<T> = {
        data: input,
        fetchedAt: new Date(),
      }

      useStorage<StorageData<T>>(
        storageKey,
        storageData,
        undefined,
        { mergeDefaults: true },
      )

      return input
    },

    getCachedData(key: string, nuxtApp: NuxtApp) {
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
      expirationDate.setTime(expirationDate.getTime() + cacheOptions.duration)
      const isExpired = expirationDate.getTime() < Date.now()

      if (isExpired) {
        storage.value = null
        return // refetch
      }

      return storage.value.data
    },
  }
}
