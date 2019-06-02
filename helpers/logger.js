/**
 * pretty printer
 * const log = logger('Axios')
 * log(ctx, 'something happened')
 */
export function logger(category) {
  return function log({ req, store }, ...messages) {
    const enrollLogId = store ? store.state.me.logId : null
    const logId = req ? req.logId : 'client'
    // eslint-disable-next-line no-console
    console.log(`[${logId}/${enrollLogId}] [${category}]`, ...messages)
  }
}
