<template>
  <div class="flex flex-col items-center">
    <Lottie name="write" width="250px"></Lottie>
    <label class="label">
      <span class="label-text text-lg">{{ t('assets.create.nameLabel') }}</span>
    </label>
    <input class="input input-bordered input-md w-full max-w-xs" type="text" :value="formData.name" @input.stop="onChange" :placeholder="$t('assets.create.nameLabel')">
  </div>
</template>

<script>
import Lottie from "../../../components/Lottie.vue";
import {useI18n} from "vue-i18n";
export default {
  components: {Lottie},
  props: {
    formData: { type: Object }
  },
  name: "AssetName",
  emits: ['update'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const onChange = (e) => {
      emit('update', { step: 1, data: e.target.value })
    }

    return { onChange, t }
  }
}
</script>

<style scoped>

</style>