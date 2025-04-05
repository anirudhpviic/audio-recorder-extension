import { RefreshCcw, SlidersVertical } from "lucide-react";
import MeetRecorder from "./MeetRecorder";

const NavBar = () => {
  return (
    <div className="flex gap-2 border-b border-gray-200">
      <MeetRecorder />
      <div className="flex items-center gap-4 mr-2 ">
        <button title="Refresh">
          <RefreshCcw className="w-5 h-5 text-gray-600" />
        </button>
        <button title="Settings">
          <SlidersVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default NavBar;
