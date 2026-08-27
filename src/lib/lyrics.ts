export interface Word {
  w: string; // The word text
  s: number; // Start time in milliseconds (absolute song time)
  d: number; // Duration of the word in milliseconds
}

export interface LyricLine {
  time: number; // Start time of this line in seconds
  text: string; // Original line text
  words: Word[]; // Individual word-by-word timestamps
  isInstrumental?: boolean;
  duration?: number; // Estimated duration in seconds
}

export interface LyricActiveState {
  lineIndex: number;
  wordIndex: number;
  lineProgress: number; // 0 to 1
  wordProgress: number; // 0 to 1
  isInstrumental: boolean;
  nextVocalInSeconds?: number;
}

// Low-level official LRC source files calibrated to studio master audio tracks
export const LRC_SOURCES: Record<string, string> = {
  'Cães de Rua': `[00:00.00][Intro Brutal de Baixo e Bateria]
[00:10.00]Somos vira-latas, não temos raça nem dono
[00:14.50]Cravamos nossas presas nos sonhos
[00:19.50]Mordemos com raiva e não vamos soltar
[00:24.50]Roemos até o osso...
[00:28.50]Até o osso! (Até o osso!)
[00:34.00]Viemos das ruas frias e cruéis
[00:39.00]Conhecemos a realidade nua e crua
[00:44.00]De como é ruim tentar sobreviver
[00:48.50]E correr para não apanhar
[00:53.50]Morrer de fome... Não ter o que comer
[00:59.00]Com resistência, mostramos os dentes!
[01:04.00]Nossa lealdade é incontestável!
[01:09.50]Daremos nossa vida pela verdade!
[01:16.00][Riff Intermediário Rápido]
[01:26.00]Raça nunca foi e nunca será algo importante
[01:31.50]Somos vira-latas e assumimos nossa família
[01:36.50]Somos cães de rua, vira-latas também mordem!
[01:41.50]Não tentem nos agredir, nos trair...
[01:46.50]A rua é nossa e nós vamos onde quiser!
[01:52.00]Somos vira-latas, não temos raça nem dono
[01:57.00]Cravamos nossas presas nos sonhos
[02:02.00]Mordemos com raiva e não vamos soltar
[02:07.00]Roemos até o osso
[02:11.50]Nossa lealdade é incontestável!
[02:16.50]Daremos nossa vida pela verdade
[02:21.50]Pela verdade!
[02:32.00][Breakdown Final e Gritos]`,

  'Doente': `[00:00.00][Batida Rápida de Bateria]
[00:07.50]Mais um dia eu finjo que dormi
[00:12.00]Olho fechado vendo a hora passar
[00:16.50]Dor de cabeça e suando frio
[00:21.00]Sinto o vazio me dominar
[00:25.50]Estou cansado... Me falta o ar...
[00:31.00]Sigo sorrindo pra ninguém me notar
[00:36.50]A sua condição, sua humilhação
[00:41.50]Sua indisposição, a sua aflição
[00:46.50]Sua medicação, sua submissão
[00:51.50]E repetidamente querem a sua mente
[00:56.50]Seja obediente
[01:01.00]E repentinamente, um surto iminente
[01:05.50]Eu estou doente...
[01:12.00][Riff de Baixo Sombrio]
[01:21.50]Procuro me dopar tenho que trabalhar
[01:27.00]Junto os pedaços e fico de pé
[01:32.00]É tarde demais pra poder deitar
[01:37.00]Quem sabe um dia você parar
[01:42.00]Te chamam de família, querem te explorar
[01:47.50]Sigo sorrindo pra ninguém me notar
[01:53.00]A sua condição, sua humilhação
[01:58.00]Sua indisposição, a sua aflição
[02:03.00]Sua medicação, sua submissão
[02:08.00]E repetidamente querem a sua mente
[02:13.00]Seja obediente
[02:17.50]E repentinamente, um surto iminente
[02:22.50]Eu estou doente
[02:28.00]Sobreviver e sonhar
[02:33.50]Ter mais um dia pra lutar
[02:40.00][Final Instrumental Sombrio]`,

  'Grilhões': `[00:00.00][Intro Instrumental Rítmica]
[00:09.50]Como é viver com preconceito?
[00:14.00]Só quem sente na pele sabe o que é sofrimento
[00:19.50]Roubados de sua mãe-terra, escravizados por seu povo
[00:24.50]Doutrinados por cultos falsos
[00:28.50]Nós somos seus filhos também!
[00:33.50]Nossa miscigenação! É linda agora!
[00:40.50]Fruto de mãos feridas, vidas perdidas
[00:46.50]Nascida de vidas inocentes
[00:51.50]Da liberdade às favelas, foram forçados a viver na miséria
[00:57.50]Mas essas marcas a história não conta
[01:03.50]Sempre lutando contra o racismo
[01:08.50]E nos grilhões a dor, cicatrizes da corrupção
[01:14.50]Que estalar do chicote nas costas...
[01:20.50]NOS DEIXARAM A REVOLTA!
[01:26.00][Solo Violento de Guitarra]
[01:46.50]O tempo passou num piscar de olhos
[01:51.50]Há pouco mais de um século atrás a liberdade era uma vitória
[01:58.50]Mas essa glória é manchada de dor e envenenada por racismo
[02:05.50]Diferença não está na cor, a diferença está no nosso caráter!
[02:14.50]Quebrem, quebrem, quebrem as correntes
[02:20.50]Quebrem, quebrem, quebrem os grilhões
[02:26.50]Quebrem as correntes, quebrem os grilhões
[02:35.00][Fim do Massacre]`,

  'Respeito': `[00:00.00][Riff de Entrada Rápido]
[00:05.50]Seguimos apenas um caminho: nascimento, trajetória e morte
[00:11.00]Essas palavras estão escritas para todos
[00:16.00]E o que mantém sua alma limpa no final
[00:21.00]É o quanto respeita seu povo
[00:25.00]Espalhe a palavra: RESPEITO! RESPEITO! RESPEITO!
[00:31.00]Espalhe a palavra respeito, se olhe no espelho
[00:36.00]Critique seu erro, encontre seu próprio defeito
[00:41.00]Espalhe a palavra respeito, se olhe no espelho
[00:46.00]Critique seu erro, encontre seu próprio defeito
[00:51.00]Deixe as vidas serem livres, as pessoas precisam viver
[00:56.00]Cada um do seu jeito!
[01:00.00]Um relógio singular com o seu próprio tempo
[01:05.00]Sem alinhar seu relógio com ponteiros dos outros
[01:11.00]Viva sua própria vida!
[01:15.50]RESPEITO! RESPEITO! RESPEITO!
[01:20.50]Espalhe a palavra respeito, se olhe no espelho
[01:25.50]Critique seu erro, encontre seu próprio defeito
[01:30.50]Espalhe a palavra respeito, se olhe no espelho
[01:35.50]Critique seu erro, encontre seu próprio defeito
[01:40.50]Uma vida tão única, igualdade singular
[01:45.50]Diferença nos faz original
[01:49.50]Existem tantos jeitos de amar, tantos jeitos de amor
[01:54.50]Mas por que odiar?
[01:58.50]Viva sua própria vida, respeite a si mesmo
[02:03.50]Respeito ao próximo!
[02:08.00][Final do Mosh]`,

  'Um por Todos': `[00:00.00][Intro Crescendo de Guitarras]
[00:11.50]Somos a faísca que se tornam chamas, um incêndio pelos mesmos ideais
[00:17.50]Como vozes fortes deixamos de ser singular para ser plural
[00:23.00]De um grito desesperado que virou milhares
[00:28.00]Vamos ter que ser ouvidos, esse nosso combustível vai explodir na sua cara!
[00:34.00]Essa é a mordida do cão inferno, essa é a mordida doggbite
[00:40.50]UM POR TODOS! TODOS POR UM!
[00:51.00]Andamos pelo mesmo caminho, moramos na mesma rua
[00:56.50]Nossas vidas se entrelaçam e o sangue se mistura, e se fortalecem
[01:02.50]Falamos a mesma língua, de ouvidos atentos
[01:08.50]Ouvimos pedidos de ajuda, entendemos as mãos
[01:14.50]Destruir as estruturas corrompidas alimentadas pela falsa moral
[01:22.50]Esse latido do cão da rua, esse é o rosnado doggbite
[01:30.50]UM POR TODOS! TODOS POR UM!
[01:41.00][Solo Melódico e Pesado]
[02:01.00]A nossa voz vai falar por vocês, o nosso grito vai brigar por vocês
[02:08.50]Vamos esbravejar até sermos ouvidos
[02:14.50]Um por milhões de vozes
[02:20.50]UM POR TODOS! TODOS POR UM!
[02:31.00][Final Épico]`
};

