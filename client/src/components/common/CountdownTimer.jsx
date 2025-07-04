import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CountdownTimer = ({ endTime, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const difference = end - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        if (onComplete) onComplete();
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime, onComplete]);

  const formatTime = (value) => String(value).padStart(2, '0');

  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
      <div className="flex items-center space-x-2 text-sm">
        <Clock className="w-4 h-4" />
        <span>Time Remaining</span>
      </div>
      <div className="text-2xl font-bold">
        {formatTime(timeLeft.hours)}:
        {formatTime(timeLeft.minutes)}:
        {formatTime(timeLeft.seconds)}
      </div>
    </div>
  );
};

export default CountdownTimer;