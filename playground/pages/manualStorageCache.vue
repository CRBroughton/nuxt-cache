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

type MinimalProduct = Pick<Product, 'id' | 'title' | 'price'>
const CACHE_KEY = '__memory_cache__/products'
const { data, status, error } = await useFetch<MinimalProduct[]>(
  'https://fakestoreapi.com/products',
  {
    transform(input) {
      const modifiedProducts = input.map(product => ({
        id: product.id,
        title: product.title,
        price: product.price,
      }))
      return createStorageHandler(CACHE_KEY, modifiedProducts).value.data
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
    </div>

    <!-- Only render when we have data -->
    <div v-else-if="data">
      <div
        v-for="product of data"
        :key="product.id"
      >
        {{ product }}
      </div>
    </div>
  </div>
</template>
