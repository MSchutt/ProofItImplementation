<template>
  <Navbar />
  <template v-if="!isMetamaskAvailable">
    <Install />
  </template>
  <template v-else>
    <div class="container mx-auto px-8 lg:px-4 mb-8">
      <router-view></router-view>
    </div>
  </template>
</template>
<script>
import {inject} from "vue";
import Install from './components/Install.vue';
import useMetamask from "./helpers/metamask";
import Navbar from "./components/Navbar.vue";

export default {
  name: 'App',
  components: { Install, Navbar },
  setup() {
    const { isMetamaskAvailable } = useMetamask()
    const eth = inject('eth')

    return { eth, isMetamaskAvailable }
  }
}


</script>