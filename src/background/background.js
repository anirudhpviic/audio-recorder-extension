console.log("background.js loaded");

let recording = false;

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type === "startOrStopRecoding") {
    recording = !recording;
    console.log("request:", request);

    if (recording) {
      // chrome.action.setIcon({ path: "../../public/icons/recording.png" });

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "micCaptureStart" });
      });

      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const streamId = await chrome.tabCapture.getMediaStreamId({
          targetTabId: tabs[0].id,
        });
        // chrome.tabs.sendMessage(tabs[0].id, {
        //   action: "tabCaptureStart",
        //   data: streamId,
        // });

        const tabStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            mandatory: {
              chromeMediaSource: "tab",
              chromeMediaSourceId: streamId,
            },
          },
        });

        console.log("tabStream:", tabStream);
      });
    } else {
      // chrome.action.setIcon({ path: "../../public/icons/not-recording.png" });

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "micCaptureStop" });
      });

      // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      //   chrome.tabs.sendMessage(tabs[0].id, { action: "tabCaptureStop" });
      // });
    }
  } else if (request.type === "micRecordingStopped") {
    console.log("Mic Recording stopped");

    let micAudioBlob;

    try {
      micAudioBlob = await fetch(request.data)
        .then((res) => res.blob())
        .then((blob) => {
          return blob;
        })
        .catch((error) => {
          console.error("Error converting Base64 to Blob:", error);
        });
    } catch (error) {
      console.error("Error fetching audio blob:", error);
    }

    console.log("mic audio blob", micAudioBlob);
  } else if (request.type === "tabRecordingStopped") {
    console.log("Tab Recording stopped");

    let tabAudioBlob;

    try {
      tabAudioBlob = await fetch(request.data)
        .then((res) => res.blob())
        .then((blob) => {
          return blob;
        })
        .catch((error) => {
          console.error("Error converting Base64 to Blob:", error);
        });
    } catch (error) {
      console.error("Error fetching audio blob:", error);
    }

    console.log("tab audio blob", tabAudioBlob);
  }
});
