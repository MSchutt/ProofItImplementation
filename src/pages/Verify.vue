<template>
  <div>
    <h2 class="text-5xl text-secondary-content font-bold text-center mb-4">{{ t('verify.title') }}</h2>
    <template v-if="showData">
      <button class="btn mt-6 mb-4 ml-4" @click="resetData">{{ t('verify.scanAgain') }}</button>
      <table class="table w-full mt-4">
        <thead>
        <tr>
          <th>{{ t('verify.table.owner') }}</th>
          <th>{{ t('verify.table.asset') }}</th>
          <th>{{ t('verify.table.assetLink') }}</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td>{{ data.owner }}</td>
          <td>{{ data.asset }}</td>
          <td class="btn"><router-link :to="`/assets/${data.asset}`">{{ t('verify.table.linkLabel') }}</router-link></td>
        </tr>
        </tbody>
      </table>
      <div>
        <p class="text-5xl font-bold">{{ resultToLottie.text }}</p>
        <Lottie :name="resultToLottie.lottie" />
      </div>

    </template>
    <QRCode v-else @decode="onDecoded" />


  </div>
</template>
<script>
import {useI18n} from "vue-i18n";
import {computed, inject, onMounted, reactive, ref} from "vue";
import QRCode from "../components/QRCode.vue";
import {ethers} from "ethers";
import {useVerifyStore} from "../store/verify";
import Lottie from "../components/Lottie.vue";

export default {
  components: {
    QRCode,
    Lottie
  },
  setup() {
    const { t } = useI18n()
    const store = useVerifyStore()
    const eth = inject('eth')

    const data = reactive({
      asset: null,
      owner: null
    })

    const address = ref('')
    const isValidAddress = computed(() => {
      return ethers.utils.isAddress(address.value)
    })
    const onDecoded = async (decoded) => {
      let parsed
      try {
        parsed = JSON.parse(decoded)
      } catch (e) {
        console.error(e)
        return
      }
      data.asset = parsed.asset
      data.owner = parsed.owner
      await store.checkVerification(eth, data.asset, data.owner)
    }

    const resetData = () => {
      data.asset = null
      data.owner = null
    }

    const showData = computed(() => {
      return data && data.asset && data.owner
    })

    onMounted(() => {
      store.resetQRCode()
    })

    const resultToLottie = computed(() => {
      // Secure check
      if (store.result.secure && store.result.result) {
        return { lottie: 'check', text: t('verify.texts.secure') }
      } else if (!store.result.secure && store.result.result) {
        return { lottie: 'warn', text: t('verify.texts.warn') }
      } else {
        return { lottie: 'error', text: t('verify.texts.error') }
      }
    })

    return { t, address, isValidAddress, eth, store, onDecoded, data, showData, resetData, resultToLottie }
  }
}
</script>