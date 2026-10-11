import type { WorldData } from '../types/game';

export const WORLDS: readonly WorldData[] = [
  {
    id: 1,
    name: 'Enchanted Forest',
    description: 'Sunlit glades, soft moss, and whispering trees.',
    levels: [1, 2],
    colors: { sky: 0xb9d9c0, far: 0x8b9d83, mid: 0x71805c, near: 0x606c38, ground: 0x6b4f36, accent: 0xc08e3a },
  },
  {
    id: 2,
    name: 'Candy Kingdom',
    description: 'Bouncy sweets and winding caramel paths.',
    levels: [3, 4],
    colors: { sky: 0xe8dcc7, far: 0xd4b895, mid: 0xc99176, near: 0xb08b6e, ground: 0x6b4037, accent: 0xc66b3d },
  },
  {
    id: 3,
    name: 'Moonlight Garden',
    description: 'Quiet lanterns, crystal flowers, and a waiting wish.',
    levels: [5, 6],
    colors: { sky: 0x283618, far: 0x3f4d2c, mid: 0x606c38, near: 0x8b9d83, ground: 0x302c22, accent: 0xc08e3a },
  },
];

export const getWorld = (id: number): WorldData => WORLDS.find((world) => world.id === id) ?? WORLDS[0];
