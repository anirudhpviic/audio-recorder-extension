import { ArrowBigLeft, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { getToken } from "../utils/get-token";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const getUser = async () => {
    const user: any = await getToken("user");
    if (user) {
      setEmail(user.email);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  const handleLogout = async () => {
    await chrome.storage.local.clear();
    navigate("/login");
  };

  return (
    <div className="w-[400px] flex flex-col p-6">
      <div className="flex items-center gap-2 py-2 border-b border-gray-200">
        <ArrowBigLeft
          onClick={() => window.history.back()}
          className="w-5 h-5 cursor-pointer"
        />
        <h1 className="ml-2 text-lg font-bold">Settings</h1>
      </div>

      <div className="h-[20vh]"></div>
      <div className="flex items-start justify-between py-2 border-t border-gray-200">
        <h3>{email}</h3>
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={handleLogout}
        >
          <h3 className="text-gray-700">Logout</h3>
          <LogOut className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default Settings;
