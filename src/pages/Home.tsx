import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import api from "../api/config";
import { Toaster } from "react-hot-toast";
import MoMViewer from "../components/MomViewer";

const Home = () => {
  const [moMs, setMoMs] = useState([]);

  useEffect(() => {
    const fetchMoMs = async () => {
      try {
        const res = await api.get("/mom");
        setMoMs(res.data.data.moms);
      } catch (error) {
        console.log("Error fetching MoMs:", error);
      }
    };

    fetchMoMs();
  }, []);

  return (
    <div className="h-[600px] w-[500px] ">
      <Toaster />
      <NavBar />
      <MoMViewer moMs={moMs} setMoMs={setMoMs} />
    </div>
  );
};

export default Home;
