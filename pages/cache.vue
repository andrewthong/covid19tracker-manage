<template>
  <div class="container">
    <h2>Cache</h2>

    <div class="row">
      <div class="col col-sm-6">
        <b-card>
          <p>This action flushes the API cache, so all cached responses will be recalculated. Use when the API is returning unexpected data. The data processing operations with automatically flush the cache.</p>
          <b-button variant="info"
            v-bind:disabled="clearing"
            v-on:click="clearCache">Clear Cache</b-button>

          <b-spinner label="Saving report" v-if="clearing"></b-spinner>

          <b-alert v-model="alert.show" v-bind:variant="alert.variant || 'info'" dismissible class="mt-3">
            <strong>{{ alert.title }}</strong> {{ alert.description }}
          </b-alert>
        </b-card>
      </div>
    </div>

  </div>
</template>

<script>
  export default {
    middleware: 'auth',
    data: function() {
      return {
        clearing: false,
        alert: {
          show: false,
          variant: 'success',
          title: 'Cache cleared',
          description: '',
        },
      }
    },
    created: function() {
      this.$amplitude.getInstance().logEvent('view_cache');
    },
    methods: {
      clearCache() {
        this.alert.show = false;
        this.clearing = true;
        this.$axios.$post(`manage/cache/clear`)
          .then(response => {
            console.log(response);
            this.alert.show = true;
            this.clearing = false;
          });
        this.$amplitude.getInstance().logEvent('clear_cache');
      },
    },
  }
</script>