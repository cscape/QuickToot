const Filters = {
  currentUserObject: (userBeforeFiltering) => {
    const propertiesToKeep = [
      'avatar', 'avatar_static', 'display_name', 'emojis', 'header',
      'header_static', 'locked', 'source', 'url', 'username'
    ]
    let user = {}
    for (let key in userBeforeFiltering) {
      if (propertiesToKeep.indexOf(key) === -1) continue
      user[key] = userBeforeFiltering[key]
    }
    return user
  },
  // eslint-disable-next-line camelcase
  accountTokenObject: ({ access_token, created_at }) => {
    return { access_token, created_at }
  },
  appByDomainObject: (client) => {
    /* eslint-disable */
    const { client_id, client_secret } = client
    let character_count = null
    if (client.character_count != null) character_count = client.character_count
    return { client_id, client_secret, character_count }
    /* eslint-enable */
  },
  removeStorageAccountDuplicates: (accountsHashTable) => {
    let accountsAsArray = []

    for (let accountHash in accountsHashTable) {
      // converts hashtable to array of accounts
      accountsAsArray.push(accountsHashTable[accountHash])
    }

    // sorts array of accounts into descending order by token creation time
    const accountsAsArrayDescendingByTokenCreationTime = accountsAsArray.sort((a, b) => {
      const c = b.token != null ? b.token.created_at : 0
      const d = a.token != null ? a.token.created_at : 0
      return c - d
    })

    // filters out duplicate accounts by checking for multiple same username + domain
    const filteredAccountsWithNoDuplicates = accountsAsArrayDescendingByTokenCreationTime.filter((account, index) => {
      if (account.token == null || account.account == null) return true
      const latestAccountWithSameToken = accountsAsArrayDescendingByTokenCreationTime.findIndex(accountObj => {
        if (accountObj.token == null || accountObj.account == null) return false
        return ((account.account.username === accountObj.account.username && account.domain === accountObj.domain) ||
          (account.token.access_token === accountObj.token.access_token))
      })
      return (latestAccountWithSameToken === index)
    })

    let filteredAccountsAsHashTable = {}
    filteredAccountsWithNoDuplicates.forEach(account => {
      const accountHash = account.accountHash
      filteredAccountsAsHashTable[accountHash] = account
    })
    return filteredAccountsAsHashTable
  }
}

export default Filters
