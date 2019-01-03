/* global chrome */

import { Spinner, Action, RunningTracker } from '../libraries/types'
import StorageAPI from '../libraries/storage'

const pendings = new RunningTracker()

StorageAPI.cleanSyncStorageAccountDuplicates()
  .then(() => console.log('Cleaned duplicate accounts in storage'))

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const mthd = request.method
  const passdata = request.data
  const cases = {
    Spin: () => {
      const canvas = document.createElement('canvas')
      const spinny = new Spinner(canvas, {
        scale: 2
      })

      let interval = window.setInterval(() => {
        chrome.browserAction.setIcon({
          imageData: spinny.image
        })
      }, 10)

      pendings.push(new Action('interval', interval))
      console.log(pendings)
    },
    SendPost: async (AccountHash, status) => {
      // const accountObj = await StorageAPI.getAccountByHash(AccountHash)

    }
  }

  if (mthd && cases[mthd] != null) cases[mthd]((passdata != null ? passdata : null))
  else console.log(request)
})

// setInterval(() => {
//   const index = pendings.findIndex(action => action.type === 'interval')
//   if (index === -1) return
//   window.clearInterval(pendings[index].objectData)
//   pendings.splice(index, 1)
//   console.log('Interval stopped')
// }, 10000)
