// @ts-nocheck
import React, { useEffect, useState } from "react";

const Popup: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);

  const handleStartRecording = () => {
    setIsRecording(true);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "START_RECORDING" });
    });
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "STOP_RECORDING" });
    });
  };

  useEffect(() => {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === "AUDIO_BLOB") {
        console.log("final record");
        const base64 = message.data;

        // Convert Base64 to Blob
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "audio/wav" });

        // Create URL for playback & download
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
      }
    });
  }, []);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Meeting Recorder</h1>
      {!isRecording ? (
        <button
          onClick={handleStartRecording}
          className="px-4 py-2 text-white bg-green-500"
        >
          Start Recording
        </button>
      ) : (
        <button
          onClick={handleStopRecording}
          className="px-4 py-2 text-white bg-red-500"
        >
          Stop Recording
        </button>
      )}
      {audioURL && (
        <div style={{ marginTop: "20px" }}>
          <audio controls>
            <source src={audioURL} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
          <br />
          <a href={audioURL} download="meeting_audio.wav">
            <button className="px-4 py-2 text-white bg-blue-500">
              Download Recording
            </button>
          </a>
        </div>
      )}
    </div>
  );
};

export default Popup;
