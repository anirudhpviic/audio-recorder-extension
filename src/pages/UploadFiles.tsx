import { ArrowBigLeft } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/config";
import toast, { Toaster } from "react-hot-toast";

const UploadFiles = () => {
  const [uploadType, setUploadType] = useState<string>("audio"); // State to track selected upload type
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [micAudioFile, setMicAudioFile] = useState<File | null>(null);
  const [tabAudioFile, setTabAudioFile] = useState<File | null>(null);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = event.target.files?.[0];
    setFile(file || null);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("fileType", uploadType);

    if (uploadType === "audio" && audioFile) {
      formData.append("audio", audioFile);
    } else if (uploadType === "video" && videoFile) {
      formData.append("video", videoFile);
    } else if (uploadType === "mic-tab" && micAudioFile && tabAudioFile) {
      formData.append("micAudio", micAudioFile);
      formData.append("tabAudio", tabAudioFile);
    }

    try {
      setIsLoading(true);
      await api.post("/mom/upload-files", formData);
      setIsLoading(false);
      toast.success("File uploaded! Check back in a few moments.", {
        duration: 5000,
        position: "bottom-center",
      });
    } catch (error) {
      setIsLoading(false);
      console.error("Error uploading files:", error);
    }
  };

  const handleUploadType = (event: any) => {
    setAudioFile(null);
    setVideoFile(null);
    setMicAudioFile(null);
    setTabAudioFile(null);
    setUploadType(event.target.value);
  };

  useEffect(() => {
    if (audioFile || videoFile || (micAudioFile && tabAudioFile)) {
      setIsSubmitDisabled(false);
    } else {
      setIsSubmitDisabled(true);
    }
  }, [audioFile, videoFile, micAudioFile, tabAudioFile]);

  return (
    <div className="w-[400px] flex flex-col p-6">
      <Toaster />
      <div className="flex items-center gap-2 py-2 mb-6">
        <ArrowBigLeft
          onClick={() => window.history.back()}
          className="w-5 h-5 cursor-pointer"
        />
        <h1 className="ml-2 text-lg font-bold">Upload Files</h1>
      </div>

      {/* Radio Buttons for Upload Type */}
      <div className="flex flex-col gap-2 ">
        <label className="font-medium">Select Upload Type:</label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="uploadType"
              value="audio"
              checked={uploadType === "audio"}
              onChange={handleUploadType}
            />
            Audio
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="uploadType"
              value="video"
              checked={uploadType === "video"}
              onChange={handleUploadType}
            />
            Video
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="uploadType"
              value="mic-tab"
              checked={uploadType === "mic-tab"}
              onChange={handleUploadType}
            />
            Mic & Tab Audio
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-2 py-4 ">
        {uploadType === "audio" && (
          <div>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => handleFileChange(e, setAudioFile)}
            />
          </div>
        )}
        {uploadType === "video" && (
          <div>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleFileChange(e, setVideoFile)}
            />
          </div>
        )}
        {uploadType === "mic-tab" && (
          <div className="flex flex-col gap-2 ">
            <div>
              <label className="block mb-2 font-medium">Mic</label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => handleFileChange(e, setMicAudioFile)}
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Tab</label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => handleFileChange(e, setTabAudioFile)}
              />
            </div>
          </div>
        )}
        <button
          disabled={isSubmitDisabled}
          onClick={handleSubmit}
          className={`px-4 py-2 mt-4 text-white bg-green-500 rounded hover:bg-green-600 ${
            isSubmitDisabled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer"
          }`}
        >
          {isLoading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
};

export default UploadFiles;
