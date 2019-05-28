/**
 * users is a simple cache by user.id
 * depends on other stores to fill and flush it
 */
export const state = () => ({
  users: {
    // expects form from API userPublic
    // [user.id]: {
    //   id: 'abc-123',
    //   name: 'jane doe',
    //   avatar: 'https://image.com/janedoe'
    // }
  }
})

export const mutations = {
  /**
   * clear any data
   */
  expel(state) {
    state.users = {}
  },
  /**
   * add or update one or more users
   */
  add(state, users) {
    users.forEach(user => {
      if (!user.id) return // should not happen
      state.users[user.id] = user
    })
  }
}