export const SONG_DURATIONS: Record<string, number> = {
  'Cães de Rua': 170.3,
  'Doente': 200.1,
  'Grilhões': 166.6,
  'Respeito': 224.0,
  'Um por Todos': 210.1
};

/**
 * Parses raw LRC string into typed LyricLine array with word-level phonetic/syllable timings
 */
export function parseLRCContent(lrcText: string, songDuration: number = 240): LyricLine[] {
  const rawLines = lrcText.split('\n');
  const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{2,3}))?\](.*)/;
  
  const parsedItems: { time: number; text: string }[] = [];

  for (const rawLine of rawLines) {
    const match = rawLine.trim().match(timeRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const frac = match[3] ? parseFloat('0.' + match[3]) : 0;
      const time = minutes * 60 + seconds + frac;
      const text = match[4].trim();
      if (text) {
        parsedItems.push({ time: parseFloat(time.toFixed(2)), text });
      }
    }
  }

  // Sort chronologically
  parsedItems.sort((a, b) => a.time - b.time);

  return parsedItems.map((line, idx) => {
    const isInstrumental = line.text.startsWith('[') && line.text.endsWith(']');
    const startMs = line.time * 1000;
    
    const nextLine = parsedItems[idx + 1];
    const endSec = nextLine ? nextLine.time : songDuration;
    const durationSec = Math.max(0.8, endSec - line.time);
    const durationMs = durationSec * 1000;

    if (isInstrumental) {
      return {
        time: line.time,
        text: line.text,
        isInstrumental: true,
        duration: durationSec,
        words: [{ w: line.text, s: startMs, d: durationMs }]
      };
    }

    const wordsText = line.text.split(/\s+/).filter(Boolean);
    const totalWords = wordsText.length;

    if (totalWords === 0) {
      return {
        time: line.time,
        text: line.text,
        duration: durationSec,
        words: []
      };
    }

    // Syllable/phonetic weighting for realistic karaoke word timing
    const weights = wordsText.map((word, wIdx) => {
      // Base weight from length and vowel count
      const cleanWord = word.replace(/[^a-zA-ZáéíóúãõâêîôûàçÁÉÍÓÚÃÕÂÊÎÔÛÀÇ]/g, '');
      const vowels = (cleanWord.match(/[aeiouyáéíóúãõâêîôûà]/gi) || []).length;
      let weight = Math.max(2, cleanWord.length + vowels * 1.5);
      
      // Punchy ending or punctuated words receive deliberate elongation
      if (wIdx === totalWords - 1 || word.includes('!') || word.includes('...')) {
        weight += 4;
      }
      return weight;
    });

    const totalWeight = weights.reduce((acc, w) => acc + w, 0);

    // Natural pause (10%) at end of line before next vocal
    const breathingGapMs = Math.min(380, durationMs * 0.1);
    const activeDurationMs = durationMs - breathingGapMs;

    let currentWordStart = startMs;
    const wordObjects: Word[] = [];

    for (let i = 0; i < totalWords; i++) {
      const textStr = wordsText[i];
      let wordDur = Math.round((weights[i] / totalWeight) * activeDurationMs);

      if (i === totalWords - 1) {
        wordDur = Math.max(wordDur, startMs + activeDurationMs - currentWordStart);
      }

      wordObjects.push({
        w: textStr,
        s: currentWordStart,
        d: wordDur
      });

      currentWordStart += wordDur;
    }

    return {
      time: line.time,
      text: line.text,
      isInstrumental: false,
      duration: durationSec,
      words: wordObjects
    };
  });
}

