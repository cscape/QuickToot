import axios from 'axios'
import Utilities from './utilities'
import StorageAPI from './storage'

const Network = {
  updateCharacterCount: (domainHost) => {
    return new Promise((resolve, reject) => {
      StorageAPI.getAppsStorage()
        .then(appsHashTable => {
          let apps = appsHashTable
          axios.get(`https://${domainHost}/api/v1/instance`)
            .then(response => {
              const { data } = response
              let characterCount = 500
              if (data.max_toot_chars != null) characterCount = data.max_toot_chars

              apps[domainHost].character_count = characterCount
              StorageAPI.saveApps(apps)
                .then(() => resolve(characterCount))
            })
            .catch(err => {
              reject(err)
            })
        })
    })
  },
  cacheImage: (hash, type, URL) => {
    return new Promise((resolve, reject) => {
      axios.get(URL, { responseType: 'blob' })
        .then(response => {
          const blob = response.data
          Utilities.blobToDataURI(blob)
            .then(dataURI => {
              StorageAPI.saveNewCacheItem(hash, type, dataURI)
                .then(() => resolve(dataURI))
            })
        })
        .catch(err => reject(err))
    })
  }
}

export default Network
