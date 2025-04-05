import { RefreshCw, SlidersVertical } from "lucide-react";
import MeetRecorder from "./MeetRecorder";

const NavBar = ({
  setIsRefreshing,
  isRefreshing,
}: {
  setIsRefreshing: any;
  isRefreshing: boolean;
}) => {
  return (
    <div className="flex gap-2 border-b border-gray-200">
      <MeetRecorder />
      <div className="flex items-center gap-4 mr-2 ">
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
          <SlidersVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default NavBar;
