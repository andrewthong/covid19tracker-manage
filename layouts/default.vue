<template>
  <div>
    <div class="mb-3">
      <b-navbar toggleable="lg" type="dark" variant="primary">
        <div class="d-flex flex-column align-items-start small">
        <b-link :to="{name: 'index'}" class="nav-link h6 p-0 m-0 text-light font-weight-bold">C19T Manage</b-link>
        <b-badge :variant="envVariant" class="text-uppercase">{{ envLabel }}</b-badge>
        </div>

        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

        <b-collapse id="nav-collapse" is-nav>

          <b-navbar-nav v-if="isLoggedIn" class="pl-3">
            <b-nav-item :to="{name: 'reporting'}" link-classes="text-light">Reporting</b-nav-item>
          </b-navbar-nav>

          <b-navbar-nav class="ml-auto">
            <b-nav-item-dropdown v-if="isLoggedIn"
                                 toggle-class="rounded bg-light text-dark text-capitalize small"
                                 menu-class="user-menu"
                                 right>
              <template #button-content>
                <span><b-icon icon="person-circle" /> {{ userName }}</span>
              </template>
              <b-dropdown-item :to="{name: 'debug'}">Debug</b-dropdown-item>
              <b-dropdown-divider></b-dropdown-divider>
              <b-dropdown-item href="#" @click="logout">Logout</b-dropdown-item>
            </b-nav-item-dropdown>
            <b-nav-item :to="{name: 'login'}" v-else>Login</b-nav-item>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
    </div>
    <nuxt/>
    <footer class="mt-3 pt-3">
      <div class="container-fluid">
        <p class="small text-muted">
          <b-link href="https://covid19tracker.ca/" class="text-muted" target="_blank">COVID19Tracker.ca</b-link> Project
        </p>
      </div>
    </footer>
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
      envLabel() {
        return this.$config.appEnv;
      },
      envVariant() {
        return this.$config.appEnv === 'production' ? 'dark' : 'light';
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

  ul.user-menu {
    font-size: 0.875rem;
  }
</style>