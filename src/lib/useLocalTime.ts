import { useState, useEffect } from 'react';

export const useLocalTime = () => {
  const [localTime, setLocalTime] = useState(() => {
    const now = new Date();
    return {
      time: now.toLocaleTimeString(),
      date: now.toLocaleDateString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      full: now.toString(),
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setLocalTime({
        time: now.toLocaleTimeString(),
        date: now.toLocaleDateString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        full: now.toString(),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return localTime;
};
