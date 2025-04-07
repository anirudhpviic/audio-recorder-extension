import { useEffect, useRef, useState } from "react";
import NavBar from "../components/NavBar";
import api from "../api/config";
import { Toaster } from "react-hot-toast";
import MoMViewer from "../components/MomViewer";

const Home = () => {
  const [moMs, setMoMs] = useState<any>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCounts, setTotalCounts] = useState(0);
  const observer = useRef<any>(null);
  const limit = 10; // Number of items to fetch per request

  const fetchMoMs = async () => {
    try {
      if (!isRefreshing) {
        setIsLoading(true);
      }
      const res = await api.get(
        `/mom?limit=${limit}&page=${moMs.length / limit + 1}`
      );
      setMoMs((prev: any) => [...prev, ...res.data.data.moms]);
      setTotalCounts(res.data.data.totalCounts);
      if (isRefreshing) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
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
      setMoMs([]);
      setTotalCounts(0);
      fetchMoMs();
    }
  }, [isRefreshing]);

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
      <NavBar isRefreshing={isRefreshing} setIsRefreshing={setIsRefreshing} />
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
