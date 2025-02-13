import initialPeople from '@/consts';
import { Person } from '@/types';
import { useEffect, useRef, useState } from 'react';


interface Circle extends Person {
  radius: number;
  targetRadius: number;
  initialRadius: number;
  collisionProgress: number;  // 0 to 1
}

interface MapOfPeopleProps {
  onCollision: (collidingPeople: Person[]) => void;
}

export const MapOfPeople: React.FC<MapOfPeopleProps> = ({ onCollision }) => {


  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const initialRadius = 32;

  useEffect(() => {
    initialPeople.forEach(({ id }) => {
      const img = new Image();
      img.src = `/person${id}.png`;
      imagesRef.current.set(id, img);
    });
  }, []);

  const [circles, setCircles] = useState<Circle[]>(
    initialPeople.map(person => ({
      ...person,
      radius: initialRadius,
      targetRadius: initialRadius,
      initialRadius,
      collisionProgress: 0
    }))
  );

  const [draggedCircle, setDraggedCircle] = useState<Circle | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const animate = () => {
    setCircles(prev => prev.map(circle => ({
      ...circle,
      radius: circle.radius + (circle.targetRadius - circle.radius) * 0.1
    })));
  };

  useEffect(() => {
    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [circles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const collisions = new Set<number>();
    const collidingPeople: Person[] = [];

    // Check collisions
    circles.forEach((circle1, i) => {
      circles.forEach((circle2, j) => {
        if (i !== j) {
          const dx = circle1.x - circle2.x;
          const dy = circle1.y - circle2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < circle1.radius + circle2.radius) {
            collisions.add(circle1.id);
            if (!collidingPeople.some(p => p.id === circle1.id)) {
              collidingPeople.push({
                id: circle1.id,
                x: circle1.x,
                y: circle1.y,
                name: circle1.name,
                price: circle1.price
              });
            }
            if (!collidingPeople.some(p => p.id === circle2.id)) {
              collidingPeople.push({
                id: circle2.id,
                x: circle2.x,
                y: circle2.y,
                name: circle2.name,
                price: circle2.price
              });
            }
          }
        }
      });
    });

    // Draw circles and progress indicators
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    circles.forEach(circle => {
      const img = imagesRef.current.get(circle.id);
      if (!img) return;

      // Draw the circle and image
      ctx.save();
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(
        img,
        circle.x - circle.radius,
        circle.y - circle.radius,
        circle.radius * 2,
        circle.radius * 2
      );
      ctx.restore();

      // Draw the full circle outline if colliding
      if (collisions.has(circle.id)) {
        // Draw complete outline
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius + 2, 0, Math.PI * 2);
        ctx.strokeStyle = '#212121';  // Grey outline
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw progress arc
        ctx.beginPath();
        ctx.lineCap = 'round';  // Makes the line ends rounded
        ctx.lineJoin = 'round'; // Smooths any corners
        ctx.shadowColor = '#6D66FE';
        ctx.shadowBlur = 2;     // Adds a subtle glow
        ctx.arc(
          circle.x,
          circle.y,
          circle.radius + 2,
          -Math.PI / 2,
          -Math.PI / 2 + (2 * Math.PI * circle.collisionProgress)
        );
        ctx.strokeStyle = '#6D66FE';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Reset shadow for other drawings
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }
    });


    // Update circles
    requestAnimationFrame(() => {
      setCircles(prev => prev.map(circle => ({
        ...circle,
        targetRadius: collisions.has(circle.id)
          ? Math.min(circle.targetRadius + 2, initialRadius * 1.5)
          : initialRadius,
        collisionProgress: collisions.has(circle.id)
          ? circle.collisionProgress < 1
            ? circle.collisionProgress + 0.02  // Increment more slowly
            : 1
          : 0  // Reset when not colliding
      })));
    });

    // Only notify of collision when progress is complete
    const completeCollisions = collidingPeople.filter(
      person => circles.find(c => c.id === person.id)?.collisionProgress === 1
    );
    if (completeCollisions.length > 0) {
      onCollision(completeCollisions);
    } else {
      onCollision([]);
    }
  }, [circles, onCollision]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedCircle = circles.find(circle => {
      const dx = circle.x - x;
      const dy = circle.y - y;
      return dx * dx + dy * dy <= circle.radius * circle.radius;
    });

    if (clickedCircle) {
      setDraggedCircle(clickedCircle);
      setDragOffset({
        x: x - clickedCircle.x,
        y: y - clickedCircle.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedCircle) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    setCircles(circles.map(circle =>
      circle.id === draggedCircle.id
        ? { ...circle, x, y }
        : circle
    ));
  };

  const handleMouseUp = () => {
    if (draggedCircle) {
      setCircles(prev => prev.map(circle =>
        circle.id === draggedCircle.id
          ? {
            ...circle,
            x: initialPeople.find(p => p.id === circle.id)?.x || circle.x,
            y: initialPeople.find(p => p.id === circle.id)?.y || circle.y
          }
          : circle
      ));
    }
    setDraggedCircle(null);
  };

  const canvasHeight = window.innerHeight - 80 || 766;
  const canvasWidth = canvasHeight / 2.16;

  return (
    <canvas
      ref={canvasRef}
      // width={390 * 0.8}
      // height={844 * 0.8}
      width={canvasWidth}
      height={canvasHeight}
      className="m-auto bg-white rounded-2xl touch-none"
      style={{
        background: 'url("/map.png")',
        backgroundSize: 'contain',
        backgroundPosition: 'center'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={(e) => {
        e.preventDefault();
        handleMouseDown({
          clientX: e.touches[0].clientX,
          clientY: e.touches[0].clientY
        } as React.MouseEvent);
      }}
      onTouchMove={(e) => {
        e.preventDefault();
        handleMouseMove({
          clientX: e.touches[0].clientX,
          clientY: e.touches[0].clientY
        } as React.MouseEvent);
      }}
      onTouchEnd={handleMouseUp}
      onTouchCancel={handleMouseUp}
    />
  );
};