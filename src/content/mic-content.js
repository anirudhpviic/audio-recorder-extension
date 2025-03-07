let mediaRecorder;
let recordedChunks = [];
let isMuted = true;
let currentStream; // Track current stream to clean up later

function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => resolve(reader.result);
  });
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "mic-recording-start") {
    startRecording();
  } else if (request.action === "mic-recording-stop") {
    const chunks = await stopRecording();
    const blob = new Blob(chunks, { type: "audio/webm" });

    const base64Data = await blobToBase64(blob);

    mediaRecorder = undefined;
    recordedChunks = [];

    chrome.runtime.sendMessage({
      type: "mic-recording-stopped",
      data: base64Data,
    });
  } else if (request.action === "MIC_STATUS") {
    if (request.muted !== isMuted) {
      isMuted = request.muted;
      await stopRecording();
      await startRecording();
    }
  }
  return true;
});
async function startRecording() {
  console.log("start recording");
  try {
    // Stop any existing tracks before creating new stream
    if (currentStream) {
      currentStream.getTracks().forEach((track) => track.stop());
    }

    // Create appropriate stream based on mute status
    let stream;
    if (isMuted) {
      stream = createSilentAudioStream();
    } else {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
    }
    currentStream = stream;

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) recordedChunks.push(event.data);
    };

    mediaRecorder.start();
  } catch (error) {
    console.error("Recording error:", error);
  }
}

async function stopRecording() {
  return new Promise((resolve) => {
    if (mediaRecorder?.state !== "inactive") {
      mediaRecorder.onstop = () => {
        // Cleanup current stream
        currentStream?.getTracks().forEach((track) => track.stop());
        currentStream = null;
        resolve(recordedChunks);
      };
      mediaRecorder.stop();
    } else {
      resolve([]);
    }
  });
}

// Create a silent audio stream (no sound)
function createSilentAudioStream() {
  const audioContext = new AudioContext();
  const destination = audioContext.createMediaStreamDestination();
  const oscillator = audioContext.createOscillator();
  const silentGain = audioContext.createGain();

  silentGain.gain.value = 0; // Set volume to 0 (silence)
  oscillator.connect(silentGain);
  silentGain.connect(destination);
  oscillator.start();

  return destination.stream;
}
