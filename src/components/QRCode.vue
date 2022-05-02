<template>
  <div class="flex flex-col items-center justify-center gap-4">
    <h3 class="text-2xl font-bold">{{ t('qr.headline') }}</h3>
    <p>{{ t('qr.text') }}</p>
    <div class="flex flex-col items-center justify-center gap-4">
      <qrcode-stream @init="onInit" @decode="onDecode" class="!max-w-lg" />
      <p v-if="isLoading">{{ t('verify.initCamera')}}</p>
      <p class="uppercase text-3xl my-4">{{ t('qr.orLabel') }}</p>
      <qrcode-capture @decode="onDecode" @detect="onFileUploadDetect" />
      <p class="text-lg" v-if="fileUploadFeedback">{{ fileUploadFeedback }}</p>
    </div>
  </div>
</template>

<script>
import { QrStream, QrCapture } from 'vue3-qr-reader';
import {useI18n} from "vue-i18n";
import {ref} from "vue";

export default {
  components: {
    'qrcode-capture': QrCapture,
    'qrcode-stream': QrStream
  },
  emits: ['decode'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const fileUploadFeedback = ref('')

    const onDecode = (code) => {
      fileUploadFeedback.value = ''
      if (code) {
        emit('decode', code)
      }
    }

    const onFileUploadDetect = async (payload) => {
      fileUploadFeedback.value = t('verify.fileUpload.waiting')
      try {
        const result = await payload
        if (!result.content) {
          fileUploadFeedback.value = t('verify.fileUpload.error')
        }
      } catch (err) {
        fileUploadFeedback.value = t('verify.fileUpload.error')
      }
    }

    const isLoading = ref(true)

    const onInit = async (cb) => {
      try {
        await cb
      } catch (err) {
        console.error('Error while awaiting qrcode camera', err)
      } finally {
        isLoading.value = false
      }
    }

    return { onDecode, t, onInit, isLoading, onFileUploadDetect, fileUploadFeedback }
  }
}
</script>