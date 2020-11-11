<template>
  <div>
    <h2>Dashboard</h2>
    <b-button variant="dark" v-on:click="test">Refresh Token</b-button>
    <b-button variant="dark" v-on:click="test2">Test 2</b-button>
  </div>
</template>

<script>
  export default {
    middleware: 'auth',
    methods: {
      test() {
        console.log( this.$auth.refreshTokens() )
      },
      test2() {
        this.$axios.$get(`manage/user`)
          .then(response => {
            console.log(response);
          });
      }
    },
  }
</script>