<template>
  <div class="inline-flex w-full items-center justify-center">
    <input @keyup="onDecoded($event.target.value)" class="input input-bordered w-full mt-4" type="text" :placeholder="t('assets.transferOwnership.inputPlaceholder')" v-model="value">
    <svg class="hover:cursor-pointer border rounded-lg h-10 ml-6" @click.prevent="toggleCameraScan" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
  </div>
  <QRCode v-if="showCameraScan" @decode="onDecoded" />
</template>
<script>
import QRCode from "./QRCode.vue";
import {ref} from "vue";
import {useI18n} from "vue-i18n";

export default {
  props: {
     value: {
       type: String,
       required: true
     }
  },
  components: {
    QRCode
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const showCameraScan = ref(false)
    const toggleCameraScan = () => {
      showCameraScan.value = !showCameraScan.value
    }

    const onDecoded = (a) => {
      emit('update:value', a)
      // showCameraScan.value = false
      // assetStore.transferOwnership(address)
    }

    return { onDecoded, showCameraScan, toggleCameraScan, t }
  }
}
</script>