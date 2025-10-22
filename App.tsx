
import React, { useState, useCallback } from 'react';
import { AppState } from './types';
import type { LandmarkInfo, GroundingSource } from './types';
import { analyzeImageForLandmark, fetchLandmarkHistory, generateNarration } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import AnalysisResult from './components/AnalysisResult';
import Loader from './components/Loader';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [landmarkInfo, setLandmarkInfo] = useState<LandmarkInfo | null>(null);

  const resetState = () => {
    setAppState(AppState.IDLE);
    setError(null);
    setImageUrl(null);
    setLandmarkInfo(null);
  };

  const handleImageSelect = useCallback(async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      setImageUrl(dataUrl);

      // remove the data URL prefix e.g. "data:image/png;base64,"
      const base64Image = dataUrl.split(',')[1];
      
      try {
        setAppState(AppState.ANALYZING);
        const landmarkName = await analyzeImageForLandmark(base64Image, file.type);
        
        setAppState(AppState.FETCHING_HISTORY);
        const { history, sources } = await fetchLandmarkHistory(landmarkName);

        setAppState(AppState.GENERATING_AUDIO);
        const audioData = await generateNarration(history);

        setLandmarkInfo({ name: landmarkName, history, sources, audioData });
        setAppState(AppState.RESULT);

      } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(`Failed to process image. ${errorMessage}`);
        setAppState(AppState.ERROR);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const renderContent = () => {
    switch (appState) {
      case AppState.IDLE:
        return <ImageUploader onImageSelect={handleImageSelect} />;
      case AppState.RESULT:
        if (imageUrl && landmarkInfo) {
          return <AnalysisResult imageUrl={imageUrl} landmarkInfo={landmarkInfo} onReset={resetState} />;
        }
        // Fallthrough to error if data is missing
        setError("Something went wrong displaying the results.");
        setAppState(AppState.ERROR);
        return null; // or render an error component immediately
      case AppState.ERROR:
        return (
          <div className="text-center p-8">
            <h2 className="text-2xl text-red-400 mb-4">An Error Occurred</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={resetState}
              className="bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        );
      default:
        // Loading states
        let message = 'Starting...';
        if (appState === AppState.ANALYZING) message = 'Identifying landmark...';
        if (appState === AppState.FETCHING_HISTORY) message = 'Researching history...';
        if (appState === AppState.GENERATING_AUDIO) message = 'Creating narration...';
        return <Loader message={message} />;
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gray-900 text-white font-sans">
      <div className="w-full relative">
        {renderContent()}
      </div>
    </main>
  );
};

export default App;
