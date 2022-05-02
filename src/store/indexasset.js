import {defineStore} from "pinia";
import {ethers} from "ethers";
import {useFilestoreStore} from "./awss3";
import {i18n} from "../plugins/i18n";

// Store that handles everything related to displaying assets and transfering ownership
export const useAssetStore = defineStore('asset_index', {
    state: () => {
        return {
            assets: [],
            loading: false,
            error: null,
            detailView: {
                asset: null,
                loading: false,
                error: null,
                isOwner: false
            },
            history: {
                arr: [],
                loading: false,
                error: null
            },
            transferOwner: {
                result: null,
                loading: false,
                state: null,
                error: null
            },
            verification: {
                result: null,
                loading: false,
                state: null,
                error: null
            }
        }

    },
    actions: {
        async fetchAssets(eth) {
            await eth.init()
            this.loading = true
            this.error = null

            // load all the owned assets
            try {
                const assets = (await eth.contract.getOwnedAssets(eth.account)).map((u) => ethers.utils.toUtf8String(u))
                this.assets = await Promise.all(assets.map(this.fetchAsset))
            } catch (err) {
                this.error = err
            } finally {
                this.loading = false
            }
        },
        // Fetch an asset -> if tryStore is set to true if will first try to find it locally instead of going to the remote server
        async fetchAsset(asset, tryStore = true) {
            if (tryStore) {
                if (this.assets.length > 0) {
                    const found = this.assets.find((a) => a.id === asset.id)
                    if (found) {
                        return found
                    }
                }
            }
            const s3 = useFilestoreStore()
            const result = await s3.getAsset(asset)
            return { ...JSON.parse(result.Body.toString('utf-8')), id: asset }
        },
        async doesAssetExist(eth, id) {
            try {
                return await eth.contract.doesAssetExist(ethers.utils.toUtf8Bytes(id))
            } catch (err) {
                console.error(`Error checking if asset exists: ${err}`)
                return false
            }
        },
        async fetchDetail(eth, id) {
            await eth.init()
            // Check if asset exists
            if (!(await this.doesAssetExist(eth, id))) {
                return null
            }
            // Fetch owner & asset details
            const owner = await eth.contract.getCurrentOwner(ethers.utils.toUtf8Bytes(id))
            const asset = await this.fetchAsset(id)
            return { owner, asset }
        },
        async transferOwnership(eth, id, newOwner) {
            await eth.init()

            this.resetTransferOwnership()

            this.transferOwner.loading = true
            this.transferOwner.state = 'confirm'

            try {
                this.transferOwner.result = await eth.contract.transferOwnership(ethers.utils.toUtf8Bytes(id), ethers.utils.getAddress(newOwner))
                this.transferOwner.state = 'mine'
                await this.transferOwner.result.wait()
                await new Promise((resolve) => setTimeout(resolve, 3000))
                this.transferOwner.state = 'save'
            } catch (err) {
                console.error(err)
                this.transferOwner.state = 'error'
                this.transferOwner.error = err
            } finally {
                this.transferOwner.loading = false
            }
        },
        resetTransferOwnership() {
           this.transferOwner.result = null
           this.transferOwner.state = null
           this.transferOwner.error = null
           this.transferOwner.loading = false
        },
        async createVerification(eth, id, forAddress) {
            await eth.init()

            this.resetVerification()

            this.verification.loading = true
            this.verification.state = 'confirm'

            try {
                this.verification.result = await eth.contract.storeVerification(ethers.utils.toUtf8Bytes(id), ethers.utils.getAddress(forAddress))
                this.verification.state = 'mine'
                await this.verification.result.wait()
                await new Promise((resolve) => setTimeout(resolve, 3000))
                this.verification.state = 'save'
            } catch (err) {
                console.error(err)
                this.verification.state = 'error'
                this.verification.error = err
            } finally {
                this.verification.loading = false
            }
        },
        resetVerification() {
            this.verification.result = null
            this.verification.state = null
            this.verification.error = null
            this.verification.loading = false
        },
        async loadHistory(eth, id) {
            await eth.init()

            this.history.loading = true
            this.history.error = null
            this.history.arr = []

            try {
                this.history.arr = await eth.contract.getPreviousOwners(ethers.utils.toUtf8Bytes(id))
            } catch (err) {
                this.history.error = err
            } finally {
                this.history.loading = false
            }
        },
        async getAsset(eth, id) {
            await eth.init()

            this.detailView.loading = true
            this.detailView.error = ''

            try {
                const result = await this.fetchDetail(eth, id)
                if (!result) {
                    this.detailView.error = i18n.t('asset.detail.errGeneric')
                } else {
                    this.detailView.asset = result
                    const signer = await eth.signer.getAddress()
                    this.detailView.isOwner = result.owner[0] === signer
                }
            } catch (err) {
                console.error(err)
                this.detailView.error = err
            } finally {
                this.detailView.loading = false
            }
        }
    },
});

export default useAssetStore
