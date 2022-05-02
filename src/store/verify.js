import {defineStore} from "pinia";
import {ethers} from "ethers";

export const useVerifyStore = defineStore('verify', {
    state: () => {
        return {
            loading: false,
            error: null,
            result: null,
            qrCode: null
        }
    },
    actions: {
        async generateVerifyQRText(eth, id) {
            await eth.init()
            this.resetQRCode()

            const signer = await eth.signer.getAddress()

            const coded = { asset: id, owner: signer }

            this.qrCode = JSON.stringify(coded)
        },
        resetQRCode() {
            this.qrCode = ''
            this.result = null
        },
        async checkVerification(eth, asset, owner) {
            await eth.init()

            this.loading = true
            try {
                const result = await eth.contract.isOwnerOfInsecure(ethers.utils.toUtf8Bytes(asset), ethers.utils.getAddress(owner))
                this.result = { secure: false, result }
                await this.loadVerification(eth, asset, owner)
            } catch (err) {
                console.error(err)
                this.result = { secure: false, result: false}
                this.error = err
            } finally {
                this.loading = false
            }
        },
        async loadVerification(eth, asset, owner) {
            await eth.init()

            this.loading = true
            try {
                const signerAddress = await eth.signer.getAddress()
                const result = await eth.contract.isOwnerOf(ethers.utils.toUtf8Bytes(asset), ethers.utils.getAddress(owner), signerAddress)
                if (result) {
                    this.result = { secure: true, result}
                }
            } catch (err) {
                console.error(err)
                this.error = err
            } finally {
                this.loading = false
            }
        }
    }
})