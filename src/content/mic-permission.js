let mediaRecorder;
let audioChunks = [];

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.action === "ASK_MIC_PERMISSION") {
    try {
      // Check mic permission status first
      const permissionStatus = await navigator.permissions.query({
        name: "microphone",
      });

      if (permissionStatus.state === "granted") {
        console.log("Microphone permission already granted.");
        // Already granted, return success
        chrome.runtime.sendMessage({
          type: "RETURN_ASK_MIC_PERMISSION",
          status: true,
        });
        return true;
      }

      // Ask for mic access if not granted
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      console.log("Microphone permission granted;");
      chrome.runtime.sendMessage({
        type: "RETURN_ASK_MIC_PERMISSION",
        status: true,
      });
      return true;
    } catch (error) {
      console.error(
        `Mic permission denied or error: ${error.message || error}`
      );

      chrome.runtime.sendMessage({
        type: "RETURN_ASK_MIC_PERMISSION",
        status: false,
      });
    }

    return true;
  }
});
