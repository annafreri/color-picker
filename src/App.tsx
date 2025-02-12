import { useState } from 'react';
import { MapOfPeople } from './components/MapOfPeople';
import { Person } from './types';
import { Button } from './components/ui/button';
import { Calendar, MailOpen } from 'lucide-react';

function App() {
  const [collidingPeople, setCollidingPeople] = useState<Person[]>([]);
  const [hasCollided, setHasCollided] = useState(false);

  const canvasHeight = window.innerHeight - 80 || 766;
  const canvasWidth = canvasHeight / 2.16;

  const handleCollision = (people: Person[]) => {
    if (people.length > 0) {
      setCollidingPeople(people);
      setHasCollided(true);
    }
  };

  return (
    <div className="relative">
      <div className='m-8'>
        <MapOfPeople onCollision={handleCollision} />
        {hasCollided && (
          <div style={{ width: canvasWidth - 24 }} className="select-none absolute bottom-4 left-1/2 -translate-x-1/2 text-black bg-white pt-4 pb-8 rounded-lg shadow-lg flex flex-col items-center justify-center gap-4">
            <span className=' text-2xl tracking-tighter font-semibold'>Travel to {collidingPeople[1] ? collidingPeople[1].name : 'name'}</span>
            <div className='flex flex-row mx-2 mb-4 w-full items-center justify-center'>
              <img src={`/person${collidingPeople[1].id}.png`} className='size-12 border-1 border-white rounded-4xl' />
              <img src={`/person${collidingPeople[0].id}.png`} className='size-12 -mx-2 border-2 border-white rounded-4xl' />
            </div>
            <Button className='text-md -mb-2'>
              <Calendar />
              Pick dates
            </Button>
            <Button
              size={'lg'}
              variant="ghost"
              onClick={() => setHasCollided(false)}
              className='text-sm text-zinc-400'>
              Close
            </Button>

          </div>
        )}
      </div>
    </div>
  );
}

export default App;