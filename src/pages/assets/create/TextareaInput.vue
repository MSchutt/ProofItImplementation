<template>
  <textarea class="block input input-bordered mt-4" @keyup="onChange">{{ item }}</textarea>
</template>
<script>
export default {
  props: {
    item: { type: String }
  },
  emits: ['update:item'],
  setup(_, { emit }) {
    const onChange = (e) => {
      emit('update:item', e.target.value)
    }
    return { onChange }
  }
}
</script>