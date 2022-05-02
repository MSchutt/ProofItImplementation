<template>
  <div class="mb-12">
    <div class="flex gap-4 items-center mb-12">
      <h2 class="text-3xl">{{ $t('assets.text') }}</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" v-if="assetStore.assets && assetStore.assets.length > 0">
      <router-link :to="`/assets/${asset.id}`" class="card hover:cursor-pointer shadow-xl bg-base-100" v-for="asset in assetStore.assets" :key="asset.name">
        <figure v-if="asset.img">
          <img class="aspect-square" :src="asset.img" :alt="asset.name">
        </figure>
        <div class="card-body">
          <h3 class="card-title ">{{ asset.name }}</h3>
          {{ extractStats(asset) }}
        </div>
      </router-link>
    </div>
    <div v-else-if="assetStore.assets.length === 0 && !assetStore.loading">
      <p class="text-xl">{{ t('assets.no_assets') }}</p>
    </div>
  </div>
</template>
<script>
import {inject, onMounted} from "vue";
import useAssetStore from "../../store/indexasset";
import {useI18n} from "vue-i18n";

export default {
  setup() {
    const { t } = useI18n()
    const eth = inject('eth')
    const assetStore = useAssetStore()

    onMounted(() => {
      assetStore.fetchAssets(eth)
    })

    const extractStats = (asset) => {
      if (asset?.customProps?.length === 0) {
        return ''
      }
      const mapped = asset.customProps.reduce((init, elem) => {
        if (!init[elem.type]) {
          init[elem.type] = 1
        } else {
          init[elem.type]++
        }
        return init
      }, {})
      return t('assets.additionalPropsText', [Object.keys(mapped).map(key => {
        return `${mapped[key]} ${key}`
      }).join(', ')])
    }

    return { t, assetStore, extractStats }
  }
}
</script>