chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "AUDIO_DATA") {
    console.log("Received audio data:", message.data);
    // Process or store audio
  }
});
