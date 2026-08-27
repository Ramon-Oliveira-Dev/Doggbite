import Dexie, { Table } from 'dexie';
import { SongRecord } from '../types';

export class MusicAppDB extends Dexie {
  songs!: Table<SongRecord, number>;

  constructor() {
    super('MusicAppDB');
    this.version(1).stores({
      songs: '++id, &slug, title'
    });
  }
}

export const db = new MusicAppDB();

/**
 * Cache an audio file and its LRC content in IndexedDB
 */
export async function cacheSongLocally(slug: string, title: string, audioBlob: Blob, lrcContent: string): Promise<SongRecord> {
  const existing = await db.songs.where('slug').equals(slug).first();
  if (existing && existing.id) {
    await db.songs.update(existing.id, { audioBlob, lrcContent, title });
    return { ...existing, audioBlob, lrcContent, title };
  } else {
    const id = await db.songs.add({ slug, title, audioBlob, lrcContent });
    return { id, slug, title, audioBlob, lrcContent };
  }
}

/**
 * Get song record from local IndexedDB
 */
export async function getLocalSong(slug: string): Promise<SongRecord | undefined> {
  return await db.songs.where('slug').equals(slug).first();
}

/**
 * Pre-cache song audio and LRC in background for offline playback
 */
export async function prefetchAndCacheSong(slug: string, title: string, audioUrl: string, lrcUrl: string): Promise<string> {
  try {
    const cached = await getLocalSong(slug);
    if (cached && cached.audioBlob) {
      return URL.createObjectURL(cached.audioBlob);
    }

    // Fetch in parallel
    const [audioRes, lrcRes] = await Promise.allSettled([
      fetch(audioUrl),
      fetch(lrcUrl)
    ]);

    let audioBlob: Blob | null = null;
    let lrcContent = '';

    if (audioRes.status === 'fulfilled' && audioRes.value.ok) {
      audioBlob = await audioRes.value.blob();
    }
    if (lrcRes.status === 'fulfilled' && lrcRes.value.ok) {
      lrcContent = await lrcRes.value.text();
    }

    if (audioBlob) {
      await cacheSongLocally(slug, title, audioBlob, lrcContent);
      return URL.createObjectURL(audioBlob);
    }
  } catch (err) {
    console.warn(`Could not cache song ${title} in IndexedDB:`, err);
  }
  return audioUrl;
}
