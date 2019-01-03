/* global chrome */

import Filters from './filters'
import Network from './network'

export const StorageAPI = {
  removeAccount: (accountHash) => {
    return new Promise((resolve, reject) => {
      StorageAPI.getAccountStorage()
        .then(accs => {
          let accounts = accs
          delete accounts[accountHash]
          StorageAPI.saveAccounts(accounts)
            .then(() => resolve(accounts))
            .catch(err => reject(err))
        })
    })
  },
  resetAccountStorage: () => {
    return new Promise((resolve, reject) => {
      StorageAPI.saveAccounts(null)
        .then(() => resolve(true))
    })
  },

  getAccountStorage: () => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get('accounts', accountsHashTable => {
        if (!accountsHashTable.accounts) {
          chrome.storage.sync.set({ accounts: {} }, () => {
            resolve({})
          })
        } else {
          let filteredAccounts = accountsHashTable.accounts
          filteredAccounts = Filters.removeStorageAccountDuplicates(filteredAccounts)
          resolve(filteredAccounts)
        }
      })
    })
  },

  getAccountByHash: async (hash) => {
    const accountsHashTable = await StorageAPI.getAccountStorage()
    return accountsHashTable[hash]
  },

  getAppsStorage: () => {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get('apps', appsHashTable => {
        if (!appsHashTable.apps) {
          chrome.storage.sync.set({ apps: {} }, () => {
            resolve({})
          })
        } else {
          resolve(appsHashTable.apps)
        }
      })
    })
  },

  getClientFromDomain: (domainHost) => {
    return new Promise((resolve, reject) => {
      StorageAPI.getAppsStorage()
        .then(appsHashTable => {
          const client = Filters.appByDomainObject(appsHashTable[domainHost])
          if (client == null) reject(new Error(`${domainHost} has no known client information.`))
          resolve(client)
        })
    })
  },

  saveAccounts: (hashTable) => {
    return new Promise((resolve) => chrome.storage.local.set({ accounts: hashTable }, () => resolve(true)))
  },

  saveApps: (hashTable) => {
    return new Promise((resolve) => chrome.storage.sync.set({ apps: hashTable }, () => resolve(true)))
  },

  // Cleans storage account duplicates, returns filtered accounts
  cleanSyncStorageAccountDuplicates: () => {
    return new Promise((resolve, reject) => {
      StorageAPI.getAccountStorage()
        .then(accountsHashTable => {
          const accounts = Filters.removeStorageAccountDuplicates(accountsHashTable)
          StorageAPI.saveAccounts(accounts)
            .then(() => resolve(accounts))
        })
    })
  },

  saveNewCacheItem: (hash, type, data) => {
    return new Promise(resolve => {
      chrome.storage.local.set({
        cache: {
          [`${type}-${hash}`]: data
        }
      }, () => resolve(true))
    })
  },

  getCachedImage: (hash, type, URL) => {
    return new Promise(resolve => {
      const cacheQuery = `cache.${type}-${hash}`
      chrome.storage.local.get(cacheQuery, cachedItemParent => {
        if (cachedItemParent[cacheQuery] == null) {
          Network.cacheImage(hash, type, URL)
            .then(dataURI => {
              resolve(dataURI)
            })
        } else {
          resolve(cachedItemParent[cacheQuery])
        }
      })
    })
  },

  clearCachedImage: (hash, type) => {
    return new Promise(resolve => {
      chrome.storage.local.remove(`cache.${type}.${hash}`, () => resolve(true))
    })
  }
}

export default StorageAPI
