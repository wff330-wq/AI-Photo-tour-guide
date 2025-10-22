
export enum AppState {
  IDLE,
  ANALYZING,
  FETCHING_HISTORY,
  GENERATING_AUDIO,
  RESULT,
  ERROR,
}

export interface GroundingSource {
  web: {
    uri: string;
    title: string;
  };
}

export interface LandmarkInfo {
  name: string;
  history: string;
  sources: GroundingSource[];
  audioData: string;
}
