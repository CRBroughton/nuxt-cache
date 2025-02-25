import type { InjectionKey } from 'vue'
import { provide, inject, ref } from 'vue'

/**
 * Represents a smart link with URL and caching properties
 * @interface SmartLink
 */
interface SmartLink {
  /** The URL that the smart link points to */
  url: string
  /** Key used for caching the smart link */
  cacheKey: string
  /** Optional duration (in ms) for how long the link should be cached */
  cacheDuration?: number
}

type SmartLinks = Record<PropertyKey, SmartLink>

/**
 * Creates a store for managing smart links
 * @template T Type extending SmartLinks
 * @param {T} smartLinks - Object containing smart links
 * @returns {object} Store with smart link references and helper functions
 */
function smartLinkStore<T extends SmartLinks>(smartLinks: T) {
  const smartLinkReferences = ref<T>(smartLinks)

  /**
   * Gets a specific smart link by key
   * @template K Type of key, constrained to keys of T
   * @param {K} key - The key of the smart link to retrieve
   * @returns {SmartLink} The requested smart link
   */
  const getSmartLink = <K extends keyof T>(key: K) => {
    return smartLinkReferences.value[key]
  }

  /**
   * Returns the provided key (identity function with type safety)
   * @template K Type of key, constrained to keys of T
   * @param {K} key - The key to return
   * @returns {K} The same key, type-safe
   */
  const getCacheKey = <K extends keyof T>(key: K): K => {
    return key
  }

  /**
   * Gets the URL of a specific smart link
   * @template K Type of key, constrained to keys of T
   * @param {K} key - The key of the smart link
   * @returns {string} The URL of the smart link
   */
  const getCacheUrl = <K extends keyof T>(key: K): string => {
    return smartLinkReferences.value[key].url
  }

  return { smartLinkReferences, getSmartLink, getCacheKey, getCacheUrl }
}

/**
 * Type representing the return value of smartLinkStore
 * @template T Type extending SmartLinks
 * @typedef {ReturnType<typeof smartLinkStore<T>>} SmartLinkStore
 */
type SmartLinkStore<T extends SmartLinks> = ReturnType<typeof smartLinkStore<T>>

/**
 * Symbol used as the injection key for the smart link store
 * @const {InjectionKey<SmartLinkStore<SmartLinks>>}
 */
const smartLinkKey: InjectionKey<SmartLinkStore<SmartLinks>> = Symbol('smart-link-store')

/**
 * Provides smart links to descendant components using Vue's provide/inject
 * @template T Type extending SmartLinks
 * @param {T} smartLinks - Object containing smart links
 * @returns {SmartLinkStore<T>} The created smart link store
 * @example
 * const { getCacheKey } = provideSmartLinks({
 *   products: {
 *     url: 'https://api.example.com/products',
 *     cacheKey: 'products-cache'
 *   }
 * })
 */
export function provideSmartLinks<T extends SmartLinks>(smartLinks: T) {
  const state = smartLinkStore(smartLinks)
  provide(smartLinkKey, state)
  return state
}

/**
 * Hook to access the smart links in any descendant component
 * @template T Type extending SmartLinks
 * @returns {SmartLinkStore<T>} The smart link store
 * @example
 * const { getSmartLink, getCacheUrl } = useSmartLinks<typeof smartLinks>();
 *
 * // Now TypeScript knows about the smartlink keys
 * const productsUrl = getCacheUrl('products');
 */
export function useSmartLinks<T extends SmartLinks>() {
  return inject(smartLinkKey) as SmartLinkStore<T>
}
