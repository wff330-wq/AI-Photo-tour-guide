
import React from 'react';
import type { LandmarkInfo } from '../types';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { PlayIcon, PauseIcon, RefreshIcon } from './IconComponents';

interface AnalysisResultProps {
  imageUrl: string;
  landmarkInfo: LandmarkInfo;
  onReset: () => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ imageUrl, landmarkInfo, onReset }) => {
  const { isPlaying, play, pause } = useAudioPlayer(landmarkInfo.audioData);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 relative animate-fade-in">
       <button 
        onClick={onReset}
        className="absolute top-4 right-4 md:top-8 md:right-8 z-20 bg-gray-800/70 text-white p-2 rounded-full hover:bg-cyan-500/80 transition-transform duration-300 hover:scale-110 backdrop-blur-sm"
        aria-label="Start Over"
      >
        <RefreshIcon className="w-6 h-6"/>
      </button>
      <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/20 aspect-video">
        <img src={imageUrl} alt="Uploaded landmark" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 text-white">
          <div className="flex items-center space-x-4">
             <button
              onClick={isPlaying ? pause : play}
              className="flex-shrink-0 bg-cyan-500 text-white rounded-full p-2 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 transition-transform duration-300 hover:scale-110"
              aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
            >
              {isPlaying ? <PauseIcon className="w-8 h-8 md:w-10 md:h-10" /> : <PlayIcon className="w-8 h-8 md:w-10 md:h-10" />}
            </button>
            <h1 className="text-2xl md:text-4xl font-bold leading-tight tracking-tight">
              {landmarkInfo.name}
            </h1>
          </div>
        </div>
      </div>
      <div className="mt-6 bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm ring-1 ring-white/10">
        <h2 className="text-xl font-semibold text-cyan-300 mb-3">History & Facts</h2>
        <p className="text-gray-300 leading-relaxed">{landmarkInfo.history}</p>
        
        {landmarkInfo.sources.length > 0 && (
          <div className="mt-6">
             <h3 className="text-lg font-semibold text-cyan-300 mb-3">Sources</h3>
             <div className="flex flex-wrap gap-2">
                {landmarkInfo.sources.map((source, index) => (
                    <a 
                        href={source.web.uri}
                        key={index}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm bg-gray-700 text-cyan-200 px-3 py-1 rounded-full hover:bg-gray-600 hover:text-white transition-colors duration-200"
                    >
                        {source.web.title || new URL(source.web.uri).hostname}
                    </a>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResult;
