chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "START_RECORDING") {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false },
    });

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    source.connect(processor);
    processor.connect(audioContext.destination);

    processor.onaudioprocess = (event) => {
      const inputData = event.inputBuffer.getChannelData(0);
      console.log("Captured audio:", inputData);
      chrome.runtime.sendMessage({ type: "AUDIO_DATA", data: inputData });
    };
  }
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "STOP_RECORDING") {
    document.body.style.backgroundColor = "white";
    console.log("Recording stopped");
  }
});
