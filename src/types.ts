export interface Word {
  w: string;   // Palavra
  s: number;   // Milissegundo inicial (start time in ms)
  d: number;   // Duração da palavra em ms (duration in ms)
}

export interface LyricLine {
  time: number;          // Tempo inicial da linha (em ms ou s)
  text: string;          // Texto da estrofe/linha
  words?: Word[];        // Array opcional de palavras com temporização precisa
  isInstrumental?: boolean;
}

export interface Song {
  slug: string;
  title: string;
  image?: string;
  audio?: string;
  audioBlob?: Blob;
  duration?: string;
  lyrics?: LyricLine[];
}

export interface SongRecord {
  id?: number;
  slug: string;
  title: string;
  audioBlob: Blob;
  lrcContent: string;
}

export interface Show {
  id?: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  state: string;
  status: string;
  image_url?: string;
  address?: string;
  name?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  images?: string[] | null;
  gallery?: string[] | null;
  created_at?: string;
}
