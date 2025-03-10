# Nuxt Cache


A flexible caching solution for Nuxt 3 that provides both in-memory and persistent storage caching strategies.

## Features

- 🧠 `useMemoryCache`: In-memory caching with Nuxt's payload system
- 💾 `useStorageCache`: Persistent caching using localStorage
- 🔗 MemoryLink: Auto-prefetching NuxtLink component with in-memory caching
- 📍 StorageLink: Auto-prefetching NuxtLink component with persistent storage caching
- 🧩 `useSmartLinks`: Centralised management of URL and cache settings for SmartLinks
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
const { data } = await useFetch<MemoryCache<Product[]>>('/api/products', {
  {
  // other useFetch options
  ...useMemoryCache({ duration: 3600000 }) // Cache for 1 hour
  }
})

// With lazy loading
const { data } = await useLazyFetch<MemoryCache<Product[]>>('/api/products', {
  {
  // other useFetch options
  ...useMemoryCache({ duration: 3600000 })
  }
})
```

When requiring transformation of a response before exposing
the response through useFetch, you can use the `createMemoryHandler`
and `createMemoryCache` helpers.

```ts
const { data, status, error } = await useFetch(
  'https://fakestoreapi.com/products',
  {
    transform(input: Product[]) { // Need to manually declare the type here
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

#### Caveats of Memory Caching

Because in memory caching has no persistent store, we need to return both the data and
the `fetchedAt` date back to the user to verify when a cached payload has gone out-of-date.

Because of this, we highly recommend using the `MemoryCache` type as a wrapper around
your return type when using useFetch. This will ensure when accessing the returned data,
that you are acting on the correct shape. The interface is as follows:

```ts
export interface MemoryCache<T> {
  data: T
  fetchedAt: Date
}
```

The above type is readily available via `@crbroughton/nuxt-cache` and
has been exported for you to use.

### Storage Cache

Uses localStorage to persist cached data between page reloads. Perfect for client-side data that should survive browser refreshes. Because the storage cache is persisent, we only need to
return to you your actual data, and no fetchedAt date.

```ts
// Basic usage
const { data } = await useFetch<Product[]>('/api/products', {
  useStorageCache({ 
    duration: 3600000, // Cache for 1 hour
    key: 'products' // Optional custom key
  })
})

// With lazy loading
const { data } = await useLazyFetch<Product[]>('/api/products', {
  useStorageCache({ duration: 3600000 })
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
### Smart Link Components

You may also wish to fetch data before the user has ever navigated to a page;
The package provides two smart link components that automatically prefetch API data when users hover or interact with links, optimizing the navigation experience:

#### MemoryLink (Memory Cache)

Extends NuxtLink to prefetch and cache API data in memory:

```html
<MemoryLink 
  to="/products"
  url="https://api.example.com/products"
  cacheKey="products-list"
  :cacheDuration="5000"
>
  View Products
</MemoryLink>
```

Then in your target page:
```ts
const { data } = await useFetch<MemoryCache<Product[]>>(
  'https://api.example.com/products',
  {
    ...useMemoryCache({ duration: 5000 }),
    key: 'products-list' // Match the cacheKey from SmartLink
  }
)
```

#### StorageLink (Persistent Cache)

Similar to MemoryLink but with persistent storage using localStorage:

```html
<StorageLink 
  to="/products"
  url="https://api.example.com/products"
  cacheKey="products-list"
  :cacheDuration="5000"
>
  View Products
</StorageLink>
```

Then in your target page:

```ts
const { data } = await useFetch<Product[]>(
  'https://api.example.com/products',
  {
    ...useStorageCache({ 
      duration: 5000,
      key: 'products-list' // Match the cacheKey from SmartStorageLink
    })
  }
)
```

Both components:
- Prefetch data on hover
- Cache the response for the specified duration
- Prevent duplicate API calls when navigating
- Check cache validity before making new requests
- Handle loading states to prevent multiple simultaneous requests


### Smart Links Management

The `defineSmartLinks` helper provides a centralised way to manage URLs and cache settings for your application's smart links. This helper exposes `provideSmartLinks` and `useSmartLinks` for easy access
to your smart links.

#### Setting up SmartLinks

First, provide your smart links in a parent component:

```ts
import { provideSmartLinks } from '@crbroughton/nuxt-cache'

// In your parent component
provideSmartLinks({
  products: {
    url: 'https://api.example.com/products',
    cacheKey: 'products-cache',
    cacheDuration: 5000 // 5 seconds
  },
  settings: {
    url: 'https://api.example.com/settings',
    cacheKey: 'settings-cache',
    cacheDuration: 3600000 // 1 hour
  }
})
```

#### Using SmartLinks in components

Then use these smart links throughout your application:

```ts
import { useSmartLinks } from '@crbroughton/nuxt-cache'

// In any component
const { getSmartLink } = useSmartLinks<typeof smartLinks>() // provide the type of your smartlinks

// Get properties for a specific smart link
const productsLink = getSmartLink('products')
console.log(productsLink.url) // https://api.example.com/products
console.log(productsLink.cacheDuration) // 5000

// Get just the cache key for use with MemoryLink or StorageLink
const productsCacheKey = smartLinks.getCacheKey('products') // 'products'

// Get just the URL for a fetch call
const productsUrl = smartLinks.getCacheUrl('products') // 'https://api.example.com/products'
```

#### Using with SmartLink components

SmartLinks pairs perfectly with the MemoryLink and StorageLink components:

```html
<template>
  <div>
    <!-- Using the built in helpers that provideSmartLink exports -->
    <MemoryLink 
      to="/products"
      :url="getCacheUrl('products')"
      :cacheKey="getCacheKey('products')"
      :cacheDuration="getSmartLink('products').cacheDuration"
    >
      View Products
    </MemoryLink>
    <!-- Using v-bind-->
    <MemoryLink 
      to="/products"
      v-bind="getSmartLink('products')"
    >
      View Products
    </MemoryLink>
  </div>
</template>

<script setup>
import { useSmartLinks } from '@crbroughton/nuxt-cache'

const { getCacheUrl, getCacheKey, getSmartLink } = useSmartLinks()
</script>
```

This approach provides type-safe access to your API endpoints and cache settings, making it easier to maintain consistent caching behaviour across your application.


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

### SmartLinks
- Provides a centralized store for managing API endpoints and cache settings
- Type-safe access to URLs and cache configuration
- Simplifies the use of MemoryLink and StorageLink components
- Helps maintain consistent caching behavior across your application

## Contributing

1. Clone this repository
2. Install dependencies using `bun install`
3. Run development server using `bun dev`
4. Create a PR with your changes

## License

[MIT License](./LICENSE)