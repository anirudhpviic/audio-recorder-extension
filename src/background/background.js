console.log("loaded...");

import axios from "axios";

let micAudioBuffer;
let tabAudioBuffer;
let tabId;
let isMuted = true;

const startOrStopRecording = async (message) => {
  tabId = message.tabId;
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
    chrome.tabs.sendMessage(message.tabId, { action: "mic-recording-stop" });

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

  // start-recording
  chrome.tabs.sendMessage(message.tabId, {
    action: "mic-recording-start",
    isMuted,
  });

  chrome.runtime.sendMessage({
    type: "start-recording",
    target: "offscreen",
    data: streamId,
  });

  chrome.action.setIcon({ path: "icons/recording.png" });
};

async function sendToServer() {
  const micBlob = await fetch(micAudioBuffer)
    .then((res) => res.blob())
    .then((blob) => {
      return blob;
    })
    .catch((error) => {
      console.error("Error converting Base64 to Blob:", error);
    });

  const tabBlob = await fetch(tabAudioBuffer)
    .then((res) => res.blob())
    .then((blob) => {
      return blob;
    })
    .catch((error) => {
      console.error("Error converting Base64 to Blob:", error);
    });

  const formData = new FormData();
  formData.append("micAudio", micBlob, "micAudio.webm");
  formData.append("tabAudio", tabBlob, "tabAudio.webm");

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_BACKEND_URI}/audio`,
      formData
    );
    console.log("res", res);
  } catch (error) {
    console.error("Error uploading audio:", error);
  } finally {
    return;
  }
}

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.type === "click") {
    await startOrStopRecording(message);
  } else if (message.type === "mic-recording-stopped") {
    micAudioBuffer = message.data;

    if (micAudioBuffer && tabAudioBuffer) {
      await sendToServer();

      micAudioBuffer = undefined;
      tabAudioBuffer = undefined;
    }
  } else if (message.type === "tab-recording-stopped") {
    tabAudioBuffer = message.data;

    if (micAudioBuffer && tabAudioBuffer) {
      await sendToServer();

      micAudioBuffer = undefined;
      tabAudioBuffer = undefined;
    }
  } else if (message.type === "MIC_STATUS") {
    console.log("message.muted", message.isMuted);
    isMuted = message.isMuted;
    if (tabId) {
      chrome.tabs.sendMessage(tabId, {
        action: "MIC_STATUS",
        isMuted: message.isMuted,
      });
    }
  }
});
