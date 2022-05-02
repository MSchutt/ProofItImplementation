<template>
  <Modal v-if="transactionStatus" :buttons="closeButtons" @close="$emit('close', true)">
    <template v-slot:content>
      <div>
        <h2 class="text-3xl font-bold mb-2">{{ title }}</h2>
        <Lottie :name="transactionStatus"/>
        <p v-if="data">{{ data }}</p>
      </div>
    </template>
  </Modal>
</template>
<script>
import Lottie from "./Lottie.vue";
import Modal from "./Modal.vue";
import {computed} from "vue";
import {useI18n} from "vue-i18n";

export default {
  props: {
     transactionStatus: {
       type: String,
       required: true
     },
     title: {
       type: String,
       default: ''
     },
     lottie: {
       type: Object,
       default: () => ({})
     },
    closeable: {
      type: Boolean,
      default: false
    },
     data: {
       type: String,
       default: ''
     }
  },
  emits: ['close'],
  components: {
    Lottie,
    Modal
  },
  setup(props) {
    const { t } = useI18n();

    const renderComponent = computed(() => {
      return componentMap[props.transactionStatus];
    });

    const closeButtons = computed(() => {
      if (props.closeable) {
        return [
          {
            label: t('assets.create.acceptModal.labels.cancel'),
            onClick: 'close'
          }
        ]
      } else {
        return []
      }
    })

    return { renderComponent, props, closeButtons, t }
  }
}
</script>