import { useEffect, useRef, useState } from "react";
import NavBar from "../components/NavBar";
import api from "../api/config";
import { Toaster } from "react-hot-toast";
import MoMViewer from "../components/MomViewer";
import PopupInput from "../components/PopupInput";

const Home = () => {
  const [moMs, setMoMs] = useState<any>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCounts, setTotalCounts] = useState(0);
  const [page, setPage] = useState(1);
  const [showNameInputPopup, setShowNameInputPopup] = useState(false);
  const observer = useRef<any>(null);
  const limit = 10; // Number of items to fetch per request

  const handleTogglePopup = () => {
    setShowNameInputPopup(!showNameInputPopup);
  };

  const fetchMoMs = async () => {
    try {
      if (!isRefreshing) {
        setIsLoading(true);
      }
      const res = await api.get(`/mom?limit=${limit}&page=${page}`);
      setMoMs((prev: any) => [...prev, ...res.data.data.moms]);
      setTotalCounts(res.data.data.totalCounts);
      setPage((prev) => prev + 1);
      if (isRefreshing) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching MoMs:", error);
    }
  };

  useEffect(() => {
    fetchMoMs();
  }, []);

  useEffect(() => {
    if (isRefreshing) {
      setMoMs([]);
      setTotalCounts(0);
      setPage(1);
    }
  }, [isRefreshing]);

  useEffect(() => {
    if (isRefreshing && moMs.length === 0 && totalCounts === 0 && page === 1) {
      fetchMoMs();
    }
  }, [isRefreshing, moMs, totalCounts, page]);

  useEffect(() => {
    if (moMs.length === totalCounts) return; // No more items to fetch
    if (observer.current) observer.current.disconnect();

    const lastItemIndex = moMs.length - 3; // Watch 3rd last item
    if (lastItemIndex < 0) return;

    const target = document.getElementById(`mom-${lastItemIndex}`);
    if (!target) return;

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchMoMs();
      }
    });

    observer.current.observe(target);
  }, [moMs]);

  return (
    <div className="h-[600px] w-[500px] flex flex-col pt-16">
      <Toaster />
      {showNameInputPopup && <PopupInput onClose={handleTogglePopup} />}
      <NavBar isRefreshing={isRefreshing} setIsRefreshing={setIsRefreshing} handleToggleNameInputPopup={handleTogglePopup}  />
      <MoMViewer
        moMs={moMs}
        setMoMs={setMoMs}
        isRefreshing={isRefreshing}
        isLoading={isLoading}
        totalCounts={totalCounts}
      />
    </div>
  );
};

export default Home;
