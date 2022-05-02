<template>
  <div class="overflow-hidden relative w-64 mt-4 mb-4">
    <a class="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 w-full inline-flex items-center justify-center rounded hover:cursor-pointer">
      <svg fill="#FFF" height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
      </svg>
      <span class="ml-2">{{ t('assets.fileInput') }}</span>
      <input class="cursor-pointer hover:cursor-pointer absolute block opacity-0 pin-r pin-t" type="file" name="vacancyImageFiles" @change.prevent="onChange">
    </a>
  </div>
  <img class="avatar w-48 flex border-4 rounded shadow" v-if="displayedFile" :src="displayedFile">
</template>
<script>
import {ref} from "vue";
import {useI18n} from "vue-i18n";

export default {
  emits: ['update:item'],
  setup(_, { emit }) {
    const { t } = useI18n()
    const displayedFile = ref('')

    const onChange = (e) => {
      const files = e.srcElement.files;
      const file = files[0];


      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        emit('update:item', reader.result);
        displayedFile.value = reader.result
      };

    }
    return { onChange, displayedFile, t }

  }
}
</script>