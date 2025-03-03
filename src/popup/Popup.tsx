// @ts-nocheck

import { useEffect, useState } from "react";

const Popup = () => {
  const [url, setUrl] = useState("");
  let mediaRecorder;
  let recordedChunks = [];

  // Function to play captured audio to the user
  function playCapturedAudio(stream) {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(audioContext.destination);
  }

  const handleStartRecording = async () => {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "micCaptureStart" });
      });

      // Capture the current tab's audio and video
      const stream = await new Promise((resolve, reject) => {
        chrome.tabCapture.capture({ audio: true, video: true }, (stream) => {
          if (chrome.runtime.lastError || !stream) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            playCapturedAudio(stream);
            resolve(stream);
          }
        });
      });

      // Initialize MediaRecorder
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };
      // mediaRecorder.onstop = () => {
      //   const blob = new Blob(recordedChunks, { type: "video/webm" });
      //   const url = URL.createObjectURL(blob);
      //   setUrl(url);
      //   recordedChunks = [];
      // };

      mediaRecorder.start();
    } catch (error) {
      console.error("Error starting capture:", error);
    }
  };

  const handleStopRecording = async () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "micCaptureStop" });
      });
    }
  };

  useEffect(() => {
    chrome.runtime.onMessage.addListener(
      async (message, sender, sendResponse) => {
        if (message.type === "micRecordingStopped") {
          console.log("Recording stopped");

          let micAudioBlob;
          let videoBlob = new Blob(recordedChunks, { type: "video/webm" });

          try {
            micAudioBlob = await fetch(message.data)
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
          console.log("audio Blob", videoBlob);
        }
      }
    );
  }, []);

  return (
    <div className="w-[550px]">
      <h2>Audio Capture</h2>
      <button className="px-4 py-2 bg-green-500" onClick={handleStartRecording}>
        Start Recording
      </button>
      <button className="px-4 py-2 bg-red-500" onClick={handleStopRecording}>
        Stop Recording
      </button>

      <div className="p-2 bg-yellow-500">
        {url && <video controls src={url} className="w-[500px]" />}
      </div>
    </div>
  );
};

export default Popup;
