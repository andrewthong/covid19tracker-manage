<template>
  <div class="container">
    <h2>Debug</h2>
    <p>Some utilities for debugging during development...</p>
    <b-button variant="info" v-on:click="tokenStatus">Token Status</b-button>
    <b-button variant="warning" v-on:click="refreshTokens">Refresh Tokens</b-button>
    <b-button variant="info" v-on:click="lookupUser">Lookup User</b-button>
    <b-button variant="info" v-on:click="dumpAuth">Dump Auth</b-button>
  </div>
</template>

<script>
  export default {
    middleware: 'auth',
    methods: {
      dumpAuth() {
        console.log( this.$auth );
      },
      refreshTokens() {
        console.log( this.$auth.refreshTokens() );
      },
      tokenStatus() {
        // _refresh_token.local
        // _refresh_token_expiration.local
        // _token.local
        // _token_expiration.local
        let stat = this.$auth.$storage.getUniversal('_token_expiration.local');
        console.log( stat );
      },
      lookupUser() {
        this.$axios.$get(`manage/user`)
          .then(response => {
            console.log(response);
          });
      },
    },
  }
</script>