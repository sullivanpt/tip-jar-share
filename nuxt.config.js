import dotenv from 'dotenv'
import redirectSSL from 'redirect-ssl'
import webpack from 'webpack'
import VuetifyLoaderPlugin from 'vuetify-loader/lib/plugin'
import pkg from './package'

// read .env file if present. https://www.npmjs.com/package/@nuxtjs/dotenv
dotenv.config()

// eslint-disable-next-line nuxt/no-cjs-in-config
const version = require('./static/version.json') // built 'npm run version'

// client_id for google OAuth2
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID

export default {
  modern: true,

  /*
   ** Headers of the page
   */
  head: {
    title: pkg.name,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons'
      }
    ]
  },

  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },

  /*
   ** Global CSS
   */
  css: ['~/assets/style/app.styl'],

  /*
   ** connect server middleware, not to be confused with nuxt middleware
   */
  serverMiddleware: [
    // force redirect to SSL in production mode
    redirectSSL.create({}),
    // attach req.logId for logger
    '~/server-middleware/capture-log-id',
    // API route handler
    { path: '/api', handler: '~/server-middleware/api/index.js' }
  ],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: ['@/plugins/vuetify', '~/plugins/api'],

  /*
   ** Nuxt.js modules
   */
  modules: [
    '@nuxtjs/dotenv',
    '@nuxtjs/pwa',
    '@nuxtjs/axios',
    '@nuxtjs/auth',
    '@nuxtjs/markdownit'
  ],

  /*
   ** proxy mode needed for heroku, else browserBaseURL/API_URL_BROWSER
   */
  axios: {
    proxy: true
  },

  /*
   ** auth module
   */
  auth: {
    // resetOnError: true, // TODO: there's still an issue with expired tokens and the avatar
    plugins: ['~/plugins/me.js'],
    redirect: {
      login: '/me/login', // where non-auth users redirect to from protected pages
      logout: '/me/login', // no dedicated "you havse logged out" page
      callback: '/me/enroll', // create local user on return from social login
      home: '/' // our "home" is only for authenticated users
    },
    localStorage: false, // localStorage is not compatible with SSR
    strategies: {
      local: false, // avoid setStrategy causing fetchUser with expired token
      google: {
        client_id: GOOGLE_CLIENT_ID // https://console.developers.google.com/apis/dashboard?project=tip-jar-share
      }
    }
  },

  /*
   ** router config, all routes require auth by default
   */
  router: {
    middleware: ['auth']
  },

  /*
   ** Build configuration
   */
  build: {
    transpile: ['vuetify/lib'],
    plugins: [
      new VuetifyLoaderPlugin(),
      // Example '1.5.0+a1b2c3d4e5'. See https://stackoverflow.com/a/38401256
      new webpack.DefinePlugin({
        __GIT_REPO_VERSION__: JSON.stringify(version.revision)
      })
    ],
    loaders: {
      stylus: {
        import: ['~assets/style/variables.styl']
      }
    },
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
