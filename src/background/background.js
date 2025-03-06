console.log("loaded...");
import axios from "axios";

let micAudioBuffer;
let tabAudioBuffer;

let tabId;

// chrome.action.onClicked.addListener(async (tab) => {
chrome.runtime.onMessage.addListener(async (message) => {
  if (message.type === "click") {
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
      // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(message.tabId, { action: "micCaptureStop" });
      // });

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
    // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(message.tabId, { action: "micCaptureStart" });
    // });

    chrome.runtime.sendMessage({
      type: "start-recording",
      target: "offscreen",
      data: streamId,
    });

    chrome.action.setIcon({ path: "icons/recording.png" });
  } else if (message.type === "micRecordingStopped") {
    console.log("Recording stopped", message);

    micAudioBuffer = message.data;

    if (micAudioBuffer && tabAudioBuffer) {
      //

      //

      // chrome.runtime.sendMessage({
      //   type: "micAndTabRecordingStopped",
      //   data: {
      //     micAudioBuffer,
      //     tabAudioBuffer,
      //   },
      // });

      await sendToServer();

      micAudioBuffer = undefined;
      tabAudioBuffer = undefined;
    }

    // try {
    //   micAudioBlob = await fetch(message.data)
    //     .then((res) => res.blob())
    //     .then((blob) => {
    //       console.log("mic audio blob", blob);
    //       return blob;
    //     })
    //     .catch((error) => {
    //       console.error("Error converting Base64 to Blob:", error);
    //     });
    //   console.log("micAudioBlob", micAudioBlob);
    // } catch (error) {
    //   console.error("Error fetching audio blob:", error);
    // }

    // if (micAudioBlob && tabAudioBlob) {
    //   console.log("both blobs", micAudioBlob, tabAudioBlob);
    // }
  } else if (message.type === "tabRecordingStopped") {
    console.log("tabRecordingStopped", message);

    tabAudioBuffer = message.data;

    if (micAudioBuffer && tabAudioBuffer) {
      // chrome.runtime.sendMessage({
      //   type: "micAndTabRecordingStopped",
      //   data: {
      //     micAudioBuffer,
      //     tabAudioBuffer,
      //   },
      // });

      await sendToServer();

      micAudioBuffer = undefined;
      tabAudioBuffer = undefined;
    }

    // try {
    //   tabAudioBlob = await fetch(message.data)
    //     .then((res) => res.blob())
    //     .then((blob) => {
    //       console.log("tab audio blob", blob);
    //       return blob;
    //     })
    //     .catch((error) => {
    //       console.error("Error converting Base64 to Blob:", error);
    //     });
    //   console.log("tabAudioBlob", micAudioBlob);
    // } catch (error) {
    //   console.error("Error fetching audio blob:", error);
    // }

    // if (micAudioBlob && tabAudioBlob) {
    //   console.log("both blobs", micAudioBlob, tabAudioBlob);
    // }
  } else if (message.type === "MIC_STATUS") {
    if (tabId) {
      console.log("MIC_STATUS", message.muted);

      chrome.tabs.sendMessage(tabId, {
        action: "MIC_STATUS",
        muted: message.muted,
      });
    }
  }
});

async function sendToServer() {
  console.log("Recording stopped");
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

  console.log("mic audio blob", micBlob);
  console.log("tab audio Blob", tabBlob);

  const formData = new FormData();
  // @ts-ignore
  formData.append("micAudio", micBlob, "micAudio.webm");
  // @ts-ignore
  formData.append("tabAudio", tabBlob, "tabAudio.webm");

  try {
    const res = await axios.post("http://localhost:3000/audio", formData);
    console.log("res", res);
  } catch (error) {
    console.error("Error uploading audio:", error);
  } finally {
    return;
  }
}
