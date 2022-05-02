<template>
  <div class="container mx-auto px-8 lg:px-4 mb-8">
    <h3 class="mb-4 text-4xl font-bold">{{ t('install.title') }}</h3>
    <p class="text-xl mb-4">{{ t('install.description') }}</p>
    <a class="btn btn-primary" href="https://metamask.io/download.html">{{ t('install.button') }}</a>
  </div>
</template>
<script>
import {useI18n} from "vue-i18n";

export default {
  name: 'Install',
  setup() {
    const { t } = useI18n()

    return { t }
  }
}
</script>