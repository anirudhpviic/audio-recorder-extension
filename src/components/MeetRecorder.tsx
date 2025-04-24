import { LoaderCircle, Mic, MicOff, Pencil, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const MeetRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [meetId, setMeetId] = useState("");
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [isInputDisable, setIsInputDisable] = useState(true);
  const recordingInterval = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState(false);

  // record start or stop
  const handleClick = async () => {
    setIsRecording(!isRecording);

    if (!isRecording) {
      setRecordingTime(0);
    }

    if (isRecording) {
      setIsLoading(true);
    }

    // send to background script
    chrome.tabs.query({ active: true, currentWindow: true }, () => {
      chrome.runtime.sendMessage({
        type: "record-start-or-stop",
      });
    });
  };

  const handleMicClick = async () => {
    setIsRecording(!isRecording);

    if (!isRecording) {
      setRecordingTime(0);
    }

    if (isRecording) {
      setIsLoading(true);
    }

    // send to background script
    chrome.tabs.query({ active: true, currentWindow: true }, () => {
      chrome.runtime.sendMessage({
        type: "mic-record-start-or-stop",
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
        if (message.recordStartTime) {
          const time = Math.floor(
            (new Date().getTime() - message.recordStartTime) / 1000
          );

          setRecordingTime(time);
        } else {
          setRecordingTime(0);
        }
      }

      // from meet content script
      if (message.type === "return-meeting-id") {
        setMeetId(message.data);
      }

      // from meet content script
      if (message.type === "return-is-in-meeting") {
        setIsInMeeting(message.data);
        // send to background script
        chrome.tabs.query({ active: true, currentWindow: true }, () => {
          chrome.runtime.sendMessage({
            type: "is-in-meeting-to-background",
            isInMeeting: message.data,
          });
        });
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

      // from background script
      if (message.type === "audio-uploaded") {
        setIsLoading(false);
        toast.success("Meet audio uploaded! Check back in a few moments.", {
          duration: 5000,
          position: "bottom-center",
        });
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
      }
    }

    // send to background script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.runtime.sendMessage({
        type: "tab-id",
        tabId: tabs[0].id,
      });
    });

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

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const currentUrl = currentTab?.url;

      if (!currentUrl) {
        setIsValidUrl(false);
      }

      if (
        currentUrl?.startsWith("chrome://") ||
        currentUrl?.startsWith("chrome-extension://")
      ) {
        setIsValidUrl(false);
      } else {
        setIsValidUrl(true);
      }
    });
  }, []);

  return (
    <div
      className={`flex flex-1 items-center justify-between p-3 bg-white  ${
        !isValidUrl ? "pointer-events-none opacity-25" : ""
      }`}
      aria-disabled={!isValidUrl}
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
          <span className="mx-1 font-medium text-gray-800">Meet: </span>
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
        <div className="flex items-center mr-2">
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
          disabled={isLoading}
          onClick={isInMeeting ? handleClick : handleMicClick}
          className="p-2 bg-white border border-gray-300 rounded-full hover:bg-gray-100"
        >
          <div className="flex items-center justify-center w-6 h-6">
            {isRecording && !isLoading ? (
              <MicOff className="w-5 h-5 text-red-600" />
            ) : (
              !isLoading && <Mic className="w-5 h-5 text-green-600" />
            )}

            {isLoading && (
              <LoaderCircle className="w-5 h-5 text-gray-600 animate-spin" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
};

export default MeetRecorder;
