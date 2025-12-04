console.log("X-Replica: Sync Script Running...");

// 1. Look for the hidden handshake element
const syncElement = document.getElementById("x-replica-sync");

if (syncElement) {
  const key = syncElement.getAttribute("data-key");
  const email = syncElement.getAttribute("data-email");

  if (key && email) {
    // 2. Save to Chrome Storage (Global for the browser)
    chrome.storage.local.set(
      {
        xReplicaKey: key,
        xReplicaEmail: email,
      },
      () => {
        console.log("✅ X-Replica: Auto-Synced Successfully!");
        alert("X-Replica Extension Connected Successfully! 🚀");
      }
    );
  }
}
