import { Copy, Edit } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "react-hot-toast";

const MoMViewer = ({ moMs }: { moMs: any }) => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!", {
      duration: 2000,
      position: "bottom-center",
    });
  };

  const handleEdit = () => {
    // Handle edit functionality here
    toast.success("Edit functionality not implemented yet!", {
      duration: 2000,
      position: "bottom-center",
    });
  };

  return (
    <div className="w-full h-full">
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
                    onClick={() => handleEdit()}
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
    </div>
  );
};

export default MoMViewer;
