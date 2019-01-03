import Utilities from './utilities'

const visibilities = ['direct', 'private', 'unlisted', 'public']

class Status {
  constructor (text, visibility, sensitive, spoiler, media) {
    this.status = {}
    if (visibility != null && visibilities.indexOf(visibility) >= 0) this.status.visibility = visibility
    if (sensitive != null) this.status.sensitive = sensitive
    if (spoiler != null) this.status.spoiler_text = spoiler
    if (text != null) this.status.status = String(text).trim()
    if (media != null && Array.isArray(media)) {
      this.status.media_ids = media
    } else {
      this.status.status = String(text).trim() === '' ? '.' : text
    }

    // Generates random hash for idempotency header
    this.key = Utilities.genHash(32)

    return this
  }
}

export default Status
