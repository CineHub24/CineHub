import { type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, gte, lte } from 'drizzle-orm';
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { film, showing } from '$lib/server/db/schema';
import { db } from '$lib/server/db';

interface TimeWindow {
  start: string;
  end: string | null;
  duration: number;
  possibletimes?: string[];
}

export const load = async (event) => {
	
	const selectedFilm = await db.select().from(film).where(eq(film.id, event.params.id as unknown as number));

	return {
		selectedFilm: selectedFilm[0]
	};
};

export const actions = {
  getTimeWindows: async ({ request, locals }) => {
    const data = await request.formData();
    const hallId = Number(data.get('hallId'));
    const filmDate = new Date(data.get('date') as string);
    const filmDuration = Number(data.get('duration'));
    
    if (!hallId || !filmDate || !filmDuration) {
      return fail(400, { error: 'Alle Felder werden benötigt' });
    }

    try {
      const timeWindows = await getAvailableTimeWindows(
        db,
        hallId,
        filmDate,
        filmDuration
      );

      return { success: true, timeWindows };
    } catch (error) {
      return fail(500, { error: 'Server-Fehler beim Abrufen der Zeitfenster' });
    }
  },

  getTimes: async ({ request }) => {
    const data = await request.formData();
    const windowStart = data.get('windowStart') as string;
    const windowEnd = data.get('windowEnd') as string;
    const totalDuration = Number(data.get('totalDuration'));
    
    if (!windowStart || !windowEnd || !totalDuration) {
      return fail(400, { error: 'Alle Felder werden benötigt' });
    }

    const timeWindow = {
      start: windowStart,
      end: windowEnd,
      duration: calculateTimeDifference(windowStart, windowEnd)
    };

    const times = getPossibletimes(timeWindow, totalDuration, 5);
    return { success: true, times };
  }
} satisfies Actions;

async function getAvailableTimeWindows(
  db: PostgresJsDatabase, 
  hallId: number, 
  filmDate: Date, 
  filmDuration: number, 
  cleaningTime: number = 15,    
  advertisementTime: number = 15 
): Promise<TimeWindow[]> {
  const totalDuration = filmDuration + cleaningTime + advertisementTime;
  const dateStr = filmDate.toISOString().split('T')[0];
  const startTimeStr = `${dateStr} 08:00:00`;
  const endTimeStr = `${dateStr} 24:00:00`;

 

  const timeWindows: TimeWindow[] = [];
  let windowStart = "08:00";
  
  const existingShowings = await db.select()
    .from(showing)
    .where(
      and(
        eq(showing.hallid, hallId),
        gte(showing.time, startTimeStr),
        lte(showing.time, endTimeStr)
      )
    )
    .orderBy(showing.time);

  for (const show of existingShowings) {
    const showStart = show.time;
    const timeDiff = showStart ? calculateTimeDifference(windowStart, showStart) : 0;
    
    if (timeDiff >= totalDuration) {
      timeWindows.push({
        start: windowStart,
        end: showStart,
        duration: timeDiff
      });
    }
    windowStart = show.endTime ?? show.time ?? "";
  }
  
  const finalDiff = calculateTimeDifference(windowStart, "24:00");
  if (finalDiff >= totalDuration) {
    timeWindows.push({
      start: windowStart,
      end: "24:00",
      duration: finalDiff
    });
  }
  
  return timeWindows;
}

function getPossibletimes(
  timeWindow: TimeWindow,
  totalDuration: number,
  intervalMinutes: number = 5
): string[] {
  const times: string[] = [];
  let currentTime = new Date(`1970-01-01T${timeWindow.start}`);
  const endTime = new Date(`1970-01-01T${timeWindow.end}`);
  
  while (true) {
    const potentialEndTime = new Date(currentTime.getTime() + totalDuration * 60000);
    if (potentialEndTime > endTime) break;
    
    times.push(currentTime.toTimeString().slice(0, 5));
    currentTime = new Date(currentTime.getTime() + intervalMinutes * 60000);
  }
  
  return times;
}

function calculateTimeDifference(start: string, end: string): number {
  const time = new Date(`1970-01-01T${start}`);
  const endTime = new Date(`1970-01-01T${end}`);
  return Math.floor((endTime.getTime() - time.getTime()) / (1000 * 60));
}