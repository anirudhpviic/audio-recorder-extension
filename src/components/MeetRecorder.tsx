import { Mic, MicOff, Pencil, Save } from "lucide-react";
import { useState } from "react";

type MeetRecorderProps = {
  isRecording: boolean;
  recordingTime: number;
  meetId: string;
  handleClick: () => Promise<void>;
  handleMeetIdChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const MeetRecorder = ({
  isRecording,
  recordingTime,
  meetId,
  handleClick,
  handleMeetIdChange,
}: MeetRecorderProps) => {
  const [isInputDisable, setIsInputDisable] = useState(true);
  return (
    <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200">
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
            className={`mx-1 text-gray-600 border-none outline-none ${isInputDisable ? "bg-white" :"bg-gray-100"}`}
            disabled={isInputDisable}
            onChange={handleMeetIdChange}
            
          />
          <button
            className="p-1 ml-1"
            onClick={() => setIsInputDisable((prev) => !prev)}
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
          <span className="ml-1 text-sm font-medium text-gray-600">
            {isRecording ? "Recording..." : "Record"}
          </span>
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
