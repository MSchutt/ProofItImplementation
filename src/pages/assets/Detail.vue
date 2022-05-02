<template>

  <div class="mb-8">
    <div v-if="!isErrorOrLoading && asset">

      <div class="grid grid-cols-1 lg:grid-cols-2 shadow-lg rounded-lg mb-12">
        <div class="bg-light-grey rounded-t-lg lg:rounded-none lg:rounded-l-lg p-8 flex flex-col justify-center">
          <div class="flex flex-wrap mb-6">
            <div class="w-full mb-6">
              <h2 class="text-4xl font-bold">{{ asset.name }}</h2>
            </div>
            <button @click.prevent="updateOwnershipModal(true); loadHistory();" class="btn m-2">{{ t('assets.history.btnLabel') }}</button>
            <template v-if="assetStore.detailView.isOwner">
              <button @click.prevent="updateVerificationModal(true);" class="btn m-2">{{ t('assets.verification.btnLabel') }}</button>
              <button @click.prevent="updateTransferOwnershipModal(true);" class="btn m-2">{{ t('assets.transferOwnership.btnLabel') }}</button>
              <button @click.prevent="generateQR();" class="btn m-2">{{ t('assets.detail.showVerificationBtnLabel') }}</button>
            </template>
          </div>

          <p class="text-lg mb-4 break-words">{{ t('assets.detail.ownedBy') }} <span class="font-bold">{{ owner }}</span></p>

        </div>
        <div class="rounded-b-lg lg:rounded-r-lg">
          <figure v-if="asset.img">
            <img class="w-full asset__image rounded-b-lg lg:rounded-none lg:rounded-r-lg " :src="asset.img" :alt="asset.name">
          </figure>
        </div>

      </div>

      <div v-if="asset.customProps && asset.customProps.length > 0">
        <h2 class="text-2xl">{{ t('assets.detail.additionalProps') }}</h2>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="my-6 shadow-lg rounded-lg" v-for="customProp in asset.customProps" :key="customProp.propertyName">
            <div class="bg-light-grey p-4 rounded-t-lg">
              <h4 class="text-lg">{{ customProp.propertyName }}</h4>
            </div>
            <p v-if="customProp.type === 'text' || customProp.type === 'longtext'" class="p-4 break-words">{{ customProp.value }}</p>
            <figure v-else>
              <img class="w-full h-full max-h-80 object-cover rounded-b-lg" :src="customProp.value" :alt="customProp.propertyName">
            </figure>
          </div>
        </div>

      </div>


    </div>
    <div v-else>
      <p>{{ $t('assets.detail.loading') }}</p>
      <p v-if="detailView.error">{{ $t('assets.detail.error') }} {{ detailView.error }}</p>
    </div>
    <Modal :buttons="modalButtons" v-if="displayOwnershipModal" @close="updateOwnershipModal(false)">
      <template v-slot:title>
        <h2 class="text-2xl font-bold">{{ t('assets.history.headline') }}</h2>
      </template>
      <template v-slot:content>
        <table class="table w-full mt-4">
          <thead>
          <tr>
            <th>{{ t('assets.history.table.owner') }}</th>
            <th>{{ t('assets.history.table.blockTimestamp') }}</th>
            <th>{{ t('assets.history.table.verifiedFor') }}</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="history in assetStore.history.arr">
            <td>{{ history[0] }}</td>
            <td>{{ formatTimestamp(history[1]) }}</td>
            <td>{{ history[2].length }}</td>
          </tr>
          </tbody>
        </table>
      </template>
    </Modal>


    <EthAddressInputModal
        v-if="displayTransferOwnershipModal"
        @close="updateTransferOwnershipModal(false)"
        @transfer="transferOwnership"
        :title="t('assets.transferOwnership.headline')"
        :transfer-button-label="t('assets.transferOwnership.transferBtnLabel')"
    />

    <EthAddressInputModal
        v-if="displayVerificationModal"
        @close="updateVerificationModal(false)"
        :title="t('assets.verification.headline')"
        :transfer-button-label="t('assets.verification.verifyBtnLabel')"
        @transfer="createVerification" />

    <TransactionModal v-if="assetStore.transferOwner.state"
                      :transactionStatus="assetStore.transferOwner.state"
                      :data="getCurrentStateObj.data"
                      :title="getCurrentStateObj.title"
                      :closeable="getCurrentStateObj.closeable"
                      @close="assetStore.resetTransferOwnership()"/>

    <TransactionModal v-if="assetStore.verification.state"
                      :transactionStatus="assetStore.verification.state"
                      :data="getCurrentVerificationStateObj.data"
                      :title="getCurrentVerificationStateObj.title"
                      :closeable="getCurrentVerificationStateObj.closeable"
                      @close="assetStore.resetVerification()"/>

    <QRModal v-if="displayVerificationQR && verifyStore.qrCode" :value="verifyStore.qrCode" @close="hideQR()" />
  </div>

