let mediaRecorder;
let recordedChunks = [];
let stream;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_RECORDING") {
    startRecording();
  } else if (message.type === "STOP_RECORDING") {
    stopRecording();
  }
});

async function startRecording() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab) {
    console.error("No active tab found.");
    return;
  }

  chrome.tabCapture.capture({ audio: true, video: false }, (capturedStream) => {
    if (!capturedStream) {
      console.error(
        "Failed to capture tab audio. Ensure you have the right permissions."
      );
      return;
    }

    stream = capturedStream;
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = saveRecording;
    mediaRecorder.start();
    console.log("Recording started...");
  });
}

function stopRecording() {
  if (mediaRecorder) {
    mediaRecorder.stop();
    stream.getTracks().forEach((track) => track.stop());
    console.log("Recording stopped...");
  }
}

function saveRecording() {
  const blob = new Blob(recordedChunks, { type: "audio/webm" });
  const url = URL.createObjectURL(blob);

  chrome.downloads.download({
    url: url,
    filename: "meeting_audio.webm",
  });

  recordedChunks = [];
}
