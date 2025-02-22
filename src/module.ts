import { fileURLToPath } from 'node:url'
import { defineNuxtModule, createResolver, installModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'nuxt-cache',
    configKey: 'nuxtCache',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))

    await installModule('@vueuse/nuxt')

    nuxt.hook('imports:dirs', (dirs) => {
      dirs.push(resolve(runtimeDir, 'composables'))
    })
  },
})
