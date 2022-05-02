<template>
  <Modal @close="$emit('close', true)" :buttons="modalButtons" :title="t('assets.verificationQR.title')">
    <template v-slot:content>
      <p>{{ t('assets.verificationQR.explanation') }}</p>
      <QRCodeVue3 :value="value" />
    </template>
  </Modal>
</template>
<script>
import QRCodeVue3 from "qrcode-vue3";
import Modal from "./Modal.vue";
import {useI18n} from "vue-i18n";

export default {
  props: {
    value: {
      type: String,
      required: true
    }
  },
  emits: ['close'],
  components: {
    QRCodeVue3,
    Modal
  },
  setup() {
    const { t } = useI18n()

    const modalButtons = [
      {
        label: t('assets.verificationQR.closeBtnLabel'),
        onClick: 'close'
      }
    ]

    return { modalButtons, t }
  }
}
</script>