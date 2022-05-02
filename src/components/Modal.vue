<template>
  <div class="modal opacity-100 visible pointer-events-auto">
    <div class="modal-box w-11/12 max-w-5xl">
      <h3 v-if="title" v-html="title" class="font-bold text-lg"></h3>
      <slot v-else name="title"></slot>
      <p v-if="content" v-html="content" class="py-4"></p>
      <slot v-else name="content"></slot>
      <div class="modal-action">
        <template v-if="mappedButtons.length > 0">
          <button v-for="(elem, i) in mappedButtons" :key="i" @click.prevent="elem.onClick($event)" :class="`btn hover:cursor-pointer z-1000 btn-${elem.color}`">{{ elem.label }}</button>
        </template>
        <template v-else>
          <slot name="buttonRow"></slot>
        </template>
      </div>
    </div>
  </div>
</template>
<script>
import {computed} from "vue";

export default {
  props: {
    title: {
      type: String
    },
    content: {
      type: String
    },
    buttons: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'ok'],
  setup(props, { emit }) {
    const defaultEvents = {
      close: () => emit('close'),
      ok: () => emit('ok')
    }
    const mappedButtons = computed(() => {
      return props.buttons.map(button => {
        return {
          label: button.label,
          onClick: defaultEvents[button.onClick] ? defaultEvents[button.onClick] : button.onClick,
          color: button.color
        };
      });
    })

    return { mappedButtons }
  }
}
</script>