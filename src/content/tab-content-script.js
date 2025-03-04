let mediaRecorder;
let recordedChunks = [];

function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob); // Convert Blob to Base64
    reader.onloadend = () => resolve(reader.result);
  });
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "tabCaptureStart") {
    console.log("tabCaptureStart");
    console.log("request data:", request);
    startRecording(request.data);
  } else if (request.action === "tabCaptureStop") {
    const chunks = await stopRecording();
    const blob = new Blob(chunks, { type: "audio/webm" });
    const base64Data = await blobToBase64(blob);

    chrome.runtime.sendMessage({
      type: "tabRecordingStopped",
      data: base64Data,
    });
  }
  return true;
});

// Function to play captured audio to the user
function playCapturedAudio(stream) {
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(audioContext.destination);
}

async function getTabMedia(streamId) {
  return await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: "tab",
        chromeMediaSourceId: streamId,
      },
    },
    // video: {
    //   mandatory: {
    //     chromeMediaSource: "tab",
    //     chromeMediaSourceId: streamId,
    //   },
    // },
  });
}

async function startRecording(streamId) {
  console.log("start recording");
  console.log("streamId:", streamId);
  try {
    // const stream = await new Promise((resolve, reject) => {
    //   navigator.mediaDevices
    //     .getUserMedia({
    //       //   audio: {
    //       //     mandatory: {
    //       //       chromeMediaSource: "tab",
    //       //       chromeMediaSourceId: streamId,
    //       //     },
    //       //   },
    //       audio: true,
    //     })
    //     .then((stream) => {
    //       console.log("stream:", stream);
    //       //   playCapturedAudio(stream);
    //       resolve(stream);
    //     })
    //     .catch((error) => {
    //       reject(error);
    //     });
    // });

    const stream = await getTabMedia(streamId);

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
        console.log("data:", event.data);
      }
    };

    mediaRecorder.start();
  } catch (error) {
    console.error(error);
  }
}

async function stopRecording() {
  return new Promise((resolve) => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.onstop = () => {
        resolve(recordedChunks);
      };
      mediaRecorder.stop();
      console.log("recordedChunks:", recordedChunks);
    } else {
      resolve([]);
    }
  });
}
