console.log("loaded...");
import api from "../api/config";
import { jwtDecode } from "jwt-decode";
import { getToken } from "../utils/get-token";

let micAudioBuffer;
let tabAudioBuffer;
let tabId;
let isMuted = true;

let isRecording = false;
let recordStartTime = null;

let meetId = null;
let isInMeeting = false;

let recordType = null;

const startOrStopRecording = async () => {
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
    chrome.tabs.sendMessage(tabId, { action: "mic-recording-stop" });

    chrome.runtime.sendMessage({
      type: "stop-recording",
      target: "offscreen",
    });

    isRecording = false;
    recordStartTime = null;
    recordType = null;

    chrome.action.setIcon({ path: "icons/not-recording.png" });
    return;
  }
  // Get a MediaStream for the active tab.
  const streamId = await chrome.tabCapture.getMediaStreamId({
    targetTabId: tabId,
  });

  // start-recording
  chrome.tabs.sendMessage(tabId, {
    action: "mic-recording-start",
    isMuted,
  });

  chrome.runtime.sendMessage({
    type: "start-recording",
    target: "offscreen",
    data: streamId,
  });

  isRecording = true;
  recordStartTime = new Date().getTime();
  recordType = 'mic-tab'

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
    await api.post("/mom", formData);
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
    await startOrStopRecording();
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
      recordStartTime,
      recordType
    });
  } else if (message.type === "set-meeting-id") {
    meetId = message.data;
  } else if (message.type === "get-stored-meeting-id") {
    chrome.runtime.sendMessage({
      type: "return-stored-meeting-id",
      meetId,
    });
  } else if (message.type === "USER_JOINED_MEET") {
    const accessToken = await getToken("accessToken");

    if (!accessToken) {
      return;
    }

    const decoded = jwtDecode(accessToken);
    const isExpired = decoded.exp * 1000 - 5 * 60 * 1000 < Date.now(); // Subtract 5 minutes from expiration time

    if (isExpired) {
      return;
    }

    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/recording.png",
      title: "Meeting Started",
      message: "Please start recording.",
      priority: 2,
    });

    // handle click on the notification to start recording
    // chrome.notifications.onClicked.addListener(async () => {
    //   if (!tabId) {
    //     chrome.notifications.create({
    //       type: "basic",
    //       iconUrl: "icons/recording.png",
    //       title: "Error",
    //       message: "Please open popup.",
    //       priority: 2,
    //     });
    //     return;
    //   }
    //   await startOrStopRecording();
    //   isInMeeting = true;
    // });
  } else if (message.type === "USER_LEFT_MEET") {
    if (!isRecording || !tabId || !isInMeeting) {
      return;
    }

    await startOrStopRecording();

    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/not-recording.png",
      title: "Meeting Ended",
      message: "Meet recording stopped.",
      priority: 2,
    });
    return;
  } else if (message.type === "tab-id") {
    // when start recording the instance would be in that specific tabId in memory, so need to call the same tabId when stop recording also
    if (!isRecording) {
      tabId = message.tabId;
      console.log("set tab id", tabId);
    }
  } else if (message.type === "is-in-meeting-to-background") {
    isInMeeting = message.isInMeeting;
  }
});

async function startOrStopRecording2() {
  if (isRecording) {
    // stop-recording
    chrome.tabs.sendMessage(tabId, {
      action: "mic2-recording-stop",
    });

    isRecording = false;
    recordStartTime = null;
    recordType = null

    chrome.action.setIcon({ path: "icons/not-recording.png" });
    return;
  } else if (!isRecording) {
    // start-recording
    chrome.tabs.sendMessage(tabId, {
      action: "mic-two-recording-start",
    });

    isRecording = true;
    recordStartTime = new Date().getTime();
    recordType = 'mic2'

    chrome.action.setIcon({ path: "icons/recording.png" });
    return;
  }
}

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.type === "mic-record-start-or-stop") {
    await startOrStopRecording2();
  } else if (message.type === "mic2-recording-stopped") {
    await sendToServer2(message.data);
  } else if (message.type === "PAGE_RELOAD") {
    if (!isRecording || !tabId || isInMeeting) {
      return;
    }
    await startOrStopRecording2();

    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/not-recording.png",
      title: "Recording Ended",
      message: "Recording stopped due to page reload.",
      priority: 2,
    });
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

async function sendToServer2(micBuffer) {
  const micBlob = await fetch(micBuffer)
    .then((res) => res.blob())
    .then((blob) => {
      return blob;
    })
    .catch((error) => {
      console.error("Error converting Base64 to Blob:", error);
    });

  const formData = new FormData();
  formData.append("fileType", "audio");
  formData.append("audio", micBlob, "micAudio.webm");
  formData.append("meetId", meetId);

  try {
    await api.post("/mom/upload-files", formData);

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
  } finally {
    return;
  }
}
