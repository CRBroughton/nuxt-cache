<script setup lang="ts">
import type { MemoryCache } from '../../src/runtime/types'

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
const { data, status, error } = await useFetch<MemoryCache<Product[]>>(
  'https://fakestoreapi.com/products',
  {
    ...useMemoryCache({ duration: 4000 }),
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
