import { Mic, MicOff, Pencil, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MeetRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [meetId, setMeetId] = useState("");
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [isInputDisable, setIsInputDisable] = useState(true);
  const recordingInterval = useRef<any>(null);

  // record start or stop
  const handleClick = async () => {
    setIsRecording(!isRecording);

    if (!isRecording) {
      setRecordingTime(0);
    }

    // send to background script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.runtime.sendMessage({
        type: "record-start-or-stop",
        tabId: tabs[0].id,
      });
    });
  };

  useEffect(() => {
    // send to background script
    chrome.tabs.query({ active: true, currentWindow: true }, () => {
      chrome.runtime.sendMessage({ type: "get-recording-status" });
    });

    // send to meet content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // @ts-ignore
      chrome.tabs.sendMessage(tabs[0].id, { action: "is-in-meeting" });
    });

    // send to background script
    chrome.tabs.query({ active: true, currentWindow: true }, () => {
      chrome.runtime.sendMessage({ type: "get-stored-meeting-id" });
    });

    const handleMessage = (message: any) => {
      // from background script
      if (message.type === "return-recording-status") {
        setIsRecording(message.isRecording);
        setRecordingTime(message.recordingTime);
        console.log("isRecording", message);
      }

      // from meet content script
      if (message.type === "return-meeting-id") {
        setMeetId(message.data);
      }

      // from meet content script
      if (message.type === "return-is-in-meeting") {
        setIsInMeeting(message.data);
      }

      // from background script
      if (message.type === "return-stored-meeting-id") {
        if (message.meetId) {
          setMeetId(message.meetId);
        } else {
          // send to meet content script
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            // @ts-ignore
            chrome.tabs.sendMessage(tabs[0].id, { action: "get-meeting-id" });
          });
        }
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      recordingInterval.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!isRecording) {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
        setMeetId("");
      }
    }

    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, [isRecording]);

  useEffect(() => {
    // send to background script
    chrome.tabs.query({ active: true, currentWindow: true }, () => {
      chrome.runtime.sendMessage({ type: "set-meeting-id", data: meetId });
    });
  }, [meetId]);

  return (
    <div
      className={`flex flex-1 items-center justify-between p-3 bg-white  ${
        !isInMeeting ? "pointer-events-none opacity-25" : ""
      }`}
      aria-disabled={!isInMeeting}
    >
      <div className="flex items-center">
        <div className="flex mr-2">
          <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 4H20V16H5.17L4 17.17V4ZM4 2C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2H4ZM6 12H18V14H6V12ZM6 9H18V11H6V9ZM6 6H18V8H6V6Z"
              fill="#1A73E8"
            />
          </svg>
        </div>
        <div className="flex items-center">
          <span className="mx-1 font-medium text-gray-800">Meet –</span>
          <input
            type="text"
            value={meetId}
            className={`mx-1 px-2 py-1 text-gray-600 outline-none bg-gray-50 ${
              isInputDisable ? "border-none" : "border border-black"
            }`}
            disabled={isInputDisable}
            onChange={(e) => setMeetId(e.target.value)}
          />
          <button
            className="p-1 ml-1"
            onClick={() => setIsInputDisable(!isInputDisable)}
          >
            {isInputDisable ? (
              <Pencil className="w-4 h-4 text-gray-600" />
            ) : (
              <Save className="w-4 h-4 text-green-600" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center">
        <div className="flex items-center mr-4">
          {isRecording && (
            <span className="mr-1 text-sm font-medium text-gray-600">
              {`${Math.floor(recordingTime / 3600)
                .toString()
                .padStart(2, "0")}:${Math.floor((recordingTime % 3600) / 60)
                .toString()
                .padStart(2, "0")}:${(recordingTime % 60)
                .toString()
                .padStart(2, "0")}`}
            </span>
          )}
        </div>

        <button
          onClick={handleClick}
          className="p-2 bg-white border border-gray-300 rounded-full hover:bg-gray-100"
        >
          <div className="flex items-center justify-center w-6 h-6">
            {isRecording ? (
              <MicOff className="w-5 h-5 text-red-600" />
            ) : (
              <Mic className="w-5 h-5 text-green-600" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
};

export default MeetRecorder;
