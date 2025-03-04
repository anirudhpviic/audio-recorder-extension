// @ts-nocheck

import { useEffect, useState } from "react";

const Popup = () => {
  const [url, setUrl] = useState("");

  const handleStartRecording = async () => {
    // chrome.runtime.sendMessage({ type: "startRecording" });
    chrome.runtime.sendMessage({ type: "startOrStopRecoding" });
  };

  const handleStopRecording = async () => {
    // chrome.runtime.sendMessage({ type: "stopRecording" });
    chrome.runtime.sendMessage({ type: "startOrStopRecoding" });
  };
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
