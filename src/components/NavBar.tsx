import { RefreshCw, SlidersVertical, Upload } from "lucide-react";
import MeetRecorder from "./MeetRecorder";
import { useNavigate } from "react-router-dom";

const NavBar = ({
  setIsRefreshing,
  isRefreshing,
}: {
  setIsRefreshing: any;
  isRefreshing: boolean;
}) => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 z-10 flex w-full gap-2 bg-white border-b border-gray-200">
      <MeetRecorder />
      <div className="flex items-center gap-4 mr-2 ">
        <button title="Upload Files">
          <Upload
            onClick={() => navigate("/upload-files")}
            className="w-5 h-5 text-gray-600"
          />
        </button>
        <button
          title="Refresh"
          onClick={() => setIsRefreshing(true)}
          className={`${isRefreshing && "pointer-events-none opacity-25"}`}
        >
          <RefreshCw
            className={`w-5 h-5 text-gray-600 ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
        </button>
        <button title="Settings">
          <SlidersVertical
            onClick={() => navigate("/settings")}
            className="w-5 h-5 text-gray-600"
          />
        </button>
      </div>
    </div>
  );
};

export default NavBar;
