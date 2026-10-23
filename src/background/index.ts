// Background Service Worker (Manifest V3)

// Configure side panel to open on action click
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error('SidePanel config error:', error));

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, _sendResponse) => {
  if (message.type === 'OPEN_SIDEPANEL') {
    if (sender.tab?.windowId) {
      chrome.sidePanel.open({ windowId: sender.tab.windowId });
    }
  }
});

console.log('[AcadMail AI] Background Service Worker initialized.');
