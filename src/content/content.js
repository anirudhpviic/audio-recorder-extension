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
  if (request.action === "micCaptureStart") {
    console.log("micCaptureStart");
    startRecording();
  } else if (request.action === "micCaptureStop") {
    console.log("micCaptureStop");
    const chunks = await stopRecording();
    const blob = new Blob(chunks, { type: "audio/webm" });

    // console.log("blob", blob);
    // const url = URL.createObjectURL(blob);
    // window.open(url, "_blank");

    const base64Data = await blobToBase64(blob);

    mediaRecorder = undefined;
    recordedChunks = [];

    // if (mediaRecorder.state === "inactive") {
    chrome.runtime.sendMessage({
      type: "micRecordingStopped",
      data: base64Data,
    });

    // }
  }
  return true;
});

async function startRecording() {
  console.log("start recording");
  try {
    const stream = await new Promise((resolve, reject) => {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: false,
        })
        .then((stream) => {
          resolve(stream);
        })
        .catch((error) => {
          reject(error);
        });
    });

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
