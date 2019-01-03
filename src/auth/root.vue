<template lang="pug">
  div
    div.workingbox(v-if='!error')
      canvas#spinner(height='20', width='20')
      span.working Working...
    p.red(v-if='error') {{ error }}
</template>
<script>
  import qs from 'qs'
  import Auth from '../libraries/auth'
  import { Spinner } from '../libraries/types'
  import StorageAPI from '../libraries/storage'
  import Network from '../libraries/network'

  const { cleanSyncStorageAccountDuplicates } = StorageAPI
  const query = qs.parse(window.location.search, { ignoreQueryPrefix: true })

  export default {
    data: () => ({
      accountHash: query.user,
      authorizationCode: query.code,
      error: null
    }),
    computed: { },
    created () { },
    mounted () {
      if (query.error_description) this.showErrorMessage(new Error(query.error_description))

      const spinner = new Spinner(document.querySelector('#spinner'), {
        colors: {
          first: '#DFBE00',
          second: '#FCE100'
        },
        scale: 2
      })
      String(typeof spinner)

      Auth.getAccessToken(this.accountHash, this.authorizationCode)
        .then(success => {
          Auth.updateAccount(this.accountHash)
            .then(account => {
              cleanSyncStorageAccountDuplicates()
                .then(() => {
                  Network.updateCharacterCount(account.domain)
                    .then(() => {
                      window.location.href = chrome.runtime.getURL('./pages/options.html')
                    })
                    .catch(err => this.showErrorMessage(err))
                })
            })
            .catch(err => this.showErrorMessage(err))
        })
        .catch(err => this.showErrorMessage(err))
    },
    methods: {
      showErrorMessage: function (err) {
        this.error = err.message
      }
    }
  }
</script>

<style>
  body {
    font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
  }

  .workingbox {
    margin-top: 10px;
    margin-left: 10px;
    font-size: 16px;
    vertical-align: super;
  }

  .working {
    margin-left: 10px;
    font-size: 16px;
    vertical-align: super;
    margin-top: -2px;
    display: inline-block;
  }

  #spinner {
    width: 20px !important;
    height: 20px !important;
    display: block;
    float: left;
  }

  .red {
    font-size: 16px;
    color: red;
    margin: 10px 14px;
  }

  :root, html, body {
    background-color: #ECEFF1;
  }
</style>