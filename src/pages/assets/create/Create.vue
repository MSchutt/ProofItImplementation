<template>
  <div>
    <div class="flex items-center gap-4">
      <router-link to="/assets" class="btn btn-secondary btn-outline btn-md">
        <svg class="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        {{ t('assets.create.overview') }}
      </router-link>
      <h2 class="text-xl">{{ t('assets.create.headline') }}</h2>
    </div>

    <div class="w-full">
    </div>
    <div class="custom-stepper">
      <div class="custom-stepper__item" v-for="(step, idx) in steps" :key="idx">
        <div :class="`custom-stepper__number ${ stepDone(idx) ? 'custom-stepper__number--done' : '' }`">
          <span v-if="stepDone(idx)">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          </span>
          <span v-else>{{ idx + 1 }}</span>
          <div class="custom-stepper__name">
            {{ step.name }}
          </div>
        </div>
      </div>
    </div>

    <form class="form-control" @submit.prevent="onSubmit()">
      <template v-for="(step, idx) in steps" :key="idx">
        <div v-if="currentStep === idx"  class="mb-12">
          <component :is="step.content" :formData="formData" @update="updateStepData($event)"></component>
        </div>
      </template>
      <div class="w-full flex justify-center">
        <div class="w-full relative mb-20 max-w-xl">
          <button class="btn btn-primary text-white absolute left-0" @click.prevent="previousStep" v-if="!isFirstStep">
            <svg class="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
            {{ t('assets.create.stepper.prev') }}
          </button>
          <button class="btn btn-primary text-white absolute right-0" @click.prevent="nextStep" v-if="!isLastStep">
            {{ t('assets.create.stepper.next') }}
            <svg class="w-6 h-6 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
          <button :disabled="isCreateAssetButtonDisabled" class="btn btn-primary text-white absolute right-0" v-if="isLastStep">
            {{ t('assets.create.submitLabel') }}
            <svg class="w-6 h-6 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          </button>
        </div>
      </div>
    </form>

    <form class="flex justify-center" @submit.prevent="onSubmit()" v-if="isLastStep && formData.customProps.length > 0">
      <div class="flex flex-col mt-8 items-center">
        <div class="w-full border-b-2 border-light-grey mb-4">
          <h3 class="text-xl mb-1 text-center">{{ t('assets.create.otherProperties') }}</h3>
        </div>
        <template v-for="customProp of formData.customProps" :key="customProp.id">
          <div class="mb-4 relative max-w-fit">
            <label class="label inline-flex">
              <span class="label-text">{{ customProp.propertyName }}</span>
              <button @click="removeCustomProperty(customProp.id)" class="ml-6 btn btn-sm btn-outline absolute right-0 top-0">x</button>
            </label>
            <component :is="getResolvedComponent(customProp.type)" @update:item="customProp.value = $event" />
          </div>
        </template>
      </div>
    </form>

    <Modal v-if="showAcceptModal"
           :title="t('assets.create.acceptModal.title')"
           :content="t('assets.create.acceptModal.content')"
           :buttons="acceptModalButtons"
           @close="showAcceptModal = false"
           @ok="onModalAllow"
    />

    <TransactionModal v-if="assetStore.uploadState"
                      :transactionStatus="assetStore.uploadState"
                      :data="getCurrentStateObj.data"
                      :title="getCurrentStateObj.title"
                      :closeable="getCurrentStateObj.closeable"
                      @close="assetStore.resetMessage()"/>


  </div>

