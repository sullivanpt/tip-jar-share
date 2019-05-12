import gravatarUrl from 'gravatar-url'

export function buildGravatarUrl(email) {
  if (!email) return
  try {
    return gravatarUrl(email)
  } catch (e) {}
}
