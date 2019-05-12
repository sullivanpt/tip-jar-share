/**
 * generate logId
 * TODO: use hash sessin cookie (token) if available
 */
export default function captureLogId(req, res, next) {
  req.logId = (Math.random() + 1).toString(36).substr(2, 5) // http://stackoverflow.com/a/8084248
  next()
}
