import { useState } from "react";

const PopupInput = ({ onClose }: { onClose: () => void }) => {
  const [participantsArr, setParticipantsArr] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !participantsArr.includes(trimmed)) {
      setParticipantsArr((prev) => [...prev, trimmed]);
      setInputValue("");
    }
  };

  const handleRemove = (index: number) => {
    setParticipantsArr((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="p-6 bg-white rounded-lg shadow-lg w-96">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Add Participants
        </h2>
        <div className="flex mb-4 space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Enter participant name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
        <ul className="mb-4 space-y-2">
          {participantsArr.map((participant, index) => (
            <li
              key={index}
              className="flex items-center justify-between px-3 py-2 bg-gray-100 rounded"
            >
              <span>{participant}</span>
              <button
                onClick={() => handleRemove(index)}
                className="p-1 ml-2 text-gray-500 hover:text-red-500"
                title="Remove"
              >
                {/* Cross Icon SVG */}
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 6L6 18M6 6l12 12"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-800 bg-gray-300 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupInput;
