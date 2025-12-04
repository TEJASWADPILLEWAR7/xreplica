const API_URL = "https://www.xreplica.site/api/replies";

const AI_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8.5 7c0-3.3 2.2-6 5-6 3.3 0 5.5 2.7 5.5 6 0 1.2-.4 2.2-1 3l4 5h-5l-2-3-2 3H8l4-5c-.6-.8-1-1.8-1-3z"></path></svg>`;

async function typeWriter(text, element) {
  element.focus();

  const minDelay = 15;
  const maxDelay = 40;

  for (const char of text) {
    if (document.activeElement !== element) {
      element.focus();
    }

    const success = document.execCommand("insertText", false, char);

    if (!success) {
      element.innerText += char;
      element.dispatchEvent(new Event("input", { bubbles: true }));
    }

    const delay =
      Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

async function getCredentials() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["xReplicaKey"], (result) => {
      resolve(result);
    });
  });
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.innerText = message;
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    backgroundColor: type === "error" ? "#ef4444" : "#0f172a",
    color: "white",
    padding: "12px 24px",
    borderRadius: "8px",
    zIndex: "10000",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    transition: "opacity 0.3s ease",
  });
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function createAIButton() {
  const btn = document.createElement("div");
  btn.className = "x-replica-button";
  btn.setAttribute("role", "button");
  btn.setAttribute("tabindex", "0");
  btn.innerHTML = `
    <div class="x-rep-icon">${AI_ICON}</div>
    <span class="x-rep-text">AI Reply</span>
  `;
  return btn;
}

// FIX: Enhanced Selector Logic to find the CORRECT box
async function waitForVisibleTextarea() {
  const find = () => {
    // 1. MODAL PRIORITY: If a modal exists, ONLY look inside it.
    const modal = document.querySelector('div[role="dialog"]');
    if (modal) {
      const modalBox = modal.querySelector(
        'div[data-testid="tweetTextarea_0"], [contenteditable="true"][role="textbox"]'
      );
      // Ensure the modal box is actually visible and ready
      if (modalBox && modalBox.offsetParent !== null) {
        return modalBox;
      }
    }

    // 2. FOCUS PRIORITY: Trust X's native focus if it's a textbox
    const active = document.activeElement;
    if (
      active &&
      active.getAttribute("contenteditable") === "true" &&
      active.getAttribute("role") === "textbox"
    ) {
      return active;
    }

    // 3. FALLBACK & FILTERING
    const elements = Array.from(
      document.querySelectorAll('div[data-testid="tweetTextarea_0"]')
    );
    const visibleElements = elements.filter((el) => el.offsetParent !== null);

    // If we have multiple visible boxes, the Main Composer is usually the first one.
    // The Reply box (inline) is usually later in the DOM.
    if (visibleElements.length > 1) {
      // Return the LAST visible text area (likely the inline reply box)
      return visibleElements[visibleElements.length - 1];
    }

    // If only 1 box is visible...
    if (visibleElements.length === 1) {
      const el = visibleElements[0];

      // Check surrounding text to see if it's the "What is happening?!" box
      // We look at the parent container text to guess the context.
      const containerText =
        el.closest('[data-testid="cellInnerDiv"]')?.innerText || "";
      const isMainComposer = containerText.includes("What is happening?!");
      const isReplyComposer = containerText.includes("Post your reply");

      if (isReplyComposer) return el;
      if (isMainComposer) return null; // Ignore main composer, keep waiting for modal/reply box
    }

    return null;
  };

  let el = find();
  if (el) return el;

  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      el = find();
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, 5000);
  });
}

function processTweet(article) {
  if (article.dataset.xReplica === "true") return;
  article.dataset.xReplica = "true";

  const actionBar = article.querySelector('div[role="group"]');
  if (!actionBar) return;

  const btn = createAIButton();
  actionBar.appendChild(btn);

  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const originalContent = btn.innerHTML;
    btn.innerHTML = `<span style="font-size:12px;">Thinking...</span>`;
    btn.style.opacity = "0.7";

    try {
      const { xReplicaKey } = await getCredentials();
      if (!xReplicaKey) {
        alert("Please login to the Dashboard to sync your account.");
        window.open("https://xreplica.site/dashboard", "_blank");
        throw new Error("Auth required");
      }

      const textDiv = article.querySelector('div[data-testid="tweetText"]');
      let tweetText = "";

      if (textDiv) {
        tweetText = textDiv.innerText || textDiv.textContent || "";

        if (tweetText.includes("[object Object]") || tweetText.trim() === "") {
          tweetText = Array.from(textDiv.querySelectorAll("span, img[alt]"))
            .map((node) => (node.tagName === "IMG" ? node.alt : node.innerText))
            .join(" ");
        }
      }

      let mediaUrl = null;
      const photo = article.querySelector('div[data-testid="tweetPhoto"] img');
      const video = article.querySelector(
        'div[data-testid="videoPlayer"] video'
      );
      const card = article.querySelector('div[data-testid="card.wrapper"] img');

      if (photo) mediaUrl = photo.src;
      else if (video && video.poster) mediaUrl = video.poster;
      else if (card) mediaUrl = card.src;

      const userLink = article.querySelector(
        'div[data-testid="User-Name"] a[href^="/"]'
      );
      const targetHandle = userLink
        ? userLink.getAttribute("href").replace("/", "")
        : null;

      if ((!tweetText || tweetText.trim() === "") && !mediaUrl) {
        throw new Error("No readable text or image found in tweet");
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-extension-key": xReplicaKey,
        },
        body: JSON.stringify({
          tweetText: tweetText,
          imageUrl: mediaUrl,
          targetHandle: targetHandle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          alert(data.reply || "Subscription Expired");
          window.open("https://xreplica.site/pricing", "_blank");
          throw new Error("Subscription expired");
        }
        if (response.status === 429) {
          showToast(
            "Rate Limit: " + (data.error || "Too many requests"),
            "error"
          );
          throw new Error("Rate limit");
        }
        throw new Error(data.error || "Generation Failed");
      }

      if (!data.reply) throw new Error("Empty reply generated");

      const replyIcon = actionBar.querySelector('button[data-testid="reply"]');
      if (replyIcon) {
        replyIcon.click();

        // Wait a bit longer for the modal/animation to start before searching
        await new Promise((r) => setTimeout(r, 600));

        const editableBox = await waitForVisibleTextarea();

        if (editableBox) {
          await new Promise((r) => setTimeout(r, 200));
          editableBox.click();
          editableBox.focus();
          await typeWriter(data.reply, editableBox);
        } else {
          // Only fallback to clipboard if we absolutely cannot find the box
          await navigator.clipboard.writeText(data.reply);
          showToast("Reply box not found. Copied to clipboard!", "info");
        }
      } else {
        await navigator.clipboard.writeText(data.reply);
        showToast("Copied: " + data.reply);
      }
    } catch (err) {
      if (
        err.message !== "Auth required" &&
        err.message !== "Subscription expired" &&
        err.message !== "Rate limit"
      ) {
        showToast("Error: " + err.message, "error");
      }
    } finally {
      btn.innerHTML = originalContent;
      btn.style.opacity = "1";
    }
  });
}

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === 1) {
        if (node.tagName === "ARTICLE" && node.dataset.testid === "tweet") {
          processTweet(node);
        }
        const tweets = node.querySelectorAll('article[data-testid="tweet"]');
        tweets.forEach(processTweet);
      }
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });

document.querySelectorAll('article[data-testid="tweet"]').forEach(processTweet);
