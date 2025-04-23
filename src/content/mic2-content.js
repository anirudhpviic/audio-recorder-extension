let mediaRecorder;
let recordedChunks = [];
let currentStream; // Track the current audio stream

function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => resolve(reader.result);
  });
}

// Function to start recording
async function startRecording() {
  try {
    // Stop any existing stream before starting a new one
    if (currentStream) {
      currentStream.getTracks().forEach((track) => track.stop());
    }

    // Get the microphone audio stream
    currentStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    // Initialize MediaRecorder with the audio stream
    mediaRecorder = new MediaRecorder(currentStream);

    // Collect audio data chunks
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    // Start recording
    mediaRecorder.start();
  } catch (error) {
    console.error("Error starting recording:", error);
  }
}

// Function to stop recording and return the audio Blob
async function stopRecording() {
  return new Promise((resolve, reject) => {
    if (mediaRecorder?.state === "recording") {
      mediaRecorder.onstop = () => {
        // Cleanup the audio stream
        currentStream?.getTracks().forEach((track) => track.stop());
        currentStream = null;

        // Create a Blob from the recorded chunks
        const audioBlob = new Blob(recordedChunks, { type: "audio/webm" });

        // Clear the recorded chunks for the next recording
        recordedChunks = [];

        resolve(audioBlob);
      };

      // Stop the MediaRecorder
      mediaRecorder.stop();
    } else {
      reject(new Error("No active recording to stop."));
    }
  });
}

// Example usage
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "mic-two-recording-start") {
    console.log("start recording mic2-content");
    await startRecording();
  } else if (request.action === "mic2-recording-stop") {
    try {
      const audioBlob = await stopRecording();
      const base64Data = await blobToBase64(audioBlob);

      chrome.runtime.sendMessage({
        type: "mic2-recording-stopped",
        data: base64Data,
      });
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  }
  return true;
});
