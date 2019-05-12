import md5Hex from 'md5-hex'

/**
 * from https://github.com/mohitmayank/email-mask/blob/master/index.js
 */
export function emailMask(email, mask = '*') {
  if (!email) return email
  return email.replace(/^(.)(.*)(.@.*)$/, function(_, a, b, c) {
    return a + b.replace(/./g, mask) + c
  })
}

/**
 * from https://github.com/sindresorhus/gravatar-url/blob/master/index.js
 */
export function emailHash(email) {
  if (!email) return email
  return md5Hex(email.toLowerCase().trim())
}
