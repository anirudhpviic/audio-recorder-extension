import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import api from "../api/config";
import { Toaster } from "react-hot-toast";
import MoMViewer from "../components/MomViewer";

const Home = () => {
  const [moMs, setMoMs] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMoMs = async () => {
    try {
      const res = await api.get("/mom");
      setMoMs(res.data.data.moms);

      if (isRefreshing) {
        setIsRefreshing(false);
      }
    } catch (error) {
      console.log("Error fetching MoMs:", error);
    }
  };

  useEffect(() => {
    fetchMoMs();
  }, []);

  useEffect(() => {
    if (isRefreshing) {
      fetchMoMs();
    }
  }, [isRefreshing]);

  return (
    <div className="h-[600px] w-[500px] ">
      <Toaster />
      <NavBar isRefreshing={isRefreshing} setIsRefreshing={setIsRefreshing} />
      <MoMViewer moMs={moMs} setMoMs={setMoMs} isRefreshing={isRefreshing} />
    </div>
  );
};

export default Home;
