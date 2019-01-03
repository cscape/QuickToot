<template lang="pug">
  div.container.options-page
    .spinner(v-show='loading')
      canvas#loader
    .h6.mb-1 QuickToot by Cyberscape
    h1 Options
    section(v-if='accounts.length >= 1')
      h2 Your connected accounts
      ul.account-by-domain
        li(v-for='(domainaccounts, key) in accountsByDomain', :key='key')
          h3.accounts-domain(v-if='accounts.length >= ACCS_EXPAND_AT') {{ key }}
          template(v-for='account in domainaccounts', v-if='account.account')
            li.account.row.py-2
              .col-auto
                img.avatar-main.rounded-circle.d-block(:src='account.account.avatar', height='48', width='48', :title='`@${account.account.username}@${account.domain}`')
              .col.pl-0
                span.d-block.name-account(v-html='emojifyString(account.account.display_name, account.account.emojis)')
                .d-block
                  a.at-account(:href='account.account.url') @{{ account.account.username }}{{ accounts.length >= ACCS_EXPAND_AT ? '' : '@' + account.domain}}
              .col-auto
                .btn.btn-danger.delete-account(v-on:click='removeAccount(account.accountHash)') ×
    section
      h2 Add an account
      form.add-acc-form(v-on:submit='$event.preventDefault(); redirectToAuth(addAccountInputBoxValue)')
        .add-acc-box
          .add-acc-group-input
            span.add-acc-example-username Joey@
            input.add-acc-input(type='text', autocomplete='off', autocorrect='off', spellcheck='off', title='The URL must be a domain host', required, id='addAccountInputBox', placeholder='mastodon.example.com', v-model='addAccountInputBoxValue')
            input.add-acc-submit.btn.btn-success(type='submit', v-on:click='redirectToAuth(addAccountInputBoxValue)', value='Add')
        p.add-acc-error(v-if='addAccountFormError') {{ addAccountFormError }}
    section
      h2 Advanced
      .action-btn
        button.btn.btn-danger(v-on:click='window.confirm(lingo.ConfirmAccountReset) === true ? resetAccountStorage() : null') Reset account storage
      //- .action-btn
        button.action-btn.btn.btn-danger(type='submit', v-on:click='') Reset all to defaults
</template>
<script>
  import Auth from '../libraries/auth'
  import { Spinner } from '../libraries/types'
  import Utilities from '../libraries/utilities'
  import StorageAPI from '../libraries/storage'

  const lingo = {
    ConfirmAccountReset: `Are you sure you want to remove all your accounts?\nThis action is irreversible!`
  }

  export default {
    data: () => ({
      lingo,
      addAccountInputBoxValue: '',
      addAccountFormError: null,
      loading: false,
      window: window,
      accounts: [],
      accountsByDomain: {},
      ACCS_EXPAND_AT: 3
    }),
    computed: { },
    created () { },
    mounted () {
      const canvas = document.getElementById('loader')
      new Spinner(canvas, { // eslint-disable-line no-new
        scale: 2
      })
      this.sortAccounts()
    },
    methods: {
      sortAccounts: function () {
        chrome.storage.local.get('accounts', a => {
          let accountsAsArray = []
          for (let key in a.accounts) {
            accountsAsArray.push(a.accounts[key])
          }
          this.accounts = accountsAsArray
          let table = {}
          for (let i = 0; i < accountsAsArray.length; i++) {
            const currentAcc = accountsAsArray[i]
            if (!table[currentAcc.domain]) table[currentAcc.domain] = []
            table[currentAcc.domain].push(currentAcc)
          }
          this.accountsByDomain = Object.assign({}, this.accountsByDomain, table)
        })
      },
      resetAccountStorage: function () {
        StorageAPI.resetAccountStorage()
          .then(() => this.sortAccounts())
      },
      removeAccount: function (hash) {
        StorageAPI.removeAccount(hash)
          .then(() => this.sortAccounts())
      },
      AutoRoute: function (url) {
        return Utilities.autoroute(url)
      },
      emojifyString: function (string, emojis) {
        return Utilities.convertToHTMLWithEmoji(string, emojis)
      },
      redirectToAuth: function () {
        this.loading = true
        const inputVal = this.addAccountInputBoxValue
        if (inputVal.match(/^([^/]){1,}\.([^/]){2,}$/g) == null) {
          const err = new Error('Domain must be in host format (Example: joinmastodon.org, a.example.com)')
          this.loading = false
          return this.showAddAccountFormError(err)
        }
        const rawDomain = inputVal
        Auth.getAuthorizationCode(rawDomain)
          .then(url => (window.location.href = url))
          .catch(err => {
            this.loading = false
            this.showAddAccountFormError(err)
          })
      },
      showAddAccountFormError: function (err) {
        console.error(err)
        this.addAccountFormError = err.message
      },
      hideAddAccountFormError: function () {
        this.addAccountFormError = null
      }
    }
  }
