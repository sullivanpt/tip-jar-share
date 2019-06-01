// TODO: unfortunately this swallows errors and they are hard to debug
// import Vue from 'vue'

// const prevErrorHandler = Vue.config.errorHandler

// /**
//  * register a global error handler
//  *
//  * TODO: catch uncaught errors in vuex dispatch
//  * TODO: maybe don't take over screen with nuxt error when caught
//  */
// Vue.config.errorHandler = function errorHandler(err, vm, info) {
//   if (vm.$store) vm.$store.commit('oops', true)
//   if (prevErrorHandler) return prevErrorHandler(err, vm, info)
// }

/**
 * this nuxt middleware enforces store is properly initialized on client side
 * in the cases where SSR API returned errors
 */
export default function(ctx) {
  if (!process.server) ctx.store.dispatch('oopsRefresh', ctx)
}
