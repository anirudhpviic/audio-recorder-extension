function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob); // Convert Blob to Base64
    reader.onloadend = () => resolve(reader.result);
  });
}
chrome.runtime.onMessage.addListener(async (message) => {
  if (message.target === "offscreen") {
    switch (message.type) {
      case "start-recording":
        startRecording(message.data);
        break;
      case "stop-recording":
        stopRecording();
        break;
      default:
        throw new Error("Unrecognized message:", message.type);
    }
  }
});

let recorder;
let data = [];

async function startRecording(streamId) {
  if (recorder?.state === "recording") {
    throw new Error("Called startRecording while recording is in progress.");
  }

  const tabMedia = await getTabMedia(streamId);

  // Continue to play the captured audio to the user
  const output = new AudioContext();
  const source = output.createMediaStreamSource(tabMedia);
  source.connect(output.destination);

  // Start recording
  recorder = new MediaRecorder(tabMedia, { mimeType: "audio/webm" });
  recorder.ondataavailable = (event) => data.push(event.data);
  recorder.onstop = async () => {
    const blob = new Blob(data, { type: "audio/webm" });

    // window.open(URL.createObjectURL(blob), "_blank");

    const base64Data = await blobToBase64(blob);

    chrome.runtime.sendMessage({
      type: "tabRecordingStopped",
      data: base64Data,
    });

    // Clear state ready for next recording
    recorder = undefined;
    data = [];
  };
  recorder.start();

  // Record the current state in the URL
  window.location.hash = "recording";
}

async function stopRecording() {
  recorder.stop();

  // Stopping the tracks makes sure the recording icon in the tab is removed.
  recorder.stream.getTracks().forEach((t) => t.stop());

  // Update current state in URL
  window.location.hash = "";
}

async function getTabMedia(streamId) {
  return await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: "tab",
        chromeMediaSourceId: streamId,
      },
    },
    video: false,
  });
}
