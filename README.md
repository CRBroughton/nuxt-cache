# Nuxt Cache


A flexible caching solution for Nuxt 3 that provides both in-memory and persistent storage caching strategies.

## Features

- 🧠 `useMemoryCache`: In-memory caching with Nuxt's payload system
- 💾 `useStorageCache`: Persistent caching using localStorage
- ⚡️ Zero-config setup with sensible defaults
- 🎯 Full TypeScript support
- 🔄 Compatible with `useFetch`, `useLazyFetch`, and custom fetch composables
- 💪 Built on top of VueUse's useStorage for persistent caching

## Installation

```bash
npm install @crbroughton/nuxt-cache
```

1. Add `@crbroughton/nuxt-cache` to the `modules` section of your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: [
    '@crbroughton/nuxt-cache'
  ],
})
```

## Usage

Both the memory and persistent variants of nuxt-cache come with two
flavours of caching. The first is designed for simple API interactions,
where you do not require tranforming the data. These are:

- `useMemoryCache`
- `useStorageCache`

When transformation is required, two sets of level level caching functions are exposed:

- `createMemoryHandler` and `createMemoryCache` for memory caching
- `createStorageHandler` and `createStorageCache`
for persistent caching

### Memory Cache

Uses Nuxt's built-in payload system to cache data in memory. Ideal for server-side rendered data that doesn't need to persist.

```ts
// Basic usage
const { data } = await useFetch('/api/products', {
  // other useFetch options
  ...useMemoryCache({ duration: 3600000 }) // Cache for 1 hour
})

// With lazy loading
const { data } = await useLazyFetch('/api/products', {
  // other useFetch options
  ...useMemoryCache({ duration: 3600000 })
})
```

When requiring transformation of a response before exposing
the response through useFetch, you can use the `createMemoryHandler`
and `createMemoryCache` helpers.

```ts
type MinimalProduct = Pick<Product, 'id' | 'title' | 'price'>
const { data, status, error } = await useFetch<MinimalProduct[]>(
  'https://fakestoreapi.com/products',
  {
    transform(input) {
      const modifiedProducts = input.map(product => ({
        id: product.id,
        title: product.title,
        price: product.price,
      }))
      return createMemoryHandler(modifiedProducts)
    },
    getCachedData(key, nuxtApp) {
      return createMemoryCache({
        key,
        nuxtApp,
        duration: 5000,
      })
    },
  },
)
```

### Storage Cache

Uses localStorage to persist cached data between page reloads. Perfect for client-side data that should survive browser refreshes.

```ts
// Basic usage
const { data } = await useFetch('/api/products', {
  ...useStorageCache({ 
    duration: 3600000, // Cache for 1 hour
    key: 'products' // Optional custom key
  })
})

// With lazy loading
const { data } = await useLazyFetch('/api/products', {
  ...useStorageCache({ duration: 3600000 })
})
```

When requiring transformation of a response before exposing
the response through useFetch, you can use the `createStorageHandler`
and `createStorageCache` helpers.

```ts
type MinimalProduct = Pick<Product, 'id' | 'title' | 'price'>
const CACHE_KEY = '__storage_cache__/products'
const { data, status, error } = await useFetch<MinimalProduct[]>(
  'https://fakestoreapi.com/products',
  {
    transform(input) {
      const modifiedProducts = input.map(product => ({
        id: product.id,
        title: product.title,
        price: product.price,
      }))
      return createStorageHandler({
        storageKey: CACHE_KEY,
        data: modifiedProducts,
      })
    },
    getCachedData(key, nuxtApp) {
      return createStorageCache({
        key,
        nuxtApp,
        storageKey: CACHE_KEY,
        duration: 10000,
      })
    },
  },
)
```
## How It Works

### Memory Cache
- Uses Nuxt's payload system to store data in memory
- Data persists only for the current session
- Automatically cleared on page refresh

### Storage Cache
- Uses localStorage through VueUse's useStorage
- Data persists between page reloads
- Automatically handles JSON serialization/deserialization
- Includes timestamp checking for cache invalidation

## Contributing

1. Clone this repository
2. Install dependencies using `bun install`
3. Run development server using `bun dev`
4. Create a PR with your changes

## License

[MIT License](./LICENSE)