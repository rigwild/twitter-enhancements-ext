const action = {
  // Download a file
  download: ({ url }) => chrome.downloads.download({ url })
}

chrome.runtime.onMessage.addListener((message, sender) => {
  // Get the action requested by the content script
  if (message && message.hasOwnProperty('action') && action.hasOwnProperty(message.action)) {
    action[message.action](message)
  }
})
