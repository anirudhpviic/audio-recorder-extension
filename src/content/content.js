let mediaRecorder;
let audioChunks = [];

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "START_RECORDING") {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      console.log("Recording stopped");
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      audioChunks = [];

      // Convert Blob to Base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = () => {
        const base64data = reader.result.split(",")[1]; // Remove data URL prefix
        chrome.runtime.sendMessage({ type: "AUDIO_BLOB", data: base64data });
      };
    };
  }

  if (request.action === "STOP_RECORDING") {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
  }
});
