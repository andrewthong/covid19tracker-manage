<template>
  <div class="container">

    <h1 class="h2 mb-4">Add User</h1>

    <userForm/>

  </div>
</template>

<script>
import userForm from '~/components/user-form.vue';

export default {
  middleware: [
    'auth',
    'admin',
  ],
  components: {
    userForm,
  },
  data() {
    return {
    }
  },
  created() {
  },
  methods: {}
}
</script>

<style>
</style>