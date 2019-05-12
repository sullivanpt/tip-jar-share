/**
 * helpers for API access
 */
export default ({ store }, inject) => {
  function apiAxios(resource, { method, params = {}, data } = {}) {
    if (!method) method = data ? 'post' : 'get'
    return store.$axios
      .request({
        method,
        url: `/api${resource}`,
        params,
        data
      })
      .then(response => response.data)
  }

  // This makes available 'store.$api.getSessionSettings' etc.
  inject('api', {
    /**
     * extract authenticated (google) user info from token
     * and create new user record if it does not exist
     */
    meEnroll(data) {
      return apiAxios('/me/enroll', { data })
    },
    meReset(data) {
      return apiAxios('/me/reset', { data })
    },
    meUpdate(data) {
      return apiAxios('/me/update', { data })
    },
    modelsReset(data) {
      return apiAxios('/models/reset', { data })
    }
  })
}
