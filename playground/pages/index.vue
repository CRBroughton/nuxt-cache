<template>
  <div class="container">
    <NuxtLink to="/memoryCache">
      Memory Demo
    </NuxtLink>
    <NuxtLink to="/manualMemoryCache">
      Manual Memory Demo
    </NuxtLink>
    <NuxtLink to="/storageCache">
      Storage Demo
    </NuxtLink>
    <NuxtLink to="/manualStorageCache">
      Manual Storage Demo
    </NuxtLink>
  </div>
</template>

<style lang="css" scoped>
.container {
  display: flex;
  gap: 1em;
}
</style>
