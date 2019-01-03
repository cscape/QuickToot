/* global FileReader */

const Utilities = {
  genHash: (length = 64) => {
    return (new Array(length)) // blank 64-length array
      .fill(0) // fill with 0
      .map(() =>
        Math.round(Math.random() * 16) // 0 <= num <= 16
          .toString(16) // convert to hex
          .slice(0, 1) // only one hex digit
      ).join('') // combine to hash string
  },
  blobToDataURI: (blob) => {
    return new Promise(resolve => {
      let reader = new FileReader()

      reader.addEventListener('load', event => {
        resolve(reader.result)
      }, false)

      reader.readAsDataURL(blob)
    })
  },
  replaceAll: (str, find, replace) => str.replace(new RegExp(Utilities.escapeRegExp(find), 'gm'), replace),
  escapeRegExp: (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1'), // eslint-disable-line no-useless-escape
  convertToHTMLWithEmoji: (input, emojiArray, hx = 16, wx = 16) => {
    const matches = String(input).match(/:[a-zA-Z0-9_]{2,}:/gm)
    if (matches == null || matches.length === 0) return input
    let htmlInputWithEmojis = input
    matches.forEach(match => {
      const localShortcode = match.replace(/:/gm, '')
      for (let i = 0; i < emojiArray.length; i++) {
        if (localShortcode === emojiArray[i].shortcode) {
          const tmpString = String(htmlInputWithEmojis)
          const replacement = `<span class='inline-emoji'><img src='${emojiArray[i].url}' height='${hx}' width='${wx}' title='${match}' alt='${match}'/></span>`
          htmlInputWithEmojis = Utilities.replaceAll(tmpString, match, replacement)
        }
      }
    })
    return htmlInputWithEmojis
  },
  autoroute: (url) => {
    return `https://routing.ds.cyberscape.co/route-system/mastodon-image-proxy/${url}`
  }
}

export default Utilities
