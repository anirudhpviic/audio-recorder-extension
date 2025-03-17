import { useEffect, useRef, useState } from "react";
import GoogleMeetHeader from "../components/MeetHeader";

const Home = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // const recordingInterval = useRef<any>(null); // Use ref

  // const handleClick = async () => {
  //   setIsRecording(!isRecording);
  //   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  //     chrome.runtime.sendMessage({ type: "click", tabId: tabs[0].id });
  //   });
  // };

  // useEffect(() => {
  //   chrome.tabs.query({ active: true, currentWindow: true }, () => {
  //     chrome.runtime.sendMessage({ type: "get-recording-status" });
  //   });
  //   chrome.runtime.onMessage.addListener((message) => {
  //     if (message.type === "return-recording-status") {
  //       setIsRecording(message.isRecording);
  //       setRecordingTime(message.recordingTime);
  //     }
  //   });
  // }, []);

  // useEffect(() => {
  //   console.log("isRecording:::", isRecording);
  //   if (isRecording) {
  //     recordingInterval.current = setInterval(() => {
  //       setRecordingTime((prevTime) => prevTime + 1);
  //     }, 1000);
  //   } else {
  //     if (recordingInterval.current) {
  //       clearInterval(recordingInterval.current);
  //       recordingInterval.current = null;
  //     }
  //   }

  //   return () => {
  //     if (recordingInterval.current) {
  //       clearInterval(recordingInterval.current);
  //     }
  //   };
  // }, [isRecording]);

  return (
    <div
      style={{
        width: "500px",
        height: "600px",
      }}
    >
      <GoogleMeetHeader/>
      {/* <h1>Recording Time: {recordingTime}</h1> */}
      {/* {isRecording ? (
        <button onClick={handleClick} className="p-2 bg-red-500">
          Stop Recording
        </button>
      ) : (
        <button onClick={handleClick} className="p-2 bg-green-500">
          Start Recording
        </button>
      )} */}

      
    </div>
  );
};

export default Home;
