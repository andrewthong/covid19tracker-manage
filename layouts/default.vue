<template>
  <div>
    <div class="mb-3">
      <b-navbar toggleable="lg" type="dark" variant="dark">
        <b-link :to="{name: 'index'}" class="text-light font-weight-bold">C19T Manage v2</b-link>

        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

        <b-collapse id="nav-collapse" is-nav>

          <b-navbar-nav v-if="isLoggedIn" class="pl-3">
            <b-nav-item :to="{name: 'reporting'}">Reporting</b-nav-item>
          </b-navbar-nav>

          <b-navbar-nav class="ml-auto">
            <b-nav-item href="#" right @click="logout"  v-if="isLoggedIn">Logout</b-nav-item>
            <b-nav-item :to="{name: 'login'}" v-else>Login</b-nav-item>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
    </div>
    <nuxt/>
  </div>
</template>

<script>
  export default {
    computed: {
      isLoggedIn() {
        return this.$auth.loggedIn;
      }
    },

    methods: {
      async logout() {
        await this.$auth.logout();
      }
    }
  }
</script>

<style>
  body {
    background: #f8f9fa;
  }
</style>