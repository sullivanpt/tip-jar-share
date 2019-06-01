/**
 * pretty printer
 */
function log({ req, store }, ...messages) {
  const enrollLogId = store.state.me.logId
  // eslint-disable-next-line no-console
  console.log(
    `[${req ? req.logId : 'client'}/${enrollLogId}] [Axios]`,
    ...messages
  )
}

/**
 * custom axios logger. see https://axios.nuxtjs.org/extend
 * from https://github.com/nuxt-community/axios-module/blob/dev/lib/plugin.js
 */
export default function({ $axios, req, store }) {
  $axios.onRequestError(error => {
    log({ req, store }, 'Request error:', error)
  })

  $axios.onResponseError(error => {
    log({ req, store }, `Response error: ${error.toString()}`) // no stack
  })

  $axios.onResponse(res => {
    log(
      { req, store },
      '[' + (res.status + ' ' + res.statusText) + ']',
      '[' + res.config.method.toUpperCase() + ']',
      res.config.url
    )
    return res
  })
}
