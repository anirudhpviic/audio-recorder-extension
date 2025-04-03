import { useEffect, useRef, useState } from "react";
import MeetRecorder from "../components/MeetRecorder";
import api from "../api/config";
// import { moms } from "../mocks/moms";
import { Toaster } from "react-hot-toast";
import MoMViewer from "../components/MomViewer";

const Home = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [meetId, setMeetId] = useState("");
  const [moMs, setMoMs] = useState([]);

  const recordingInterval = useRef<any>(null); // Use ref

  const handleClick = async () => {
    setIsRecording(!isRecording);

    if (!isRecording) {
      setRecordingTime(0);
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.runtime.sendMessage({ type: "click", tabId: tabs[0].id });
    });
  };

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, () => {
      chrome.runtime.sendMessage({ type: "get-recording-status" });
    });
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === "return-recording-status") {
        setIsRecording(message.isRecording);
        setRecordingTime(message.recordingTime);
      }
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // @ts-ignore
      chrome.tabs.sendMessage(tabs[0].id, { action: "get-meeting-id" });
    });

    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === "return-meeting-id") {
        setMeetId(message.data);
      }
    });
  }, []);

  useEffect(() => {
    console.log("isRecording:::", isRecording);
    if (isRecording) {
      recordingInterval.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
    }

    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, [isRecording]);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, () => {
      chrome.runtime.sendMessage({ type: "set-meeting-id", data: meetId });
    });
  }, [meetId]);

  useEffect(() => {
    const fetchMoMs = async () => {
      try {
        const res = await api.get("/audio");
        setMoMs(res.data.data.moms);
      } catch (error) {
        console.log("Error fetching MoMs:", error);
      }
    };

    fetchMoMs();
  }, []);

  return (
    <div className="h-[600px] w-[500px] ">
      <Toaster />

      <MeetRecorder
        isRecording={isRecording}
        recordingTime={recordingTime}
        meetId={meetId}
        handleClick={handleClick}
        setMeetId={setMeetId}
      />

      <MoMViewer moMs={moMs} />
    </div>
  );
};

export default Home;
