export default {
  // Disable server-side rendering (https://go.nuxtjs.dev/ssr-mode)
  ssr: false,

  // Target (https://go.nuxtjs.dev/config-target)
  target: 'static',

  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: 'c19t-manager',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [
  ],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
  ],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    '@nuxtjs/auth-next',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
  ],

  auth: {
    redirect: {
      login: '/login',
      logout: '/',
      callback: '/login',
      home: '/dashboard'
    },
    strategies: {
      local: {
        scheme: 'refresh',
        token: {
          property: 'token',
          maxAge: 3600,
          // type: 'Bearer'
        },
        refreshToken: {
          property: 'refresh_token',
          data: 'refresh_token',
          maxAge: 60 * 60 * 24 * 10
        },
        user: {
          property: 'user',
          autoFetch: true
        },
        endpoints: {
          login: { url: 'manage/login', method: 'post' },
          refresh: { url: 'manage/refresh-token', method: 'post' },
          logout: { url: 'manage/logout', method: 'post' },
          user: { url: 'manage/user', method: 'get' },
        }
      },
    },
    plugins: []
  },

  // Axios module configuration (https://go.nuxtjs.dev/config-axios)
  axios: {
    baseURL: 'http://192.168.10.10/',
    withCredentials: true,
  },

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
  }
}
