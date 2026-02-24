/**
 * CogniTrace Speech Capture Engine
 * Web Speech API wrapper with pause detection and metric extraction
 */

const PAUSE_THRESHOLD_MS = 500; // 500ms = flagged pause

/**
 * Create a speech capture session
 * Returns controller object with start/stop/getMetrics
 */
export function createSpeechCapture(callbacks = {}) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return {
      supported: false,
      start: () => {},
      stop: () => {},
      getMetrics: () => null,
    };
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;

  let isRunning = false;
  let startTime = 0;
  let lastWordTime = 0;
  let wordTimestamps = [];
  let pauseGaps = [];
  let finalTranscript = '';
  let interimTranscript = '';
  let allWords = [];

  // Live metrics for real-time monitor
  let liveMetrics = {
    wordsPerMinute: 0,
    pauseFrequency: 0,
    avgPauseDuration: 0,
    longestPause: 0,
    totalWords: 0,
    totalPauses: 0,
  };

  function updateLiveMetrics() {
    const elapsed = (performance.now() - startTime) / 1000; // seconds
    if (elapsed <= 0) return;

    const elapsedMin = elapsed / 60;
    const totalWords = allWords.length;
    const significantPauses = pauseGaps.filter((g) => g >= PAUSE_THRESHOLD_MS);
    const pauseCount = significantPauses.length;

    liveMetrics = {
      wordsPerMinute: elapsedMin > 0 ? Math.round(totalWords / elapsedMin) : 0,
      pauseFrequency:
        elapsedMin > 0 ? Math.round((pauseCount / elapsedMin) * 10) / 10 : 0,
      avgPauseDuration:
        pauseCount > 0
          ? Math.round(
              (significantPauses.reduce((a, b) => a + b, 0) /
                pauseCount /
                1000) *
                100
            ) / 100
          : 0,
      longestPause:
        significantPauses.length > 0
          ? Math.round((Math.max(...significantPauses) / 1000) * 100) / 100
          : 0,
      totalWords,
      totalPauses: pauseCount,
      elapsed: Math.round(elapsed),
    };

    if (callbacks.onMetricsUpdate) {
      callbacks.onMetricsUpdate({ ...liveMetrics });
    }
  }

  recognition.onresult = (event) => {
    const now = performance.now();
    let interim = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const text = result[0].transcript.trim();

      if (result.isFinal) {
        // Split into words and record timestamps
        const words = text.split(/\s+/).filter(Boolean);
        for (const word of words) {
          const wordTime = now;
          if (lastWordTime > 0) {
            const gap = wordTime - lastWordTime;
            if (gap >= PAUSE_THRESHOLD_MS) {
              pauseGaps.push(gap);
            }
          }
          wordTimestamps.push(wordTime);
          lastWordTime = wordTime;
          allWords.push(word);
        }

        finalTranscript += (finalTranscript ? ' ' : '') + text;
      } else {
        interim = text;
      }
    }

    interimTranscript = interim;

    if (callbacks.onTranscript) {
      callbacks.onTranscript({
        final: finalTranscript,
        interim: interimTranscript,
        full: finalTranscript + (interimTranscript ? ' ' + interimTranscript : ''),
      });
    }

    updateLiveMetrics();
  };

  recognition.onerror = (event) => {
    // Ignore no-speech errors — user may just be pausing
    if (event.error === 'no-speech') return;
    if (callbacks.onError) {
      callbacks.onError(event.error);
    }
  };

  recognition.onend = () => {
    // Auto-restart if still supposed to be running (browser stops after silence)
    if (isRunning) {
      try {
        recognition.start();
      } catch {
        // Already started
      }
    }
  };

  return {
    supported: true,

    start() {
      startTime = performance.now();
      lastWordTime = 0;
      wordTimestamps = [];
      pauseGaps = [];
      finalTranscript = '';
      interimTranscript = '';
      allWords = [];
      isRunning = true;

      try {
        recognition.start();
      } catch {
        // Already started
      }

      if (callbacks.onStart) callbacks.onStart();
    },

    stop() {
      isRunning = false;
      try {
        recognition.stop();
      } catch {
        // Already stopped
      }

      updateLiveMetrics();
      if (callbacks.onStop) callbacks.onStop();
    },

    getMetrics() {
      const elapsed = (performance.now() - startTime) / 1000;
      const elapsedMin = elapsed / 60;
      const significantPauses = pauseGaps.filter((g) => g >= PAUSE_THRESHOLD_MS);
      const pauseCount = significantPauses.length;

      return {
        wordsPerMinute: elapsedMin > 0 ? Math.round(allWords.length / elapsedMin) : 0,
        pauseFrequency:
          elapsedMin > 0 ? Math.round((pauseCount / elapsedMin) * 10) / 10 : 0,
        avgPauseDuration:
          pauseCount > 0
            ? Math.round(
                (significantPauses.reduce((a, b) => a + b, 0) / pauseCount / 1000) *
                  100
              ) / 100
            : 0,
        longestPause:
          significantPauses.length > 0
            ? Math.round((Math.max(...significantPauses) / 1000) * 100) / 100
            : 0,
        totalWords: allWords.length,
        totalPauses: pauseCount,
        duration: Math.round(elapsed),
        transcript: finalTranscript,
        wordTimestamps,
        pauseGaps: significantPauses.map((g) => Math.round(g) / 1000),
      };
    },

    getLiveMetrics() {
      return { ...liveMetrics };
    },

    isSupported() {
      return true;
    },
  };
}

/**
 * Check if Web Speech API is available
 */
export function isSpeechSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Passage prompts for reading tasks
 */
export const READING_PASSAGES = [
  {
    id: 'passage_1',
    title: 'The Morning Walk',
    text: 'Every morning, the elderly woman walked through the garden, carefully observing each flower as it bloomed. The roses were particularly vibrant this season, their crimson petals catching the early sunlight. She paused near the fountain, listening to the gentle cascade of water over smooth stones, before continuing along the winding path toward the oak tree at the far end of the property.',
    wordCount: 58,
  },
  {
    id: 'passage_2',
    title: 'The Workshop',
    text: 'The carpenter measured each piece of oak twice before making his cut. Precision was essential in this craft, where even a millimeter could mean the difference between a perfect joint and a visible gap. His workshop smelled of fresh sawdust and linseed oil, and the afternoon light filtering through the dusty windows illuminated the grain of the wood like a topographic map.',
    wordCount: 58,
  },
  {
    id: 'passage_3',
    title: 'The Market',
    text: 'Saturday mornings at the farmers market were always bustling with activity. Vendors arranged pyramids of apples and pears on wooden crates while customers wandered between stalls comparing prices. The smell of fresh bread from the bakery stand mingled with the sharp scent of herbs, and somewhere near the entrance a musician played an old folk song on a weathered accordion.',
    wordCount: 57,
  },
];
