export interface User {
  id: string;
  username: string;
  profilePicture?: string;
  score: number;
  gamesPlayed: number;
}

export interface Room {
  id: string;
  name: string;
  genre: string;
  players: User[];
  currentGame?: Game;
}

export interface Game {
  id: string;
  roomId: string;
  status: 'waiting' | 'playing' | 'finished';
  currentSong?: string;
  winner?: User;
  scores: Score[];
}

export interface Score {
  userId: string;
  gameId: string;
  score: number;
}

export interface Question {
  text: string;
  choices: string[];
  correctAnswer: string;
  topic: string;
  subtopic?: string;
  country: string;
}