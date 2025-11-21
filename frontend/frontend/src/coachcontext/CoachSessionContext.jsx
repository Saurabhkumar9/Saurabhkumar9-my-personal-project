import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

export const CoachSessionContext = createContext();

export const CoachSessionProvider = ({ children }) => {
  const [coachSession, setCoachSession] = useState(null);
  const [coachBatch, setCoachBatches] = useState([]);
  const [loadingCoach, setLoadingCoach] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    // If no user or no token → just stop, no logout
    if (!storedUser || !storedToken) {
      setLoadingCoach(false);
      return;
    }

    let user = null;
    try {
      user = JSON.parse(storedUser);
    } catch {
      setLoadingCoach(false);
      return;
    }

    // If user is not coach → do not logout, simply do not fetch
    if (!user || user.role !== "coach") {
      setCoachSession(null);
      setLoadingCoach(false);
      return;
    }

    // Load coach data
    loadCoachData(user.id, storedToken);
  }, []);

  const loadCoachData = async (coachId, token) => {
    try {
      console.log(token)
console.log(import.meta.env.VITE_BASE_URL)
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/coach/fetch-coach-details`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // If valid response
      if (res?.data?.success && res?.data?.coach) {
        setCoachSession(res.data.coach);
        if (res?.data?.coach?.status === "active") {
          if (res?.data?.batches) {
            setCoachBatches(res.data.batches);
            
          }
        }
      } else {
        // Do NOT logout → simply clear coachSession
        setCoachSession(null);
      }
    } catch (err) {
      console.error("Failed to load coach data:", err);
      setCoachSession(null); // No logout
    }

    setLoadingCoach(false);
  };

  return (
    <CoachSessionContext.Provider
      value={{ coachSession, loadingCoach, coachBatch }}
    >
      {children}
    </CoachSessionContext.Provider>
  );
};

export const useCoachSession = () => useContext(CoachSessionContext);
