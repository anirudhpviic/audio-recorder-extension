window.addEventListener("beforeunload", async () => {
    chrome.runtime.sendMessage({ type: "PAGE_RELOAD" });
  });