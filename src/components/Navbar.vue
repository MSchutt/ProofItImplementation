<template>
  <div class="navbar bg-gray text-white mb-8">
    <div class="flex-1">
      <router-link to="/" class="btn btn-ghost normal-case text-xl">{{ $t('appName') }}</router-link>
    </div>
    <div class="flex-none" v-if="showMenu || isDesktop">
      <ul class="menu menu-vertical lg:menu-horizontal p-0">
        <template v-if="isMetamaskAvailable">
          <li><router-link to="/assets">{{ $t('navbar.assets') }}</router-link></li>
          <li><router-link to="/verify">{{ $t('navbar.verify') }}</router-link></li>
          <router-link to="/assets/create" class="btn btn-outline btn-md border border-white text-white ml-1">
            <svg class="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            {{ $t('assets.btnText') }}
          </router-link>
        </template>
        <template v-else>
          <li><router-link to="/install">{{ $t('navbar.install') }}</router-link></li>
        </template>
      </ul>
    </div>
    <div class="lg:hidden pr-4">
      <span @click="toggleShowMenu" class="hover:cursor-pointer">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
      </span>
    </div>
  </div>
</template>
<script>
import useMetamask from "../helpers/metamask";
import {ref} from "vue";
import {breakpointsTailwind, useBreakpoints} from "@vueuse/core";

export default {
  setup() {
    const { isMetamaskAvailable } = useMetamask()
    const breakpoints = useBreakpoints(breakpointsTailwind)

    const showMenu = ref(false)
    const toggleShowMenu = () => {
      showMenu.value = !showMenu.value
    }

    const isDesktop = breakpoints.greater('lg')

    return { isMetamaskAvailable, showMenu, toggleShowMenu, isDesktop }
  }
}
</script>