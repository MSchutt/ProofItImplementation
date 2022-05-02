import {ethers} from "ethers";
import {defineStore} from "pinia";
import { i18n } from "../plugins/i18n";
import {useFilestoreStore} from "./awss3";


// Asset Store which deals with creating assets
export const useCreateAssetStore = defineStore('asset', {
    state: () => {
        return {
            _error: null,
            _success: null,
            _state: null
        }
    },
    actions: {
        async createAsset(ethereum, asset) {
            try {
                this.resetMessage()
                await ethereum.init()
                // Upload to IPFS via Filebase
                let result
                try {
                    this._state = 'upload'
                    result = await this.uploadToIPFS(asset, ethereum)
                } catch (err) {
                    this._state = 'error'
                    this._error = `${i18n.t('assets.create.errorModal.unknownError')} --> Error: ${err}`
                    console.error(err)
                    return
                }
                if (!result) {
                    this._state = 'error'
                    this._error = i18n.t('assets.create.errorModal.filebaseError')
                    return
                }
                if (result.exists) {
                    this._state = 'error'
                    this._error = i18n.t('assets.create.errorModal.assetExists')
                    return
                }
                // Create ethereum transaction (mint asset)
                this._state = 'confirm'
                const tx = await ethereum.contract.mint(result.encodedIpfsHash);
                this._success = tx
                // Wait until transaction is mined
                this._state = 'mine'
                await tx.wait()
                // wait for the transaction mining (local chain is of course a lot faster than real chain)
                await new Promise((resolve) => setTimeout(resolve, 2500))
                this._state = 'save'
            } catch (err) {
                console.error(err)
                this._error = err
                this._state = 'error'
            }
        },
        resetMessage() {
            this._error = null
            this._success = null
            this._state = null
        },
        async uploadToIPFS(asset, ethereum) {
            const s3 = useFilestoreStore()
            await new Promise((resolve) => setTimeout(resolve, 2000))
            return await s3.putAsset(asset, ethereum)
        }
    },
    getters: {
        uploadState(state) {
            return state._state
        },
        error(state) {
            if (!state._error) {
                return null
            }
            if (typeof state._error === 'string') {
                return state._error
            } else if (state._error.error) {
                return state._error.error
            } else {
                if (this._error.code && this._error.message) {
                    return i18n.t('assets.create.errorModal.errFormat', [state._error?.message, state._error?.code])
                } else {
                    return state._error
                }
            }
        },
        success(state) {
            if (!state._success) {
                return null
            }
            if (typeof state._success === 'string') {
                return state._success
            } else {
                const interstingProps = [{
                    name: i18n.t('assets.create.successModal.labels.transactionHash'),
                    value: state._success.hash
                }, {
                    name: i18n.t('assets.create.successModal.labels.blockNumber'),
                    value: state._success.blockNumber
                }, {
                    name: i18n.t('assets.create.successModal.labels.gasPrice'),
                    value: `${ethers.utils.formatUnits(state._success.gasPrice, 'gwei')} gwei`
                }]
                return i18n.t('assets.create.successModal.content') + '<br/>' + interstingProps.map((prop) => {
                    return `${prop.name}: ${prop.value}`
                }).join('<br/>')
            }
        }
    }
})

export default useCreateAssetStore