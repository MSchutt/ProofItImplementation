<template>
  <div class="flex flex-col items-center">
    <Lottie name="addItem" width="250px"></Lottie>
    <h4 class="mb-3 text-lg">{{ $t('assets.create.newPropHeadline') }}</h4>
    <input class="input input-bordered" type="text" v-model="newPropertyName" >

    <div class="my-4">
      <label class="label">
        <span class="label-text text-base mb-1 text-center w-full">{{ t('assets.create.radioLabel') }}</span>
      </label>
      <div class="flex items-center">
        <div class="flex mr-4">
          <input v-model="typeOption" type="radio" name="radio-type" :value="t('assets.create.radio.text')" class="radio mr-2">
          {{ t('assets.create.radio.text') }}
        </div>
        <div class="flex mr-4">
          <input v-model="typeOption" type="radio" name="radio-type" :value="t('assets.create.radio.file')" class="radio mr-2">
          {{ t('assets.create.radio.file') }}
        </div>
        <div class="flex">
          <input v-model="typeOption" type="radio" name="radio-type" :value="t('assets.create.radio.longtext')" class="radio mr-2">
          {{ t('assets.create.radio.longtext') }}
        </div>
      </div>
    </div>

    <button :disabled="isCreateButtonDisabled" class="btn btn-primary mt-2" @click.prevent="addNewProperty()">{{ t('assets.create.newPropSubmitLabel') }}</button>

  </div>
</template>

<script>
import Lottie from "../../../components/Lottie.vue";
import {useI18n} from "vue-i18n";
import {ref} from "vue";
import FileInput from "./FileInput.vue";
import TextInput from "./TextInput.vue";
import TextareaInput from "./TextareaInput.vue";
import {computed} from "vue";

export default {
  name: "AssetNewProperty",
  components: {Lottie},
  props: {
    formData: { type: Object }
  },
  setup(props, { emit }) {
    const { t } = useI18n()

    const newPropertyName = ref('')
    const typeOption = ref(t('assets.create.radio.text'))

    const isCreateButtonDisabled = computed(() => {
      return !(newPropertyName.value && !(props.formData.customProps.find(p => p.propertyName === newPropertyName.value)))
    })

    const resolvedProps = {
      [t('assets.create.radio.file')]: { component: FileInput, name: 'file' },
      [t('assets.create.radio.text')]: { component: TextInput, name: 'text' },
      [t('assets.create.radio.longtext')]: { component: TextareaInput, name: 'longtext' },
    }
    const mapProps = {
      file: FileInput,
      text: TextInput,
      longtext: TextareaInput,
    }

    const addNewProperty = () => {
      if (!(newPropertyName.value)) return
      emit('update', { step: 3, data: {
          id: Date.now(),
          propertyName: newPropertyName.value,
          type: resolvedProps[typeOption.value].name,
          value: ''
        } })
      newPropertyName.value = ''
    }


    return { t, isCreateButtonDisabled, addNewProperty, typeOption, newPropertyName }

  }
}
</script>

<style scoped>

</style>