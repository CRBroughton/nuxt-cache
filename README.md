# Nuxt Cache


A flexible caching solution for Nuxt 3 that provides both in-memory and persistent storage caching strategies.

## Features

- 🧠 `useMemoryCache`: Server-side in-memory caching with Nuxt's payload system
- 💾 `useStorageCache`: Client-side persistent caching using localStorage
- ⚡️ Zero-config setup with sensible defaults
- 🎯 Full TypeScript support
- 🔄 Compatible with `useFetch`, `useLazyFetch`, and custom fetch composables
- 💪 Built on top of VueUse's useStorage for persistent caching

## Installation

```bash
npm install nuxt-cache
```

1. Add  `nuxt-cache` to the `modules` section of your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: [
    'nuxt-cache'
  ],
})
```

## Usage

### Memory Cache

Uses Nuxt's built-in payload system to cache data in memory. Ideal for server-side rendered data that doesn't need to persist.

```ts
import { useMemoryCache } from 'nuxt-cache'

// Basic usage
const { data } = await useFetch('/api/products', {
  ...useMemoryCache({ duration: 3600000 }) // Cache for 1 hour
})

// With lazy loading
const { data } = await useLazyFetch('/api/products', {
  ...useMemoryCache({ duration: 3600000 })
})
```

### Storage Cache

Uses localStorage to persist cached data between page reloads. Perfect for client-side data that should survive browser refreshes.

```ts
import { useStorageCache } from 'nuxt-cache'

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

## Configuration

### Cache Options

#### Memory Cache Options

| Option | Type | Description |
|---|---|---|
| `duration` | `number` | Duration in milliseconds before cache expires |

#### Storage Cache Options

| Option | Type | Description |
|---|---|---|
| `duration` | `number` | Duration in milliseconds before cache expires |
| `key` | `string` | Custom key for storage cache (defaults to route path) |

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