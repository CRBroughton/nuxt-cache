import type { UseFetchOptions } from 'nuxt/app'

// Storage structure that keeps array data and metadata separate
export interface StorageData<T> {
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
