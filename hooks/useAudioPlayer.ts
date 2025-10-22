
import { useState, useRef, useCallback, useEffect } from 'react';

const decode = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

export const useAudioPlayer = (base64Audio: string | null) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    if (base64Audio) {
      const initAudio = async () => {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const audioBytes = decode(base64Audio);
        const buffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);
        audioBufferRef.current = buffer;
      };
      initAudio();
    }
    
    // Cleanup on component unmount or when audio changes
    return () => {
      sourceNodeRef.current?.stop();
      audioContextRef.current?.close().catch(console.error);
      audioContextRef.current = null;
    };
  }, [base64Audio]);

  const play = useCallback(() => {
    if (!audioBufferRef.current || !audioContextRef.current || isPlaying) return;

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(audioContextRef.current.destination);
    source.start();
    source.onended = () => {
      setIsPlaying(false);
      sourceNodeRef.current = null;
    };
    sourceNodeRef.current = source;
    setIsPlaying(true);
  }, [isPlaying]);

  const pause = useCallback(() => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      // onended will handle setting isPlaying to false
    }
  }, []);

  return { isPlaying, play, pause };
};