// Pre-compute high-performance lyric lines for all songs
export const SONG_LYRICS: Record<string, LyricLine[]> = Object.fromEntries(
  Object.entries(LRC_SOURCES).map(([title, lrc]) => [
    title,
    parseLRCContent(lrc, SONG_DURATIONS[title] || 240)
  ])
);

/**
 * Ultra-fast binary search lookup for active line and word with millisecond precision
 */
export function getActiveLyricIndex(lyrics: LyricLine[], currentTime: number): LyricActiveState {
  if (!lyrics || lyrics.length === 0) {
    return {
      lineIndex: -1,
      wordIndex: -1,
      lineProgress: 0,
      wordProgress: 0,
      isInstrumental: false
    };
  }

  const currentTimeMs = currentTime * 1000;

  // Binary search for closest line
  let low = 0;
  let high = lyrics.length - 1;
  let lineIndex = -1;

  while (low <= high) {
    const mid = (low + high) >> 1;
    if (lyrics[mid].time <= currentTime) {
      lineIndex = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (lineIndex === -1) {
    const firstLine = lyrics[0];
    return {
      lineIndex: -1,
      wordIndex: -1,
      lineProgress: 0,
      wordProgress: 0,
      isInstrumental: false,
      nextVocalInSeconds: firstLine ? Math.max(0, firstLine.time - currentTime) : undefined
    };
  }

  const line = lyrics[lineIndex];
  const nextLine = lyrics[lineIndex + 1];
  const lineEndTime = nextLine ? nextLine.time : (line.time + (line.duration || 4));
  const lineDuration = Math.max(0.1, lineEndTime - line.time);
  const lineProgress = Math.min(1, Math.max(0, (currentTime - line.time) / lineDuration));

  let wordIndex = -1;
  let wordProgress = 0;

  if (line.words && line.words.length > 0) {
    for (let w = 0; w < line.words.length; w++) {
      const word = line.words[w];
      const wordEnd = word.s + word.d;
      if (currentTimeMs >= word.s && currentTimeMs < wordEnd) {
        wordIndex = w;
        wordProgress = Math.min(1, Math.max(0, (currentTimeMs - word.s) / Math.max(1, word.d)));
        break;
      } else if (currentTimeMs >= wordEnd) {
        wordIndex = w;
        wordProgress = 1;
      }
    }
  }

  let nextVocalInSeconds: number | undefined;
  if (line.isInstrumental) {
    if (nextLine) {
      nextVocalInSeconds = Math.max(0, nextLine.time - currentTime);
    }
  }

  return {
    lineIndex,
    wordIndex,
    lineProgress,
    wordProgress,
    isInstrumental: !!line.isInstrumental,
    nextVocalInSeconds
  };
}

/**
 * Formats seconds into mm:ss timestamp display
 */
export function formatLyricTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}
