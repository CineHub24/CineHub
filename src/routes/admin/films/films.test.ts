import { describe, it, expect, vi } from 'vitest';
import { load } from './+page.server';
import { db } from '$lib/server/db';
import { film } from '$lib/server/db/schema';

// Genauer Mock mit allen notwendigen Eigenschaften
const mockMovies = [
  { id: 1, title: 'Test Movie 1' },
  { id: 2, title: 'Test Movie 2' }
];

vi.mock('$lib/server/db', () => {
  // Erstellen einer Spy-Funktion für from
  const fromSpy = vi.fn(() => ({
    execute: vi.fn(() => Promise.resolve(mockMovies)),
    
    // Zusätzliche Eigenschaften für Typkompatibilität
    prepare: vi.fn(),
    fields: {},
    session: {},
    dialect: {},
    withList: {},
    distinct: {},
    _: {},
    config: {},
    
    // Fallback für Promise-Verkettung
    then: vi.fn((resolve) => resolve(mockMovies))
  }));

  return {
    db: {
      select: vi.fn(() => ({
        from: fromSpy
      }))
    }
  };
});

describe('Load Function', () => {
  it('should fetch movies correctly', async () => {
    const mockEvent = {};

    // Load-Funktion aufrufen
    const result = await load(mockEvent);

    // Holen Sie die gemockten Funktionen
    const selectFn = db.select;
    const fromFn = selectFn().from;

    // Assertions
    expect(selectFn).toHaveBeenCalled();
    expect(fromFn).toHaveBeenCalledWith(film);
    expect(result.filme).toEqual(mockMovies);
    expect(result.filme.length).toBe(2);
  });
});