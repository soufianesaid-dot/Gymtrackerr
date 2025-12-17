
import { Exercise, BodyPart } from './types';

export const BODY_PARTS: BodyPart[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs'];

export const EXERCISES: Exercise[] = [
  // Chest
  { id: 'chest_1', name: 'Barbell Bench Press', bodyPart: 'Chest', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80' },
  { id: 'chest_2', name: 'Incline Dumbbell Press', bodyPart: 'Chest', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=400&q=80' },
  { id: 'chest_3', name: 'Chest Flyes', bodyPart: 'Chest', image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=400&q=80' },
  // Back
  { id: 'back_1', name: 'Deadlift', bodyPart: 'Back', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80' },
  { id: 'back_2', name: 'Pull Ups', bodyPart: 'Back', image: 'https://images.unsplash.com/photo-1598971639058-aba3c1f0b27e?auto=format&fit=crop&w=400&q=80' },
  { id: 'back_3', name: 'Lat Pulldowns', bodyPart: 'Back', image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=400&q=80' },
  // Legs
  { id: 'legs_1', name: 'Back Squats', bodyPart: 'Legs', image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2158?auto=format&fit=crop&w=400&q=80' },
  { id: 'legs_2', name: 'Leg Press', bodyPart: 'Legs', image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=400&q=80' },
  { id: 'legs_3', name: 'Leg Curls', bodyPart: 'Legs', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80' },
  // Shoulders
  { id: 'shoulders_1', name: 'Overhead Press', bodyPart: 'Shoulders', image: 'https://images.unsplash.com/photo-1541534401786-2077dee47a1b?auto=format&fit=crop&w=400&q=80' },
  { id: 'shoulders_2', name: 'Lateral Raises', bodyPart: 'Shoulders', image: 'https://images.unsplash.com/photo-1532029831909-d41967280373?auto=format&fit=crop&w=400&q=80' },
  // Arms
  { id: 'arms_1', name: 'Bicep Curls', bodyPart: 'Arms', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=400&q=80' },
  { id: 'arms_2', name: 'Tricep Pushdowns', bodyPart: 'Arms', image: 'https://images.unsplash.com/photo-1594737625785-a6bad33ff0fd?auto=format&fit=crop&w=400&q=80' },
  // Abs
  { id: 'abs_1', name: 'Plank', bodyPart: 'Abs', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80' },
  { id: 'abs_2', name: 'Crunches', bodyPart: 'Abs', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80' },
];
