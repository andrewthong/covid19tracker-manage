<template>
  <div class="container">
    <div class="row justify-content-center align-items-center">
      <div class="col-md-4">
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
              @click.prevent="userLogin"
            >
              Login
            </button>
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
      }
    }
  },
  mounted() {},
  methods: {
    async userLogin() {
      try {
        let response = await this.$auth.loginWith('local', { data: this.form })
        console.log(response)
        // if (response.data.token) {
        //   this.$auth.setUserToken(response.data.token, refreshToken);
        //   this.$router.push({name: 'reporting'});
        // }
      } catch (err) {
        console.log(err)
      }
    }
  }
}
</script>