import axios from "axios";
import { useEffect, useState } from "react";

const Popup = () => {
  const [tabUrl, setTabUrl] = useState("");
  const [micUrl, setMicUrl] = useState("");

  const handleClick = async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.runtime.sendMessage({ type: "click", tabId: tabs[0].id });
    });
  };

  useEffect(() => {
    chrome.runtime.onMessage.addListener(async (message) => {
      if (message.type === "micAndTabRecordingStopped") {
        console.log("Recording stopped");
        const micBlob = await fetch(message.data.micAudioBuffer)
          .then((res) => res.blob())
          .then((blob) => {
            return blob;
          })
          .catch((error) => {
            console.error("Error converting Base64 to Blob:", error);
          });

        const tabBlob = await fetch(message.data.tabAudioBuffer)
          .then((res) => res.blob())
          .then((blob) => {
            return blob;
          })
          .catch((error) => {
            console.error("Error converting Base64 to Blob:", error);
          });

        console.log("mic audio blob", micBlob);
        console.log("tab audio Blob", tabBlob);

        // @ts-ignore
        setMicUrl(URL.createObjectURL(micBlob));
        // @ts-ignore
        setTabUrl(URL.createObjectURL(tabBlob));

        const formData = new FormData();
        // @ts-ignore
        formData.append("micAudio", micBlob, "micAudio.webm");
        // @ts-ignore
        formData.append("tabAudio", tabBlob, "tabAudio.webm");

        try {
          const res = await axios.post("http://localhost:3000/audio", formData);
          console.log("res", res);
        } catch (error) {}
      }
    });
  }, []);

  return (
    <div
      style={{
        width: "300px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      Popup
      <button
        style={{ padding: "10px", backgroundColor: "green" }}
        onClick={handleClick}
      >
        click
      </button>
      mic:
      {micUrl && <audio controls src={micUrl} />}
      tab:
      {tabUrl && <audio controls src={tabUrl} />}
    </div>
  );
};

export default Popup;
