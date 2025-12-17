
export type BodyPart = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Abs';

export interface Exercise {
  id: string;
  name: string;
  bodyPart: BodyPart;
  image: string;
}

export interface SetLog {
  weight: number;
  reps: number;
}

export interface ExerciseLog {
  id: string;
  exerciseId: string;
  date: string;
  sets: SetLog[];
}

export interface AppState {
  logs: ExerciseLog[];
}
