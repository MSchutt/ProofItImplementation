<template>
  <Modal @close="$emit('close', true)">
    <template v-slot:title>
      <h2 class="text-2xl font-bold">{{ title }}</h2>
    </template>
    <template v-slot:content>
      <EthAddressInput v-model:value="address" />
    </template>
    <template v-slot:buttonRow>
      <div class="flex justify-end mt-6 gap-6">
        <button class="btn" @click.prevent="$emit('close', true)">{{ t('assets.transferOwnership.closeBtnLabel') }}</button>
        <button :disabled="!(address && isValidAddress)" @click.prevent="$emit('transfer', address)" class="btn">{{ transferButtonLabel }}</button>
      </div>
    </template>
  </Modal>
</template>
<script>
import Modal from "./Modal.vue";
import useAssetStore from "../store/indexasset";
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import QRCode from "./QRCode.vue";
import EthAddressInput from "./EthAddressInput.vue";
import {ethers} from "ethers";

export default {
  name: 'EthAddressInputModal',
  components: {
    Modal,
    QRCode,
    EthAddressInput
  },
  props: {
    title: {
      type: String,
      required: true
    },
    transferButtonLabel: {
      type: String
    }
  },
  emits: ['close', 'transfer'],
  setup() {
    const assetStore = useAssetStore()
    const { t } = useI18n()
    const address = ref('')

    const isValidAddress = computed(() => {
      return ethers.utils.isAddress(address.value)
    })

    return { address, assetStore, t, isValidAddress }
  }
}
</script>