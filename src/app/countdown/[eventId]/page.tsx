"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export default function RsvpPage() {
    const params = useParams();
  const eventId = params.eventId;

  const eventQuery = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      return await supabase.from('events').select().eq('id', eventId as string).single()
    },
    enabled: Boolean(eventId)
  })

  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  function getTimeLeft() {
    if (!eventQuery.data?.data?.event_date) return;

    const now = new Date().getTime();
    const target = new Date(eventQuery.data?.data?.event_date).getTime();
    const difference = target - now;

    if (difference <= 0) {
      return null;
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)) || 0,
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24) || 0,
      minutes: Math.floor((difference / (1000 * 60)) % 60) || 0,
      seconds: Math.floor((difference / 1000) % 60) || 0,
    };
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [eventQuery.data?.data?.event_date]);

  return (
    <div className="flex justify-center items-center text-center space-x-2 md:space-x-4 font-serif">
      <div className="flex flex-col">
        <span className="text-4xl md:text-8xl font-bold">{timeLeft?.days || 0}:</span>
        <span className="mt-2 text-sm md:text-xl">Days</span>
      </div>
      <div className="flex flex-col">
        <span className="text-4xl md:text-8xl font-bold">{timeLeft?.hours || 0}:</span>
        <span className="mt-2 text-sm md:text-xl">Hours</span>
      </div>
      <div className="flex flex-col">
        <span className="text-4xl md:text-8xl font-bold">{timeLeft?.minutes || 0}:</span>
        <span className="mt-2 text-sm md:text-xl">Minutes</span>
      </div>
      <div className="flex flex-col">
        <span className="text-4xl md:text-8xl font-bold text-red-500">{timeLeft?.seconds || 0}</span>
        <span className="mt-2 text-sm md:text-xl text-red-500">Seconds</span>
      </div>
    </div>
  );
}