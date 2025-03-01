// @ts-nocheck
import React, { useState } from "react";

const Popup: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);

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
    </div>
  );
};

export default Popup;
