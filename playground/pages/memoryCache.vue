<script setup lang="ts">
import type { MemoryCache } from '../../src/module'
import type { SmartLinks } from '~/app.vue'

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
const { getCacheKey } = useSmartLinks<SmartLinks>()
const { data, status, error } = useLazyFetch<MemoryCache<Product[]>>(
  'https://fakestoreapi.com/products',
  {
    ...useMemoryCache({ key: getCacheKey('memory'), duration: 10_000 }),
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
      {{ data }}
      <div
        v-for="product of data.data"
        :key="product.id"
      >
        {{ product }}
      </div>
    </div>
  </div>
</template>
