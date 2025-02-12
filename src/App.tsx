import { useState } from 'react';
import { MapOfPeople } from './components/MapOfPeople';
import { Person } from './types';
import { Button } from './components/ui/button';

function App() {
  const [collidingPeople, setCollidingPeople] = useState<Person[]>([]);
  const [hasCollided, setHasCollided] = useState(false);

  const handleCollision = (people: Person[]) => {
    if (people.length > 0) {
      setCollidingPeople(people);
      setHasCollided(true);
    }
  };

  return (
    <div className="relative">
      <MapOfPeople onCollision={handleCollision} />
      {hasCollided && (
        <div className="select-none absolute bottom-4 w-1/4 left-1/2 -translate-x-1/2 text-black bg-white pt-4 pb-8 rounded-lg shadow-lg flex flex-col items-center justify-center gap-4">
          <span className=' text-2xl tracking-tighter font-semibold'>Travel to {collidingPeople[1] ? collidingPeople[1].name : 'name'}</span>
          <div className='flex flex-row mx-2 w-full items-center justify-center'>
            <img src={`/person${collidingPeople[1].id}.png`} className='size-12 border-1 border-white rounded-4xl' />
            <img src={`/person${collidingPeople[0].id}.png`} className='size-12 -mx-2 border-2 border-white rounded-4xl' />
          </div>
          <Button>Pick dates</Button>

          <button onClick={() => setHasCollided(false)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default App;