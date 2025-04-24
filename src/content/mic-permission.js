let mediaRecorder;
let audioChunks = [];

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.action === "ASK_MIC_PERMISSION") {
    try {
      // Ask for mic access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Setup recorder
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      chrome.runtime.sendMessage({
        type: "RETURN_ASK_MIC_PERMISSION",
        status: true,
      });
    } catch (error) {
      console.error("Mic permission denied or error:", error);

      chrome.runtime.sendMessage({
        type: "RETURN_ASK_MIC_PERMISSION",
        status: false,
      });
    }

    return true;
  }
});
