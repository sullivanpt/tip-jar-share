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
    },
    allRefresh() {
      return apiAxios('/all/refresh')
    },
    formulaAllocationCreate(data) {
      return apiAxios('/formulas/allocations/create', { data })
    },
    formulaAllocationUpdate(data) {
      return apiAxios('/formulas/allocations/update', { data })
    },
    formulaAllocationDelete(data) {
      return apiAxios('/formulas/allocations/delete', { data })
    },
    organizationCreate(data) {
      return apiAxios('/organizations/create', { data })
    },
    organizationUpdate(data) {
      return apiAxios('/organizations/update', { data })
    },
    organizationDelete(data) {
      return apiAxios('/organizations/delete', { data })
    },
    organizationJoin(data) {
      return apiAxios('/organizations/join', { data })
    },
    organizationStationCreate(data) {
      return apiAxios('/organizations/stations/create', { data })
    },
    organizationStationUpdate(data) {
      return apiAxios('/organizations/stations/update', { data })
    },
    organizationStationDelete(data) {
      return apiAxios('/organizations/stations/delete', { data })
    },
    organizationMemberCreate(data) {
      return apiAxios('/organizations/members/create', { data })
    },
    organizationMemberUpdate(data) {
      return apiAxios('/organizations/members/update', { data })
    },
    reportCreate(data) {
      return apiAxios('/reports/create', { data })
    },
    reportUpdate(data) {
      return apiAxios('/reports/update', { data })
    },
    reportDelete(data) {
      return apiAxios('/reports/delete', { data })
    },
    reportCollectionUpdate(data) {
      return apiAxios('/reports/collections/update', { data })
    },
    reportReporterUpdate(data) {
      return apiAxios('/reports/reporters/update', { data })
    }
  })
}
