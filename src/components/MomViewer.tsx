import { CircleCheck, CircleX, Copy, Edit } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "react-hot-toast";
import { useState } from "react";
import api from "../api/config";

const MoMViewer = ({
  moMs,
  setMoMs,
  isRefreshing,
}: {
  moMs: any;
  setMoMs: any;
  isRefreshing: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editMomId, setEditMomId] = useState("");
  const [editMoM, setEditMoM] = useState("");

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!", {
      duration: 2000,
      position: "bottom-center",
    });
  };

  const handleSave = async () => {
    console.log("mom hi: ", editMoM);
    console.log("mom id: ", editMomId);
    try {
      setIsEditing(false);
      setEditMomId("");
      toast.success("Edit would be reflect after some time!", {
        duration: 2000,
        position: "bottom-center",
      });
      const response = await api.put("/mom", {
        momId: editMomId,
        momCopyFormat: editMoM,
      });

      console.log("Response from server:", response.data);

      const updatedMoMs = moMs.map((mom: any) => {
        if (mom._id === editMomId) {
          return response.data.data;
        }
        return mom;
      });

      console.log("Updated MoMs:", updatedMoMs);
      setMoMs(updatedMoMs);
      toast.success("Edit saved successfully!", {
        duration: 2000,
        position: "bottom-center",
      });
    } catch (error) {
      console.error("Error saving MoM:", error);
    }
  };

  if (isRefreshing) {
    return (
      <div className="flex items-center justify-center w-full h-full p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg text-gray-600">Refreshing...</h2>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full">
      {!isEditing ? (
        <div className="flex flex-col gap-4 px-2 py-4 rounded-lg">
          {moMs && moMs.length > 0 ? (
            moMs.map(
              ({
                momMarkDownFormat,
                momCopyFormat,
                _id,
              }: {
                momMarkDownFormat: string;
                momCopyFormat: string;
                _id: string;
              }) => (
                <div
                  key={_id}
                  className="relative w-full p-4 border rounded-lg shadow-sm bg-gray-50"
                >
                  <ReactMarkdown>{momMarkDownFormat}</ReactMarkdown>

                  <div className="absolute flex gap-2 top-2 right-2">
                    <button
                      className="p-2 transition bg-gray-100 rounded-lg hover:bg-gray-200"
                      onClick={() => handleCopy(momCopyFormat)}
                      title="Copy"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      className="p-2 transition bg-gray-100 rounded-lg hover:bg-gray-200"
                      onClick={() => {
                        setEditMomId(_id);
                        setIsEditing(true);
                        setEditMoM(momCopyFormat);
                      }}
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                </div>
              )
            )
          ) : (
            <div className="p-8 text-center bg-gray-100 rounded-lg">
              <p>No Minutes of Meeting available</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col h-full gap-4 px-2 py-4 rounded-lg">
          <div className="relative flex flex-1 w-full p-4 border rounded-lg shadow-sm bg-gray-50">
            <div className="absolute flex gap-2 top-6 right-10">
              <button
                className="p-2 transition bg-gray-100 rounded-lg hover:bg-gray-200"
                onClick={handleSave}
                title="Save"
              >
                <CircleCheck size={16} />
              </button>
              <button
                className="p-2 transition bg-gray-100 rounded-lg hover:bg-gray-200"
                onClick={() => {
                  setEditMomId("");
                  setIsEditing(false);
                  setEditMoM("");
                }}
                title="Close"
              >
                <CircleX size={16} />
              </button>
            </div>
            <textarea
              className="flex-1 w-full h-full p-2 text-sm resize-none focus:outline-none"
              value={editMoM}
              onChange={(e) => setEditMoM(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MoMViewer;
