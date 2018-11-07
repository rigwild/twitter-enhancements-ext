'use strict'

// Get current time
const timestamp = () => new Date().toISOString()

// Log something to console
const logger = {
  title: `%c Twitter Enhancements - ${timestamp()}`,
  titleStyle: 'color: #1da1f2; font-style: italic',
  log(...x) {
    return console.log(this.title, this.titleStyle, ...x)
  },
  success(...x) {
    return console.log(
      this.title + ' %cSuccess 🡺',
      this.titleStyle,
      'color: #bada55; font-weight: bold',
      ...x
    )
  },
  error(...x) {
    return console.log(
      this.title + ' %cError 🡺',
      this.titleStyle,
      'color: #f25252; font-weight: bold',
      ...x
    )
  }
}

const jpgLarge2jpg = {
  // Change url and image url from jpg:large to jpg. Used only when image opened in new tab
  newTab() {
    history.pushState('', document.title, document.location.href.replace('jpg:large', 'jpg'))
    const img = document.querySelector('img')
    img.src = img.src.replace('jpg:large', 'jpg')
    logger.success('Changed the url from jpg:large to jpg.')
  },

  // Modify src of image when opened in gallery on twitter from jpg:large to jpg
  imgGalleryWatcher() {
    const gallery = document.querySelector('.Gallery-media')

    // Get notified when image gallery is opened to change img url
    const observer = new MutationObserver(mutationList => {
      if (
        mutationList[0].type === 'childList' &&
        mutationList[0].addedNodes.length > 0 &&
        mutationList[0].addedNodes[0].tagName === 'IMG'
      ) {
        const img = mutationList[0].addedNodes[0]
        img.src = img.src.replace('jpg:large', 'jpg')
        logger.success('Changed gallery image url from jpg:large to jpg.')
      }
    })

    observer.observe(gallery, { childList: true })
    logger.success('Watching image gallery to change url from jpg:large to jpg.')
  }
}

// Add a download button on tweets
const addDownloadButton = () => {
  const tweets = document.querySelectorAll('.stream-item')

  tweets.forEach(tweet => {
    const media = tweet.querySelector('.AdaptiveMedia')

    // If tweet doesn't have a download button, add it
    // Add download button only if tweet contains a media
    if (tweet.innerHTML.includes('twitter-enhancements') || !media) return

    const ele = tweet.querySelector('.ProfileTweet-actionList')

    const div = document.createElement('div')
    div.classList.add('ProfileTweet-action')
    div.style = 'margin-top: 3px;position: absolute;'

    const button = document.createElement('button')
    button.classList.add(
      'ProfileTweet-actionButton',
      'u-textUserColorHover',
      'twitter-enhancements'
    )
    button.type = 'button'
    button.textContent = '🡇 Download'

    button.addEventListener('click', () => {
      // Media is a video (GIF)
      const video = tweet.querySelector('video')
      // Media is a single image
      const img = tweet.querySelector('.AdaptiveMedia-photoContainer')

      if (video) chrome.runtime.sendMessage({ action: 'download', url: video.src })
      else if (img)
        chrome.runtime.sendMessage({ action: 'download', url: img.getAttribute('data-image-url') })
    })

    div.appendChild(button)

    ele.appendChild(div)
  })
  logger.success('Added download buttons on tweets.')
}

const downloadButtonWatcher = () => {
  const gallery = document.querySelector('.stream-items')

  // Get notified when twitter feed gets new tweets
  const observer = new MutationObserver(m => m[0].type === 'childList' && addDownloadButton())

  observer.observe(gallery, { childList: true })
  logger.success('Watching twitter feed for new tweets to add download buttons.')
}

chrome.extension.sendMessage({}, response => {
  // Modify from jpg:large to jpg if image opened in new tab
  if (window.location.href.match(/twimg\.com\/.*?\.jpg:large/)) {
    jpgLarge2jpg.newTab()
  } else if (window.location.href.match(/twitter\.com/)) {
    jpgLarge2jpg.imgGalleryWatcher()
    downloadButtonWatcher()
    addDownloadButton()
  }
})

// document.querySelector('ul[role=menu]')
