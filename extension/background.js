console.log("X-Replica: Background Service Worker Running");

// Helper to generate a UUID-like string
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("X-Replica Installed");

  // Generate a unique ID for this specific browser installation
  chrome.storage.local.get(["xInstallationId"], (result) => {
    if (!result.xInstallationId) {
      const id = generateUUID();
      chrome.storage.local.set({ xInstallationId: id }, () => {
        console.log("Device ID Generated:", id);
      });
    }
  });
});
