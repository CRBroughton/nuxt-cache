import type { UseFetchOptions } from 'nuxt/app'

// Storage structure that keeps array data and metadata separate
export interface StorageData<T> {
  data: T
  fetchedAt: Date
}

/**
 * Defines the structure for cached API responses when using memory caching with useFetch.
 * Used to track both the fetched data and when it was last retrieved.
 * This type should always be used when using memory caching with useMemoryCache
 *
 * @template T The type of data being stored (e.g., Product[], User, etc.)
 * @property {T} data The actual data retrieved from the API
 * @property {Date} fetchedAt Timestamp when the data was fetched, used for cache invalidation
 *
 * @example
 * const { data } = await useFetch<MemoryCache<Product[]>>(
 *   'https://api.example.com/products',
 *   {
 *     ...useMemoryCache({ duration: 4000 })
 *   }
 * )
 */
export interface MemoryCache<T> {
  data: T
  fetchedAt: Date
}

/**
 * Configuration options for cache behaviour
 */
export interface CreateCacheOptions {
  /**
   * Duration in milliseconds before cache expires
   * @default 3600000 (1 hour)
   */
  duration: number
}

/**
 * Extracts the input type from the transform function in UseFetchOptions
 */
export type TransformInput<T> = NonNullable<UseFetchOptions<T>['transform']> extends (input: infer U) => unknown ? U : never
/**
 * Cache-related options extracted from UseFetchOptions
 */
export type CacheOptions<T> = Pick<UseFetchOptions<T>, 'transform' | 'getCachedData'>
