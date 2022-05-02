import {ethers} from "ethers";
import {reactive, ref} from 'vue';
import ProofIt from "../artifacts/contracts/ProofIt.sol/ProofIt.json";
import config from "../plugins/config";

/*
Singleton Ethereum Class which handles initialization and stores data about the owner
 */
class Ethereum {
    static _instance = null;

    constructor() {
        if (Ethereum._instance) {
            return Ethereum._instance
        }
        Ethereum._instance = this;
        this.account = null
        this.provider = null
        this.signer = null
        this.contract = null
        this.balance = reactive({ value: -1 })
        this.isInitialized = reactive({ value: false })
        this.error = null
    }

    async init() {
        try {
            if (this.isInitialized?.value) {
                return;
            }
            const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            this.account = account
            this.provider = provider
            this.signer = this.provider.getSigner()
            this.contract = new ethers.Contract(config.CONTRACT_ADDRESS, ProofIt.abi, this.signer);
            this.isInitialized.value = true
            const balance = await this.provider.getBalance(account);
            this.balance.value = ethers.utils.formatEther(balance);
            console.log('Successfully initialized Ethereum', this.contract, this.signer, this.balance);
        } catch (err) {
            this.error = err
            console.error('Something went wrong while initializing ethereum', err)
        }
    }
}

export default Ethereum