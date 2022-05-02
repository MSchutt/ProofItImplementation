<template>
    <Vue3Lottie :animationData="animationData" :width="width" :key="name" />
</template>
<script>
import { Vue3Lottie } from 'vue3-lottie'
import 'vue3-lottie/dist/style.css'
import LottieWait from '../assets/lottie/wait.json'
import LottieUpload from '../assets/lottie/upload.json'
import LottieSave from '../assets/lottie/save.json'
import LottieError from '../assets/lottie/error.json'
import LottieMining from '../assets/lottie/mining.json'
import LottieWarning from '../assets/lottie/warning.json'
import LottieWarningError from '../assets/lottie/warn_err.json'
import LottieCheck from '../assets/lottie/check.json'
import LottieWrite from '../assets/lottie/write.json'
import LottieUploadImage from '../assets/lottie/upload-image.json'
import LottieAddItem from '../assets/lottie/add-item.json'
import {computed} from "vue";


export default {
  components: {
    Vue3Lottie
  },
  props: {
     name: {
       type: String,
       required: true
     },
    width: {
       type: String,
       default: '350px'
    }
  },
  setup(props) {
    const lottieMap = {
      confirm: LottieWait,
      upload: LottieUpload,
      save: LottieSave,
      error: LottieError,
      mine: LottieMining,
      warn: LottieWarning,
      warnErr: LottieWarningError,
      check: LottieCheck,
      write: LottieWrite,
      addItem: LottieAddItem,
      uploadImage: LottieUploadImage
    }

    const animationData = computed(() => lottieMap[props.name])

    return { animationData }
  }
}
</script>