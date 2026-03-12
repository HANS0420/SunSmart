import { useState, useEffect } from "react";

export function useUVData(latitude, longitude) {
  const [uvIndex, setUvIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (latitude == null || longitude == null) return;

    async function fetchUV() {
      setLoading(true);
      setError(null);
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=uv_index&timezone=auto&forecast_days=1`;
        const res = await fetch(url);
        const data = await res.json();

        
        const now = new Date();
        const currentHour = now.getHours();
        const currentUV = data.hourly.uv_index[currentHour];

        setUvIndex(Math.round(currentUV));
      } catch (err) {
        setError("Failed to fetch UV data");
      } finally {
        setLoading(false);
      }
    }

    fetchUV();
  }, [latitude, longitude]);

  return { uvIndex, loading, error };
}