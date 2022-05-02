import {computed} from "vue";

function useMetamask() {
    const isMetamaskAvailable = computed(() => window.ethereum && window.ethereum.isMetaMask)

    return { isMetamaskAvailable }
}

export default useMetamask