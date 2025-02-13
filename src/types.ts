export interface Person {
  id: number;
  x: number;
  y: number;
  name: string;
  price:string;
}

export interface Circle extends Person {
  radius: number;
  targetRadius: number;
  initialRadius: number;
  collisionProgress: number;
}

export interface MapOfPeopleProps {
  onCollision: (people: Person[]) => void;
}

export interface DragOffset {
  x: number;
  y: number;
}