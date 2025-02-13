import { useState } from 'react';
import { MapOfPeople } from './components/MapOfPeople';
import { Person } from './types';
import { Button } from './components/ui/button';
import { TicketsPlane } from 'lucide-react';


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
        {/* Only show price tooltip if there are colliding people */}
        {/* {collidingPeople.length > 0 && (
          <div
            className='bg-black text-white px-2 rounded-4xl absolute'
            style={{
              left: window.innerWidth / 2 - canvasWidth / 2 + collidingPeople[0].x,
              top: collidingPeople[0].y
            }}
          >
            {collidingPeople[0].price}
          </div>
        )} */}

        <MapOfPeople onCollision={handleCollision} />


        {/* modal */}

        {hasCollided && collidingPeople.length > 0 && (
          <div
            style={{ width: canvasWidth - 24, }}
            className="select-none absolute bottom-4 left-1/2 -translate-x-1/2 text-black bg-white pt-4 p-4 rounded-lg shadow-lg flex flex-col items-center justify-center gap-4"
          >
            <div className='bg-zinc-200 w-12 h-1 rounded-full'></div>

            <div className='flex flex-col gap-0 items-center'>
              {/* images */}
              <div className='flex flex-row mx-2 pb-2 w-full items-center justify-center'>
                {collidingPeople[1] && (
                  <img
                    src={`/person${collidingPeople[1].id}.png`}
                    alt="Person 1"
                    className='size-12 border-1 border-white rounded-4xl'
                  />
                )}
                {collidingPeople[0] && (
                  <img
                    src={`/person${collidingPeople[0].id}.png`}
                    alt="Person 2"
                    className='size-12 -mx-2 border-2 border-white rounded-4xl'
                  />
                )}
              </div>
              <span className='text-xl tracking-tighter font-semibold'>
                Travel to {collidingPeople[1]?.name || 'name'}
              </span>
              <span className='text-zinc-400 text-sm'>From 59€</span>
            </div>



            <Button
              className=' -mb-2'
              variant="default"
              onClick={() => setHasCollided(false)}
              size={'lg'}
            >
              <TicketsPlane />
              Plan your trip
            </Button>
            <Button
              size={'sm'}
              variant="ghost"
              onClick={() => setHasCollided(false)}
              className='text-sm text-zinc-400'
            >
              Close
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;