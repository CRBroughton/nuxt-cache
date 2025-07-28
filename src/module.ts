import { fileURLToPath } from 'node:url'
import { defineNuxtModule, createResolver, installModule, addComponentsDir } from '@nuxt/kit'

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

export default defineNuxtModule({
  meta: {
    name: 'nuxt-cache',
    configKey: 'nuxtCache',
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))

    await installModule('@vueuse/nuxt')

    nuxt.hook('imports:dirs', (dirs) => {
      dirs.push(resolve(runtimeDir, 'composables'))
    })

    addComponentsDir({
      path: resolve('runtime/components'),
    })
  },
})
