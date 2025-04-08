console.log("loaded...");
import api from "../api/config";

let micAudioBuffer;
let tabAudioBuffer;
let tabId;
let isMuted = true;

let isRecording = false;
let recordingTime = 0;
let recordingInterval;

let meetId = null;

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

    isRecording = false;

    clearInterval(recordingInterval);
    recordingTime = 0;

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

  isRecording = true;

  recordingInterval = setInterval(() => {
    recordingTime += 1;
  }, 1000);

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
  formData.append("meetId", meetId);

  try {
    console.log("sending to server");
    await api.post("/mom", formData);
    console.log("returned from server");
    // to popup
    chrome.runtime.sendMessage({
      type: "audio-uploaded",
    });
  } catch (error) {
    console.error("Error uploading audio:", error);

    // Fallback: Download the audio files in the browser
    if (micBlob) {
      downloadBlob(micBlob, "micAudio.webm");
    }
    if (tabBlob) {
      downloadBlob(tabBlob, "tabAudio.webm");
    }
  } finally {
    return;
  }
}

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.type === "record-start-or-stop") {
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
    isMuted = message.isMuted;
    if (tabId) {
      chrome.tabs.sendMessage(tabId, {
        action: "MIC_STATUS",
        isMuted: message.isMuted,
      });
    }
  } else if (message.type === "get-recording-status") {
    chrome.runtime.sendMessage({
      type: "return-recording-status",
      isRecording,
      recordingTime,
    });
  } else if (message.type === "set-meeting-id") {
    meetId = message.data;
  } else if (message.type === "get-stored-meeting-id") {
    chrome.runtime.sendMessage({
      type: "return-stored-meeting-id",
      meetId,
    });
  } else if (message.type === "USER_JOINED_MEET") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/recording.png",
      title: "Meeting Started",
      message: "Click here to start recording.",
      priority: 2,
    });

    // handle click on the notification to start recording
    chrome.notifications.onClicked.addListener(async () => {
      if (!tabId) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/recording.png",
          title: "Error",
          message: "Please open popup.",
          priority: 2,
        });
        return;
      }
      message.tabId = tabId;
      await startOrStopRecording(message);
    });
  } else if (message.type === "USER_LEFT_MEET") {
    if (!isRecording || !tabId) {
      return;
    }

    message.tabId = tabId;
    await startOrStopRecording(message);

    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/not-recording.png",
      title: "Meeting Ended",
      message: "Meet recording stopped.",
      priority: 2,
    });
    return;
  }
});

// Helper function to download a Blob as a file
function downloadBlob(blob, filename) {
  const reader = new FileReader();
  reader.onloadend = () => {
    const base64Data = reader.result.split(",")[1]; // Extract Base64 data
    const url = `data:${blob.type};base64,${base64Data}`;

    chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true, // Prompts the user to choose the download location
    });
  };
  reader.readAsDataURL(blob);
}
