import type { VideoMetadata, SubtitleSegment, SubtitleStyle } from './subtitle';

export interface VideoProject {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  video: VideoMetadata;
  segments: SubtitleSegment[];
  style: SubtitleStyle;
  thumbnail?: string;
}

export interface ProjectLimitInfo {
  count: number;
  max: number;
  percent: number;
  isLimitReached: boolean;
  planName: string;
}
