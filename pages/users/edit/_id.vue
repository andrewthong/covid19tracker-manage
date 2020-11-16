<template>
  <div class="container">

    <b-link :to="`/users`" class="small">Back to Users</b-link>

    <h1 class="h2 my-4">Edit User</h1>

    <b-alert v-model="alert.show" v-bind:variant="alert.variant || 'info'" dismissible class="mt-3">
      {{ alert.description }}
    </b-alert>

    <div v-if="loading" class="d-flex py-4 align-items-center justify-content-center">
      <b-spinner label="Loading user info..."></b-spinner>
    </div>
    <div v-else-if="user.id">
      <userForm :user="user"/>
    </div>

  </div>
</template>

<script>
import userForm from '~/components/user-form.vue';

export default {
  middleware: 'auth',
  components: {
    userForm,
  },
  data() {
    return {
      userId: null,
      user: {},
      loading: true,
      alert: {
        show: false,
        variant: null,
        description: '',
      },
    }
  },
  created() {
    this.userId = parseInt( this.$route.params.id, 10 );
    if( this.userId ) {
      this.loadUser();
    }
  },
  methods: {
    loadUser() {
      this.$axios.get(`manage/users/${this.userId}`)
        .then(response => {
          this.user = response.data;
          this.loading = false;
          console.log(this.user);
        })
        .catch(error => {
          const response = error.response;
          this.alert.variant = 'danger';
          this.alert.show = true;
          this.alert.description = response.data.message;
          this.loading = false;
        });
    },
  },
}
</script>