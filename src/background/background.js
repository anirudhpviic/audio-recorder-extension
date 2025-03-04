console.log("loaded...");
let micAudioBlob;
let tabAudioBlob;

// chrome.action.onClicked.addListener(async (tab) => {
chrome.runtime.onMessage.addListener(async (message) => {
  if (message.type === "click") {
    const existingContexts = await chrome.runtime.getContexts({});
    let recording = false;
    const offscreenDocument = existingContexts.find(
      (c) => c.contextType === "OFFSCREEN_DOCUMENT"
    );
    // If an offscreen document is not already open, create one.
    if (!offscreenDocument) {
      // Create an offscreen document.
      await chrome.offscreen.createDocument({
        url: "offscreen.html",
        reasons: ["USER_MEDIA"],
        justification: "Recording from chrome.tabCapture API",
      });
    } else {
      recording = offscreenDocument.documentUrl.endsWith("#recording");
    }
    if (recording) {
      // stop recording
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "micCaptureStop" });
      });

      chrome.runtime.sendMessage({
        type: "stop-recording",
        target: "offscreen",
      });

      chrome.action.setIcon({ path: "icons/not-recording.png" });
      return;
    }
    // Get a MediaStream for the active tab.
    const streamId = await chrome.tabCapture.getMediaStreamId({
      targetTabId: message.tabId,
    });
    // Send the stream ID to the offscreen document to start recording.

    // start-recording
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "micCaptureStart" });
    });

    chrome.runtime.sendMessage({
      type: "start-recording",
      target: "offscreen",
      data: streamId,
    });
    chrome.action.setIcon({ path: "icons/recording.png" });
  } else if (message.type === "micRecordingStopped") {
    console.log("Recording stopped", message);

    try {
      micAudioBlob = await fetch(message.data)
        .then((res) => res.blob())
        .then((blob) => {
          console.log("mic audio blob", blob);
          return blob;
        })
        .catch((error) => {
          console.error("Error converting Base64 to Blob:", error);
        });
      console.log("micAudioBlob", micAudioBlob);
    } catch (error) {
      console.error("Error fetching audio blob:", error);
    }
  } else if (message.type === "tabRecordingStopped") {
    console.log("tabRecordingStopped", message);

    try {
      tabAudioBlob = await fetch(message.data)
        .then((res) => res.blob())
        .then((blob) => {
          console.log("tab audio blob", blob);
          return blob;
        })
        .catch((error) => {
          console.error("Error converting Base64 to Blob:", error);
        });
      console.log("tabAudioBlob", micAudioBlob);
    } catch (error) {
      console.error("Error fetching audio blob:", error);
    }
  }
});
