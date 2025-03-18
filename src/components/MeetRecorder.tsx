import { Mic, MicOff } from "lucide-react";

type MeetRecorderProps = {
  isRecording: boolean;
  recordingTime: number;
  meetId: string;
  handleClick: () => Promise<void>;
};

const MeetRecorder = ({
  isRecording,
  recordingTime,
  meetId,
  handleClick,
}: MeetRecorderProps) => {
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
          <span className="mx-1 text-gray-600">{meetId}</span>
          <button className="p-1 ml-1">
            <svg
              className="w-4 h-4 text-gray-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
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
