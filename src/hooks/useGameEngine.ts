import { useRef, useEffect, useCallback, useState } from 'react';
import { audio } from '../utils/audio';

// Constants
const LANE_WIDTH = 4; // Wider lanes for higher camera
const CAMERA_Z = 0;
const HORIZON_Z = 100; // Extend horizon
const PLAYER_Z = 20; // Push player back
const BASE_SPEED = 40; // units per second
const MAX_SPEED = 90;
const OBSTACLE_SPAWN_RATE = 0.8; // seconds

export type GameState = 'menu' | 'playing' | 'gameover';

interface Obstacle {
  id: number;
  lane: number; // -1, 0, 1
  z: number;
  type: 'cube' | 'tall';
}

export function useGameEngine() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Mutable game state for the animation loop to avoid re-renders
  const state = useRef({
    playerLane: 0, // -1, 0, 1
    playerVisualX: 0, // for smooth interpolation
    speed: BASE_SPEED,
    obstacles: [] as Obstacle[],
    lastTime: 0,
    timeSinceLastSpawn: 0,
    distanceTraveled: 0,
    isGameOver: false,
    frameId: 0,
    particles: [] as { x: number, y: number, z: number, life: number, vx: number, vy: number, vz: number }[]
  });

  const nextObstacleId = useRef(0);

  const startGame = useCallback(() => {
    state.current = {
      playerLane: 0,
      playerVisualX: 0,
      speed: BASE_SPEED,
      obstacles: [],
      lastTime: performance.now(),
      timeSinceLastSpawn: 0,
      distanceTraveled: 0,
      isGameOver: false,
      frameId: 0,
      particles: []
    };
    setScore(0);
    setGameState('playing');
    audio.startEngine();
  }, []);

  const setLane = useCallback((direction: 'left' | 'right') => {
    if (gameState !== 'playing' || state.current.isGameOver) return;
    
    if (direction === 'left' && state.current.playerLane > -1) {
      state.current.playerLane -= 1;
    } else if (direction === 'right' && state.current.playerLane < 1) {
      state.current.playerLane += 1;
    }
  }, [gameState]);

  const endGame = useCallback(() => {
    state.current.isGameOver = true;
    audio.stopEngine();
    audio.playCrash();
    setGameState('gameover');
    setScore(currentScore => {
      setHighScore(prev => Math.max(prev, currentScore));
      return currentScore;
    });
  }, []);

  // Main Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Resize handler
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const loop = (time: number) => {
      if (state.current.isGameOver) return;

      const dt = (time - state.current.lastTime) / 1000; // seconds
      state.current.lastTime = time;

      // Update logic
      update(dt);
      
      // Draw logic
      draw(ctx, canvas.width, canvas.height);

      state.current.frameId = requestAnimationFrame(loop);
    };

    state.current.lastTime = performance.now();
    state.current.frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(state.current.frameId);
      window.removeEventListener('resize', resize);
    };
  }, [gameState, endGame]);

  const update = (dt: number) => {
    const s = state.current;
    
    // Smooth player lane movement
    s.playerVisualX += (s.playerLane * LANE_WIDTH - s.playerVisualX) * 15 * dt;
    
    // Speed increases over time
    s.speed = Math.min(MAX_SPEED, BASE_SPEED + s.distanceTraveled * 0.01);
    audio.setEngineSpeed((s.speed - BASE_SPEED) / (MAX_SPEED - BASE_SPEED));

    // Move distance
    const moveDist = s.speed * dt;
    s.distanceTraveled += moveDist;

    // Update score
    const newScore = Math.floor(s.distanceTraveled);
    if (newScore > score) {
      if (newScore % 100 === 0) audio.playTick(); // Tick every 100 pts
      setScore(newScore);
    }

    // Spawn obstacles
    s.timeSinceLastSpawn += dt;
    // Spawn faster as speed increases
    const currentSpawnRate = Math.max(0.3, OBSTACLE_SPAWN_RATE * (BASE_SPEED / s.speed));
    
    if (s.timeSinceLastSpawn >= currentSpawnRate) {
      s.timeSinceLastSpawn = 0;
      // Randomly pick 1 or 2 lanes to fill
      const lanes = [-1, 0, 1].sort(() => Math.random() - 0.5).slice(0, Math.random() > 0.3 ? 1 : 2);
      
      lanes.forEach(lane => {
        s.obstacles.push({
          id: nextObstacleId.current++,
          lane,
          z: HORIZON_Z,
          type: Math.random() > 0.5 ? 'cube' : 'tall'
        });
      });
    }

    // Move obstacles and check collision
    s.obstacles.forEach(obs => {
      const oldZ = obs.z;
      obs.z -= moveDist;
      
      const collisionZStart = PLAYER_Z - 1.5;
      const collisionZEnd = PLAYER_Z + 1.5;

      // Collision detection (continuous sweep)
      if (oldZ >= collisionZStart && obs.z <= collisionZEnd) {
        // Check distance between player visual X and obstacle X
        const obsX = obs.lane * LANE_WIDTH;
        if (Math.abs(s.playerVisualX - obsX) < LANE_WIDTH * 0.6) {
          endGame();
        }
      }
    });

    // Remove passed obstacles
    s.obstacles = s.obstacles.filter(o => o.z > CAMERA_Z);

    // Update particles (speed lines)
    if (Math.random() > 0.5) {
      s.particles.push({
        x: (Math.random() - 0.5) * 20,
        y: Math.random() * 5 + 1,
        z: HORIZON_Z,
        life: 1,
        vx: 0,
        vy: 0,
        vz: -s.speed * 1.5
      });
    }

    s.particles.forEach(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.life -= dt * 0.5;
    });
    s.particles = s.particles.filter(p => p.life > 0 && p.z > CAMERA_Z);
  };

  const draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const s = state.current;

    // Background
    ctx.fillStyle = '#05050A';
    ctx.fillRect(0, 0, width, height);

    // Camera projection setup
    const focalLength = height * 1.5; // Less distortion, flatter top-down perspective
    const cy = height * 0.15; // Horizon Y moved up
    const cx = width / 2;
    const cameraY = 10; // Camera elevated significantly above ground

    const project = (x: number, y: number, z: number) => {
      // Prevent division by zero or negative z
      if (z <= 0.1) z = 0.1;
      const scale = focalLength / z;
      return {
        x: cx + x * scale,
        // Ground is y=0, camera is at cameraY. Ground appears below horizon.
        y: cy + (cameraY - y) * scale,
        scale
      };
    };

    // Draw Sky/Horizon Gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, cy);
    skyGradient.addColorStop(0, '#000000');
    skyGradient.addColorStop(1, 'rgba(0, 82, 255, 0.2)');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, cy);

    // Draw Ground (outside the road)
    ctx.fillStyle = '#020205';
    ctx.fillRect(0, cy, width, height - cy);

    // Draw Road Base
    const numLanes = 3;
    const highwayWidth = LANE_WIDTH * numLanes;
    
    ctx.beginPath();
    const rdTL = project(-highwayWidth/2 - 1, 0, HORIZON_Z);
    const rdTR = project(highwayWidth/2 + 1, 0, HORIZON_Z);
    const rdBR = project(highwayWidth/2 + 1, 0, 0.1);
    const rdBL = project(-highwayWidth/2 - 1, 0, 0.1);
    ctx.moveTo(rdTL.x, rdTL.y);
    ctx.lineTo(rdTR.x, rdTR.y);
    ctx.lineTo(rdBR.x, rdBR.y);
    ctx.lineTo(rdBL.x, rdBL.y);
    ctx.closePath();
    ctx.fillStyle = '#0A0A10';
    ctx.fill();

    // Road glow edges
    ctx.strokeStyle = '#0052FF';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00F0FF';
    ctx.beginPath();
    ctx.moveTo(rdTL.x, rdTL.y);
    ctx.lineTo(rdBL.x, rdBL.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rdTR.x, rdTR.y);
    ctx.lineTo(rdBR.x, rdBR.y);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw Lane Dividers (Dashed lines)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    const dashLength = 4;
    const gapLength = 4;
    const totalCycle = dashLength + gapLength;
    const offset = s.distanceTraveled % totalCycle;

    // We have 3 lanes, so 2 dividers at x = -LANE_WIDTH/2 and x = LANE_WIDTH/2
    for (let i = -0.5; i <= 0.5; i += 1) {
      const dividerX = i * LANE_WIDTH;
      for (let z = totalCycle - offset; z < HORIZON_Z; z += totalCycle) {
        if (z < 0.1) continue;
        const p1 = project(dividerX, 0, z);
        const p2 = project(dividerX, 0, z + dashLength);
        
        ctx.lineWidth = Math.max(1, p1.scale * 0.2);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }

    // Draw Speed Particles (Neon lines whizzing by on the sides)
    s.particles.forEach(p => {
      const p1 = project(p.x, p.y, p.z);
      const p2 = project(p.x, p.y, p.z + 4);
      
      ctx.strokeStyle = `rgba(0, 240, 255, ${p.life})`;
      ctx.lineWidth = Math.max(1, p1.scale * 0.05);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });

    // Sort objects (obstacles + player) by Z descending to draw back-to-front
    const drawables: { type: 'obs'|'player', data: any, z: number }[] = s.obstacles.map(o => ({ type: 'obs', data: o, z: o.z }));
    drawables.push({ type: 'player', data: s, z: PLAYER_Z });
    drawables.sort((a, b) => b.z - a.z);

    drawables.forEach(item => {
      if (item.type === 'obs') {
        const obs = item.data as Obstacle;
        if (obs.z < 0.1) return;

        const pBottom = project(obs.lane * LANE_WIDTH, 0, obs.z);
        const obsHeight = obs.type === 'tall' ? 3 : 1.5;
        const pTop = project(obs.lane * LANE_WIDTH, obsHeight, obs.z);
        
        const w = 2.5 * pBottom.scale; // Width of obstacle
        const h = pBottom.y - pTop.y; // Height on screen
        
        // Draw Obstacle (Neon Barricade)
        const obsX = pBottom.x - w/2;
        const obsY = pTop.y;

        ctx.shadowBlur = 15;
        ctx.shadowColor = '#FF33A8';
        ctx.fillStyle = '#1A000A';
        ctx.fillRect(obsX, obsY, w, h);
        
        ctx.lineWidth = Math.max(1, pBottom.scale * 0.1);
        ctx.strokeStyle = '#FF33A8';
        ctx.strokeRect(obsX, obsY, w, h);

        // Glowing diagonal stripes
        ctx.strokeStyle = 'rgba(255, 51, 168, 0.5)';
        ctx.beginPath();
        ctx.moveTo(obsX + w*0.2, obsY);
        ctx.lineTo(obsX, obsY + h*0.4);
        ctx.moveTo(obsX + w*0.8, obsY);
        ctx.lineTo(obsX, obsY + h*0.8);
        ctx.moveTo(obsX + w, obsY + h*0.2);
        ctx.lineTo(obsX + w*0.4, obsY + h);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
      } else {
        // Draw Player Bike
        const pBottom = project(s.playerVisualX, 0, PLAYER_Z);
        
        const w = 1.8 * pBottom.scale;
        const hLength = 2.5 * pBottom.scale;

        ctx.save();
        // Lift slightly off the exact ground point for a hover effect
        ctx.translate(pBottom.x, pBottom.y - hLength * 0.2);
        
        // Tilt the bike based on lane movement
        const bankAngle = (s.playerLane * LANE_WIDTH - s.playerVisualX) * 0.12;
        ctx.rotate(bankAngle);

        // 1. Neon Trail (drawn below bike, pointing towards bottom of screen)
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00F0FF';
        ctx.fillStyle = '#00F0FF';
        ctx.beginPath();
        ctx.moveTo(-w*0.25, 0);
        ctx.lineTo(w*0.25, 0);
        ctx.lineTo(0, hLength * 1.8);
        ctx.fill();

        // 2. Main Body (Bright White/Silver to stand out)
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#FFFFFF';
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(0, -hLength); // Nose (pointing to horizon)
        ctx.lineTo(-w*0.5, 0); // Left rear
        ctx.lineTo(0, -hLength*0.15); // Inner tail indent
        ctx.lineTo(w*0.5, 0); // Right rear
        ctx.closePath();
        ctx.fill();

        // 3. Canopy (Dark Glass)
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#020205';
        ctx.beginPath();
        ctx.moveTo(0, -hLength*0.75);
        ctx.lineTo(-w*0.2, -hLength*0.3);
        ctx.lineTo(0, -hLength*0.25);
        ctx.lineTo(w*0.2, -hLength*0.3);
        ctx.closePath();
        ctx.fill();

        // 4. Wing Accents (Neon Cyan)
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = Math.max(3, w * 0.08);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-w*0.5, 0);
        ctx.lineTo(-w*0.7, -hLength*0.4);
        ctx.moveTo(w*0.5, 0);
        ctx.lineTo(w*0.7, -hLength*0.4);
        ctx.stroke();

        // 5. Thrusters (Bright Gold/Cyan Core)
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#FFD700'; // Golden thruster glow
        ctx.beginPath();
        ctx.arc(-w*0.25, -hLength*0.05, w*0.15, 0, Math.PI*2);
        ctx.arc(w*0.25, -hLength*0.05, w*0.15, 0, Math.PI*2);
        ctx.fill();

        // Thruster inner cores
        ctx.fillStyle = '#FFD700';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(-w*0.25, -hLength*0.05, w*0.08, 0, Math.PI*2);
        ctx.arc(w*0.25, -hLength*0.05, w*0.08, 0, Math.PI*2);
        ctx.fill();

        ctx.restore();
      }
    });

    // Horizon line glow overlay
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#00F0FF';
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // UI Vignette
    const gradient = ctx.createRadialGradient(cx, height/2, height/3, cx, height/2, height);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  };

  const resetGame = useCallback(() => {
    state.current.isGameOver = true;
    audio.stopEngine();
    setGameState('menu');
  }, []);

  return {
    canvasRef,
    gameState,
    score,
    highScore,
    startGame,
    setLane,
    resetGame
  };
}
