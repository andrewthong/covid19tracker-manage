<template>
  <div class="container">

    <h2 class="mb-3">Processing</h2>

    <p>Queue information as of {{ lastUpdated }} <b-button variant="secondary" size="sm" v-on:click="getStatus()">Refresh</b-button></p>

    <div v-for="(group, index) in status" v-bind:key="index" class="mb-5">

      <h3 class="h4">{{group.title}}</h3>
      <b-table-simple striped bordered small>
        <b-thead>
          <b-tr>
            <b-th>ID</b-th>
            <b-th>Province</b-th>
            <b-th>Report Date</b-th>
            <b-th>Created at</b-th>
            <b-th>Updated at</b-th>
          </b-tr>
        </b-thead>
        <b-tbody>
          <b-tr v-if="loading">
            <b-td colspan="5" class="text-center">
              <b-spinner label="Loading data"></b-spinner>
            </b-td>
          </b-tr>
          <b-tr v-for="item in group.data" v-bind:key="item.id">
            <b-td>{{ item.id }}</b-td>
            <b-td>{{ item.province }}</b-td>
            <b-td>{{ item.date }}</b-td>
            <b-td>{{ item.created_at | at }}</b-td>
            <b-td>{{ item.updated_at | at }}</b-td>
          </b-tr>
        </b-tbody>
      </b-table-simple>

    </div>

  </div>
</template>

<script>
  export default {
    middleware: 'auth',
    data: function() {
      return {
        loading: true,
        lastUpdated: null,
        tzOffset: null,
        status: {
          waiting: {
            title: 'Waiting for Next Run',
            data: null,
          },
          processed: {
            title: 'Recently Processed',
            data: null,
          },
        },
      }
    },
    created: function() {
      this.getStatus();
      this.tzOffset = (new Date()).getTimezoneOffset() * 60000;
    },
    methods: {
      getStatus() {
        this.loading = true;
        this.status.waiting.data = [];
        this.status.processed.data = [];
        this.$axios.$get(`manage/queue`)
          .then(response => {
            this.status.waiting.data = response.waiting;
            this.status.processed.data = response.processed;
            this.loading = false;
            this.lastUpdated = (new Date(Date.now() - this.tzOffset)).toISOString().slice(0, -5).replace('T', ' ')
          });
      },
    },
    filters: {
      at: function(value) {
        if (!value) return '';
        value = value.toString();
        return value.slice(0, -8).replace('T', ' ');
      }
    },
  }
</script>