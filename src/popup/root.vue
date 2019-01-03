<template lang="pug">
  div.postbox-container
    .container-fluid.bg-dark.text-white
      small.text-uppercase QuickToot by Cyberscape
    .container-fluid(v-if='accounts.length >= 1')
      .accounts-deck.row.px-2.pb-2
        .account-chip.d-block.col-auto.px-2.pt-2(v-for='(account, $index) in accounts', :key='account.accountHash', v-if='account.account')
          a.mx-auto.d-block.position-relative(:href='account.account.url', :title='`@${account.account.username}@${account.domain}`',
            v-on:click='toggleAccount($index)')
            .avatar-wrapper.position-relative
              img.avatar-main.rounded-circle.d-block(:src='account.account.avatar', height='32', width='32')
            .account-checkmark(v-show='selectedAccountsIndices[$index]')
              img.d-block(src='/app-icons/check-circle.svg', height='16', width='16')
      .new-post.row
        .compose-box-pad
          textarea.composer-box-textarea(placeholder='What’s on your mind?' v-model='TextAreaRawInput')
      .submit-post
        button.btn.btn-lg(:disabled='okToSendPost === false' v-on:click='sendPost') > send toot
    .container-fluid.no-accounts-available(v-if='accounts.length <= 0')
      p Add an account via the options page
</template>

<script>
import Auth from '../libraries/auth'
import Status from '../libraries/statuses'

export default {
  data: () => ({
    accounts: [], // [{account 1}, {second account}, {3rd account}]
    selectedAccountsIndices: [], // [true, false, false] = first account selected
    TextAreaRawInput: '',
    PostVisibility: 'public'
  }),
  computed: {
    selectedAccounts () {
      // only selected accounts returned, with full account objects in array
      return this.accounts.filter((a, i) => this.selectedAccountsIndices[i])
    },
    okToSendPost () {
      // all must be true to return true, else returns false
      const Requirements = [
        String(this.TextAreaRawInput).trim().length > 0,
        this.selectedAccounts.length > 0
      ]

      for (let i = 0; i < Requirements.length; i++) {
        if (Requirements[i] === true) continue
        return false
      }
      return true
    }
  },
  created () { },
  mounted () {
    chrome.storage.local.get('accounts', a => {
      let accountsAsArray = []
      for (let key in a.accounts) {
        accountsAsArray.push(a.accounts[key])
        this.selectedAccountsIndices.push(false)
      }
      this.accounts = accountsAsArray
      // todo: load avatars from cache, not directly
    })
  },
  methods: {
    makePost () {
      return [null].push(Auth).pop() // todo
    },
    toggleAccount (index) {
      this.selectedAccountsIndices.splice(index, 1, !this.selectedAccountsIndices[index])
    },
    tab () {
      chrome.runtime.sendMessage({ method: 'Spin' }, () => {})
    },
    sendPost () {
      if (this.okToSendPost === false) return
      const text = this.TextAreaRawInput
      const status = new Status(text)
      chrome.runtime.sendMessage({ method: 'SendPost', data: { status } })
    }
  }
}
</script>

<style lang="scss">
  :root, html, body {
    width: 16rem;
  }

  .postbox-container {
    font-size: 14px;
  }

  .accounts-deck {
    border-bottom: 1pt solid #F2F2F2;
  }

  .composer-box-textarea {
    display: block;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    width: 100%;
    color: #282c37;
    background: #fff;
    padding: 0rem 1rem;
    font-family: inherit;
    font-size: inherit;
    resize: vertical;
    line-height: 1.275;
    border: 0;
    overflow: hidden;
    outline: 0;
  }

  .compose-box-pad {
    padding: 0.85rem 0;
    width: 100%;
    display: block;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }

  .account-checkmark {
    position: absolute;
    bottom: -12.5%;
    right: -12.5%;
    height: 16px;
    width: 16px;
    padding: 0;
    border-radius: 16px;
    border-radius: 100%;
    background-color: #FFFFFF;
  }
</style>