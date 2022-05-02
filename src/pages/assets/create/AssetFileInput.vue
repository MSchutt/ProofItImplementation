<template>
  <div class="flex flex-col items-center">
    <Lottie name="uploadImage" width="250px"></Lottie>
    <label class="label">
      <span class="label-text text-lg">{{ t('assets.create.descriptionLabel') }}</span>
    </label>
    <FileInput @update:item="formData.img = $event" />
  </div>

</template>

<script>
import {useI18n} from "vue-i18n";
import Lottie from "../../../components/Lottie.vue";
import FileInput from "./FileInput.vue";

export default {
  name: "AssetFileInput",
  components: {Lottie, FileInput},
  props: {
    formData: { type: Object }
  },
  setup(props, { emit }) {
    const { t } = useI18n()
    const onChange = (e) => {
      emit('update', { step: 2, data: e.target.value })
    }

    return { onChange, t }
  }
}
</script>

<style scoped>

</style>