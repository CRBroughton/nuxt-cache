<script setup lang="ts">
import type { Product } from './manualMemoryCache.vue'

const { cachedFetch,
} = useFetchMemoryCache($fetch)

const FIVE_SECONDS = 5000
const products = ref<Product[]>([])

const fetchProducts = async () => {
  const response = await cachedFetch<Product[]>('https://fakestoreapi.com/products', {
    key: 'products-list',
    duration: FIVE_SECONDS,
  })
  products.value = response
}
</script>

<template>
  <div>
    <button @click="fetchProducts">
      Fetch products
    </button>
    <div v-if="products">
      <div
        v-for="product in products"
        :key="product.id"
      >
        <span>{{ product.id }}</span>
        <span>{{ product.description }}</span>
        <span>{{ product.category }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
