
module.exports = {
  name: 'QuickToot',
  version: '1.0.0',
  description: 'Vue.js Chrome Extension Template (wcer)',
  author: 'yura',
  manifest_version: 2,
  icons: { '16': 'icons/16.png', '128': 'icons/128.png' },
  permissions: [
    'https://*/',
    'https://*/*',
    'background',
    'unlimitedStorage',
    'storage'
  ],
  browser_action: {
    default_title: 'New Toot',
    default_popup: 'pages/popup.html'
  },
  background: {
    persistent: false,
    scripts: [
      'js/background.js'
    ]
  },
  options_page: 'pages/options.html',
  content_security_policy: "script-src 'self' 'unsafe-eval'; object-src 'self'",
  web_accessible_resources: [ 'panel.html', 'pages/auth.html' ]
}
