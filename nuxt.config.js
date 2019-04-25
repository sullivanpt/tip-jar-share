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
    redirectSSL.create({})
  ],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: ['@/plugins/vuetify'],

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
   ** auth module
   */
  auth: {
    strategies: {
      google: {
        client_id: GOOGLE_CLIENT_ID
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
