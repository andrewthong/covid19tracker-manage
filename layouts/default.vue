<template>
  <div>
    <div class="mb-3">
      <b-navbar toggleable="lg" type="dark" variant="primary">
        <b-link :to="{name: 'index'}" class="text-light font-weight-bold">C19T Manage v2</b-link>

        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

        <b-collapse id="nav-collapse" is-nav>

          <b-navbar-nav v-if="isLoggedIn" class="pl-3">
            <b-nav-item :to="{name: 'dashboard'}">Dashboard</b-nav-item>
            <b-nav-item :to="{name: 'reporting'}">Reporting</b-nav-item>
          </b-navbar-nav>

          <b-navbar-nav class="ml-auto">
            <b-dropdown v-if="isLoggedIn"
                        v-bind:text="userName"
                        variant="light"
                        size="sm"
                        right>
              <b-dropdown-item href="#" @click="logout">Logout</b-dropdown-item>
            </b-dropdown>
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
      },
      userName() {
        return this.$auth.user.name ? this.$auth.user.name : 'User';
      },
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