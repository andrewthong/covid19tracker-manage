<template>
  <div class="container">

    <h1 class="h2 mb-4">Add User</h1>

    <b-form @submit="addUser()">

      <b-form-group label="Name" label-for="input-name">
        <b-form-input id="input-name" v-model="user.name" trim></b-form-input>
      </b-form-group>

      <b-form-group label="Email" label-for="input-email">
        <b-form-input id="input-email" type="email" v-model="user.email" trim></b-form-input>
      </b-form-group>

    </b-form>

  </div>
</template>

<script>
export default {
  middleware: 'auth',
  data() {
    return {
      user: {}
    }
  },
  created() {
    
  },
  methods: {
    addUser() {
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