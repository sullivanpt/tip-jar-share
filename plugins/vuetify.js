import Vue from 'vue'
import Vuetify from 'vuetify/lib'
// import colors from 'vuetify/es5/util/colors' -- saves 30kb

Vue.use(Vuetify, {
  theme: {
    primary: '#4DD0E1' // colors.cyan.lighten2
    // default values:
    // primary: colors.blue.darken2,
    // accent: colors.grey.darken3,
    // secondary: colors.amber.darken3,
    // info: colors.teal.lighten1,
    // warning: colors.amber.base,
    // error: colors.deepOrange.accent4,
    // success: colors.green.accent3
  }
})