</template>
<script>
  import {useRoute} from "vue-router";
  import useAssetStore from "../../store/indexasset";
  import {computed, inject, onMounted, reactive, ref} from "vue";
  import {useI18n} from "vue-i18n";
  import Modal from "../../components/Modal.vue";
  import EthAddressInputModal from "../../components/EthAddressInputModal.vue";
  import TransactionModal from "../../components/TransactionModal.vue";
  import QRModal from "../../components/QRModal.vue";
  import {useVerifyStore} from "../../store/verify";

  export default {
    name: 'Detail',
    components: {
      Modal,
      EthAddressInputModal,
      TransactionModal,
      QRModal
    },
    setup() {
      const route = useRoute();
      const assetStore = useAssetStore();
      const verifyStore = useVerifyStore();
      const { t } = useI18n()
      const eth = inject('eth');

      onMounted(() => {
        assetStore.getAsset(eth, route.params.id)
      })

      const detailView = computed(() => {
        return assetStore.detailView
      })

      const asset = computed(() => {
        return assetStore.detailView?.asset?.asset
      })

      const owner = computed(() => {
        if (assetStore.detailView?.asset?.owner) {
          return assetStore.detailView?.asset?.owner[0]
        } else {
          return null
        }
      })

      const formatTimestamp = (timestamp) => {
        // Provided timestamp is in seconds; Date requires milliseconds (*1000)
        const date = new Date(timestamp * 1000)
        return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', minute: '2-digit', hour: '2-digit' }).format(date)
      }

      const transferOwnership = (address) => {
        displayTransferOwnershipModal.value = false
        assetStore.transferOwnership(eth, route.params.id, address)
      }

      const createVerification = (address) => {
        displayVerificationModal.value = false
        assetStore.createVerification(eth, route.params.id, address)
      }

      const isErrorOrLoading = computed(() => {
        return assetStore.detailView?.error || assetStore.detailView?.loading
      })

      const displayOwnershipModal = ref(false)
      const updateOwnershipModal = (val) => {
        displayOwnershipModal.value = val
      }

      const displayVerificationModal = ref(false)
      const updateVerificationModal = (val) => {
        displayVerificationModal.value = val
      }

      const displayTransferOwnershipModal = ref(false)
      const updateTransferOwnershipModal = (val) => {
        displayTransferOwnershipModal.value = val
      }

      const displayVerificationQR = ref(false)
      const updateDisplayVerificationQR = (val) => {
        displayVerificationQR.value = val
      }

      const modalButtons = [
        {
          label: t('assets.history.closeBtnLabel'),
          onClick: 'close'
        }
      ]

      const loadHistory = () => {
        assetStore.loadHistory(eth, route.params.id)
      }

      const stateMap = reactive({
        confirm: { title: t('assets.transferOwnership.states.confirm'), closeable: false },
        mine: { title: t('assets.transferOwnership.states.mine'), closeable: false },
        save: { title: t('assets.transferOwnership.states.save'), closeable: true },
        error: { data: assetStore.transferOwner.error, title: t('assets.transferOwnership.states.error'), closeable: true },
      })

      const getCurrentStateObj = computed(() => {
        return stateMap[assetStore.transferOwner.state]
      })

      const stateMapVerification = reactive({
        confirm: { title: t('assets.verification.states.confirm'), closeable: false },
        mine: { title: t('assets.verification.states.mine'), closeable: false },
        save: { title: t('assets.verification.states.save'), closeable: true },
        error: { data: assetStore.transferOwner.error, title: t('assets.verification.states.error'), closeable: true },
      })

      const getCurrentVerificationStateObj = computed(() => {
        return stateMapVerification[assetStore.verification.state]
      })

      const generateQR = async () => {
        await verifyStore.generateVerifyQRText(eth, route.params.id)
        updateDisplayVerificationQR(true)
      }

      const hideQR = async () => {
        verifyStore.resetQRCode()
        updateDisplayVerificationQR(false)
      }


      return {
        route,
        assetStore,
        detailView,
        isErrorOrLoading,
        asset,
        owner,
        t,
        displayOwnershipModal,
        updateOwnershipModal,
        displayVerificationModal,
        updateVerificationModal,
        displayTransferOwnershipModal,
        updateTransferOwnershipModal,
        displayVerificationQR,
        updateDisplayVerificationQR,
        modalButtons,
        loadHistory,
        transferOwnership,
        getCurrentStateObj,
        formatTimestamp,
        getCurrentVerificationStateObj,
        createVerification,
        hideQR,
        generateQR,
        verifyStore
      };
    }
  }
</script>
<style lang="scss" scoped>
.asset {

  &__image {
    max-height: 50vh;
  }
}


</style>