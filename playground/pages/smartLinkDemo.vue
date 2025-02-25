<script setup lang="ts">
import type { SmartLinks } from '~/app.vue'

const { getSmartLink } = useSmartLinks<SmartLinks>()
</script>

<template>
  <div class="container">
    <MemoryLink
      to="/memoryCache"
      v-bind="getSmartLink('memory')"
    >
      Smart Link - Memory
    </MemoryLink>
    <MemoryLink
      to="/manualMemoryCache"
      v-bind="getSmartLink('manual_memory')"
    >
      Smart Link - Manual Memory
    </MemoryLink>
    <StorageLink
      to="/storageCache"
      v-bind="getSmartLink('storage')"
    >
      Smart Link - Storage
    </StorageLink>
    <StorageLink
      to="/manualStorageCache"
      v-bind="getSmartLink('manual_storage')"
    >
      Smart Link - Manual Storage
    </StorageLink>
  </div>
</template>

<style lang="css" scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 1em;
}
</style>
