/* global chrome */

import axios from 'axios'
import normalizeUrl from 'normalize-url'
import qs from 'qs'
import Filters from './filters'
import StorageAPI from './storage'
import { Account } from './types'

const { getAccountStorage, getAppsStorage, getClientFromDomain } = StorageAPI

const clientName = 'QuickToot by Cyberscape'
const clientSite = 'https://github.com/cscape/quicktoot'
const clientScope = [
  'write:accounts', 'write:statuses', 'read:accounts'
].join(' ')

const Auth = {
  getAuthorizationCode: (domainBeforeNormalizing) => {
    const domain = normalizeUrl(domainBeforeNormalizing, {
      defaultProtocol: 'https:',
      forceHttps: true,
      removeTrailingSlash: true
    })
    const domainHost = (new URL(domain)).hostname

    return new Promise((resolve, reject) => {
      const user = new Account(domainHost)
      const options = qs.stringify({
        client_name: clientName,
        redirect_uris: chrome.runtime.getURL('./pages/auth.html'),
        scopes: clientScope,
        website: clientSite
      })

      const resolveAuthCode = (client) => {
        getAccountStorage()
          .then(accountsHashTable => {
            let accounts = accountsHashTable
            let accountHash = user.accountHash
            accounts[accountHash] = user
            // saves account data to local storage
            chrome.storage.local.set({ accounts }, () => {
              resolve(`${domain}/oauth/authorize?` + qs.stringify({
                client_id: client.client_id,
                response_type: 'code',
                redirect_uri: `${chrome.runtime.getURL('./pages/auth.html')}?user=${accountHash}`,
                scope: clientScope
              }))
            })
          })
      }

      getAppsStorage()
        .then(appsHashTable => {
          let apps = appsHashTable
          if (apps[domainHost] == null) {
            axios.post(`${domain}/api/v1/apps`, options)
              .then(response => {
                let clientData = Filters.appByDomainObject(response.data)
                apps[domainHost] = clientData // adds client uniquely per domain
                chrome.storage.sync.set({ apps }, () => {
                  resolveAuthCode(clientData, user)
                })
              })
              .catch(err => reject(err))
          } else {
            resolveAuthCode(Filters.appByDomainObject(apps[domainHost]), user)
          }
        })
    })
  },

  // Add a hash to each new account stored in chrome's storage
  // Reference those accounts by hash, not by username@domain
  removeAccountByHash: (accountHash) => {
    return new Promise((resolve, reject) => {
      getAccountStorage()
        .then(accountsHashTable => {
          let accounts = accountsHashTable
          delete accounts[accountHash]
          chrome.storage.local.set({ accounts }, () => resolve(true))
        })
    })
  },

  getAccessToken: (accountHash, authorizationCode) => {
    return new Promise((resolve, reject) => {
      getAccountStorage()
        .then(accountsHashTable => {
          const user = accountsHashTable[accountHash]
          if (user == null) reject(new Error('User not found, cannot authenticate'))

          getClientFromDomain(user.domain)
            .then(client => {
              const domain = normalizeUrl(user.domain, {
                defaultProtocol: 'https:',
                forceHttps: true,
                removeTrailingSlash: true
              })

              const options = qs.stringify({
                grant_type: 'authorization_code',
                redirect_uri: `${chrome.runtime.getURL('./pages/auth.html')}?user=${accountHash}`,
                client_id: client.client_id,
                client_secret: client.client_secret,
                code: authorizationCode
              })

              axios.post(`${domain}/oauth/token`, options)
                .then(response => {
                  let tokenObj = Filters.accountTokenObject(response.data)

                  let accounts = accountsHashTable
                  accounts[accountHash].token = tokenObj
                  accounts[accountHash].ok = true
                  chrome.storage.local.set({ accounts }, () => resolve(true))
                })
                .catch(err => {
                  let accounts = accountsHashTable
                  accounts[accountHash].ok = false
                  chrome.storage.local.set({ accounts }, () => reject(err))
                })
            })
        })
    })
  },

  authenticatedRequest: (accountHash, path, data = null, method = 'GET') => {
    return new Promise((resolve, reject) => {
      getAccountStorage()
        .then(accountsHashTable => {
          const user = accountsHashTable[accountHash]
          let accounts = accountsHashTable
          if (user == null) {
            chrome.storage.local.set({ accounts }, () => {
              reject(new Error('User not found, cannot authenticate'))
            })
          } else {
            getClientFromDomain(user.domain)
              .then(client => {
                const url = normalizeUrl(user.domain, {
                  defaultProtocol: 'https:',
                  forceHttps: true,
                  removeTrailingSlash: true
                }) + path

                axios({
                  method,
                  data,
                  url,
                  headers: { 'Authorization': `Bearer ${user.token.access_token}` }
                })
                  .then(response => {
                    resolve(response.data)
                  })
                  .catch(err => reject(err))
              })
          }
        })
    })
  },

  updateAccount: (accountHash) => {
    return new Promise((resolve, reject) => {
      Auth.authenticatedRequest(accountHash, '/api/v1/accounts/verify_credentials')
        .then(data => {
          getAccountStorage()
            .then(accountsHashTable => {
              const user = accountsHashTable[accountHash]
              let accounts = accountsHashTable
              if (user == null) {
                chrome.storage.local.set({ accounts }, () => {
                  reject(new Error('User not found, cannot refresh'))
                })
              } else {
                accounts[accountHash].account = Filters.currentUserObject(data)
                accounts[accountHash].ok = true
                chrome.storage.local.set({ accounts }, () => resolve(accounts[accountHash]))
              }
            })
        })
        .catch(err => {
          getAccountStorage()
            .then(accountsHashTable => {
              const user = accountsHashTable[accountHash]
              let accounts = accountsHashTable
              if (user == null) chrome.storage.local.set({ accounts }, () => reject(new Error('User not found, cannot refresh')))
              else {
                let accounts = accountsHashTable
                accounts[accountHash].ok = false
                chrome.storage.local.set({ accounts }, () => reject(err))
              }
            })
        })
    })
  }
}

export default Auth
