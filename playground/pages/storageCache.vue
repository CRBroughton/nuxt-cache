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
const { data, status, error } = await useFetch<Product[]>(
  'https://fakestoreapi.com/products',
  {
    ...useStorageCache({ duration: 4000 }),
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
