<template>
  <div class="container">

    <div class="d-flex align-items-center justify-content-between mb-4">
      <h1 class="h2">Users</h1>
      <b-button :to="{name: 'users/add'}" variant="primary">Add User</b-button>
    </div>
    
    <b-table-simple table-class="mb-4">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Provinces</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(user, index) in users" :key="index">
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td></td>
        </tr>
      </tbody>
    </b-table-simple>
    <p class="small text-muted font-italic">*only editors are shown</p>
  </div>
</template>

<script>
export default {
  middleware: 'auth',
  data() {
    return {
      users: []
    }
  },
  created() {
    this.loadUsers();
  },
  methods: {
    loadUsers() {
      this.$axios.$get(`manage/users`)
        .then(response => {
          this.users = response;
        });
    },
  },
}
</script>

<style>
</style>