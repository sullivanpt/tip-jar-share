export function userOptionFindById(store, userId) {
  const user = store.state.users.users[userId]
  const text = (user && user.name) || `#${userId}`
  const avatar = (user && user.avatar) || null
  return {
    text,
    avatar
  }
}