</script>

<style>
  .accounts-list, .account-by-domain {
    padding-left: 0;
    list-style-type: none;
    margin-bottom: 0;
  }

  h1 {
    letter-spacing: -0.024em;
  }

  .options-page {
    max-width: 400px;
    margin-top: 32px;
    margin-bottom: 32px;
  }

  section {
    background-color: #CFD8DC;
    border-radius: 4px;
    margin-top: 1rem;
    padding: 0.75rem 1rem 1rem 1rem;
  }

  section > h2 {
    color: #37474F;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  .add-acc-group-input {
    display: flex;
    flex-direction: row;
    line-height: 2rem;
    color: #455A64;
  }

  .add-acc-example-username {
    color: inherit;
    align-self: center;
  }

  .add-acc-input {
    flex: 1 1;
    font: inherit;
    border: 0;
    background-color: #ECEFF1;
    border-radius: 4px;
    height: auto;
    padding: 0;
    margin: 0;
    -webkit-appearance: none;
    appearance: none;
    outline: none;
    color: #293826;
    padding-left: 4pt;
    text-transform: lowercase;
  }

  .add-acc-submit {
    font: inherit;
    line-height: inherit;
    margin-left: 0.75rem;
    text-transform: lowercase;
    border: 0;
    border-radius: 4px;
    padding: 0 0.5rem;
  }

  :root, html, body {
    background-color: #ECEFF1;
  }

  .add-acc-submit[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .add-acc-input[disabled] {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .add-acc-error {
    margin: 0.5rem 0 0 0;
    font-size: 0.85rem;
    color: #B71C1C;
    font-weight: 500;
    line-height: 1.25;
  }

  .spinner {
    position: absolute;
    top: 10px;
    left: 10px;
    width: 20px;
    height: 20px;
  }

  .spinner canvas {
    width: 20px !important;
    height: 20px !important;
  }

  .name-account {
    font-weight: 600;
    color: #37474F;
    word-break: break-word;
  }

  .at-account, .at-account:hover {
    font-size: 0.9rem;
    font-weight: 500;
    color: #78909C;
    word-break: break-word;
  }

  .account {
    flex-wrap: nowrap;
    align-items: center;
  }

  .accounts-domain {
    font-size: 0.9rem;
    text-transform: uppercase;
    font-weight: 600;
    color: #607D8B;
    margin-bottom: 0.5rem;
  }

  .account-by-domain > li:not(:first-child) {
    margin-top: 0.75rem;
  }

  @media (max-width: 400px) {
    section {
      margin: 1rem -15px 0 -15px;
      border-radius: 0;
    }
  }

  .action-btn {
    margin-top: 0.25rem;
  }

  .action-btn:first-child {
    margin-top: 0;
  }

  .delete-account {
    height: 2rem;
    width: 2rem;
    border-radius: 2rem;
    padding: 0;
    font-size: 2rem;
    line-height: 2rem;
  }
</style>