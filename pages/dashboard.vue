<template>
  <div>
    <h2>Dashboard</h2>
    <b-button variant="dark" v-on:click="test">Test</b-button>
  </div>
</template>

<script>
  export default {
    middleware: 'auth',
    methods: {
      test() {
        console.log(this.$auth)
      },
    },
  }
</script>