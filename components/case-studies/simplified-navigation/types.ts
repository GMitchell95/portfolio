export interface SlideState {
  label: string;
  src: string;
}

export interface Slide {
  title: string;
  body: string;
  label: string;
  src?: string;
  states?: SlideState[];
}

export interface LightboxState {
  open: boolean;
  slides: Slide[];
  index: number;
  stateIndices: Record<number, number>;
}
