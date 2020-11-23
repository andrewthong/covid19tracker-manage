<template>
  <div class="container">
    <div class="row justify-content-center align-items-center">
      <div class="col-md-4">
        <b-alert dismissible v-model="logout" variant="warning">
          You have been logged out
        </b-alert>
        <b-card>
          <h1 class="h3">Login</h1>
          <form>
            <b-form-group
              id="input-group-1"
              label="Email address:"
              label-for="input-1"
            >
              <b-form-input
                id="input-1"
                v-model="form.email"
                type="email"
                required
              ></b-form-input>
            </b-form-group>

            <b-form-group id="input-group-3" label="Password:" label-for="input-3">
              <b-form-input
                id="input-3"
                type="password"
                v-model="form.password"
                required
              ></b-form-input>
            </b-form-group>

            <button
              type="submit"
              class="btn btn-primary btn-block"
              v-on:click.prevent="userLogin"
              v-bind:disabled="loading"
            >
              Login
            </button>
            
            <div class="d-flex justify-content-center mt-1" v-if="loading">
              <b-spinner label="Loading"></b-spinner>
            </div>

            <b-alert dismissible v-model="alert.show" :variant="alert.variant" class="mt-3 mb-0">
              <span class="small">{{ alert.description }}</span>
            </b-alert>

          </form>
        </b-card>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  middleware: 'guest',
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      loading: false,
      alert: {
        show: false,
        variant: 'danger',
        description: '',
      },
    }
  },
  mounted() {},
  methods: {
    async userLogin() {
      if( !this.form.email || !this.form.password ) {
        return;
      }
      this.alert.show = false;
      this.loading = true;
      try {
        let response = await this.$auth.loginWith('local', { data: this.form })
        console.log(response)
        this.$auth.setUser( response.data.user );
        this.$auth.setUserToken( response.data.token, response.data.refresh_token );
      } catch (err) {
        console.log(err);
        this.alert.show = true;
        this.alert.description = 'Invalid email or password';
        this.loading = false;
      }
    },
  },
  computed: {
    logout() {
      return this.$route.query.logout ? true : false
    }
  }
}
</script>