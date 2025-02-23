<script setup lang="ts">
export interface Product {
  id: number
  title: string
  price: number
  description: string
  category: string
  image: string
  rating: Rating
}

interface Rating {
  rate: number
  count: number
}
const MANUAL_MEMORY_CACHE_KEY = 'manual_memory'
const { data, status, error } = await useFetch(
  'https://fakestoreapi.com/products',
  {
    key: MANUAL_MEMORY_CACHE_KEY, // for Memory Links
    transform(input: Product[]) {
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
</script>

<template>
  <div>
    <NuxtLink to="/">BACK</NuxtLink>
    <!-- Add loading state -->
    <div v-if="status === 'pending'">
      Loading...
    </div>

    <!-- Add error state -->
    <div v-else-if="error">
      Error loading products
      {{ error }}
    </div>

    <!-- Only render when we have data -->
    <div v-else-if="data">
      {{ data.fetchedAt }}
      <div
        v-for="product of data.data"
        :key="product.id"
      >
        {{ product }}
      </div>
    </div>
  </div>
</template>
