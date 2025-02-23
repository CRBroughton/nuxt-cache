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
    <NuxtLink to="/smartLinkDemo">
      Smart Link Demo
    </NuxtLink>
  </div>
</template>

<style lang="css" scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 1em;
}
</style>