</template>
<script>
import {computed, inject, reactive, ref} from 'vue'
import {useI18n} from "vue-i18n";
import TextInput from "./TextInput.vue";
import TextareaInput from "./TextareaInput.vue";
import FileInput from "./FileInput.vue";
import Modal from '../../../components/Modal.vue';
import useCreateAssetStore from "../../../store/asset";
import TransactionModal from "../../../components/TransactionModal.vue";
import AssetName from "./AssetName.vue";
import AssetFileInput from "./AssetFileInput.vue";
import AssetNewProperty from "./AssetNewProperty.vue";
export default {
  components: {AssetName, AssetFileInput, AssetNewProperty, TextInput, TextareaInput, FileInput, Modal, TransactionModal },
  setup() {
    const { t } = useI18n()
    const assetStore = useCreateAssetStore()

    const successModalButtons = [
      {
        label: t('assets.create.successModal.buttonLabel'),
        onClick: 'close'
      }
    ]

    const acceptModalButtons = [
      {
        label: t('assets.create.acceptModal.labels.cancel'),
        onClick: 'close',
        color: 'neutral'
      },
      {
        label: t('assets.create.acceptModal.labels.ok'),
        onClick: 'ok',
        color: 'primary'
      }
    ]

    const eth = inject('eth')
    const loading = ref(false)
    const showAcceptModal = ref(false)
    const newPropertyName = ref('')
    const typeOption = ref(t('assets.create.radio.text'))
    const error = ref('')
    let currentStep = ref(0)

    const stateMap = reactive({
      upload: { title: t('assets.create.states.upload'), closeable: false },
      confirm: { title: t('assets.create.states.waiting'), closeable: false },
      mine: { title: t('assets.create.states.mine'), closeable: false },
      save: { title: t('assets.create.successModal.title'), closeable: true },
      error: { data: assetStore.error, title: t('assets.create.states.error'), closeable: true },
    })

    const getCurrentStateObj = computed(() => {
      return stateMap[assetStore.uploadState]
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

    const getResolvedComponent = (val) => {
      return mapProps[val]
    }

    let formData = reactive({ name: '', img: null, customProps: [] })

    const onSubmit = async () => {
      showAcceptModal.value = true
    }

    const onModalAllow = async () => {
      showAcceptModal.value = false
      // call to backend
      const customProps = formData.customProps.map(({ propertyName, value, type }) => {
        return { propertyName, value, type }
      })
      await assetStore.createAsset(eth, {...formData, customProps })
      Object.assign(formData, { name: '', img: null, customProps: [] })
      currentStep.value = 0
    }

    const addNewProperty = () => {
      if (!(newPropertyName.value)) return
      formData.customProps.push({
        id: Date.now(),
        propertyName: newPropertyName.value,
        type: resolvedProps[typeOption.value].name,
        value: ''
      })
      newPropertyName.value = ''
    }

    const removeCustomProperty = (id) => {
      formData.customProps = formData.customProps.filter(p => p.id !== id)
    }

    const isCreateAssetButtonDisabled = computed(() => {
      return !(formData.name && formData.img)
    })


    // stepper logic

    const steps = [
      { id: 1, name: t('assets.create.stepper.first-step'), content: AssetName },
      { id: 2, name: t('assets.create.stepper.second-step'), content: AssetFileInput },
      { id: 3, name: t('assets.create.stepper.third-step'), content: AssetNewProperty },
    ]


    const totalSteps = computed(() => {
      return steps.length;
    })

    const isFirstStep = computed(() => {
      return currentStep.value === 0;
    })

    const isLastStep = computed(() => {
      return currentStep.value === (totalSteps.value - 1);
    })

    const nextStep = () => {
      if (isLastStep.value) return
      currentStep.value++
    }

    const previousStep = () => {
      if (isFirstStep.value) return
      currentStep.value--
    }

    const stepDone = (step) => {
      return currentStep.value > step
    }

    const updateStepData = (payload) => {
      switch (payload.step) {
        case 1:
          formData.name = payload.data
          break;
        case 2:
          formData.img = payload.data
          break
        case 3:
          formData.customProps.push(payload.data)
      }
    }

    return { t, assetStore, getCurrentStateObj, stateMap, isCreateAssetButtonDisabled, acceptModalButtons,
      showAcceptModal, eth, onModalAllow, successModalButtons, getResolvedComponent, loading,
      error, onSubmit, newPropertyName, formData, addNewProperty, removeCustomProperty, typeOption, resolvedProps,
      steps, currentStep, previousStep, nextStep, isFirstStep, isLastStep, stepDone, updateStepData
    }
  }
}

</script>

<style lang="scss" scoped>

.custom-stepper {
  @apply w-full flex justify-center;
  @apply my-8;

  &__name {
    @apply absolute text-center text-secondary w-full;
    @apply mt-1 text-sm;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    min-width: fit-content;
  }

  &__item {
    @apply relative;

    &:not(:last-child) {
      @apply pr-20;
    }

    &:not(:last-child):after {
      content: '';
      position: absolute;
      @apply bg-secondary;
      display: block;
      @apply w-20;
      height: 5px;
      top: 50%;
      left: 100%;
      z-index: 1;
      @apply -ml-20;
    }
  }

  &__number {
    @apply relative;
    @apply rounded-full w-10 h-10 bg-light-grey flex justify-center items-center;

    &--done {
      @apply bg-primary text-white;
    }
  }
}

</style>
