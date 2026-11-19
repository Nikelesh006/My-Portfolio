/**
 * Headline for the Skills section hero layout
 * Edit this string to update the primary message.
 */
export const HEADLINE = "Turning ideas into working systems. Walk through the stack behind everything I build.";

/**
 * SKILL_CATEGORIES configuration for the 3D Loft Gallery and 2D List fallback
 * Edit this array to add, remove, or modify categories, skills, and ratings.
 *
 * Ground Floor (Y = 0):
 * - Backend: West wall (X = -14.92, Y = 1.9, Z = 1.0)
 * - Frontend: South wall (X = -3.0, Y = 1.9, Z = 9.92)
 * - Databases: West wall further back under mezzanine (X = -14.92, Y = 1.9, Z = -6.5)
 *
 * Upper Floor / Mezzanine (Y = 3.6):
 * - DevOps: Back North wall left (X = -8.0, Y = 5.5, Z = -9.92)
 * - AI: Back North wall center (X = 0.0, Y = 5.5, Z = -9.92)
 * - Tools: Back North wall right (X = 8.0, Y = 5.5, Z = -9.92)
 */
export const SKILL_CATEGORIES = [
  {
    id: 'backend',
    title: 'Backend',
    description: 'Scalable custom backends, microservices, and high-throughput REST APIs.',
    color: '#3b82f6',
    wall: 'west',
    floor: 0,
    position: [-14.92, 1.9, 1.0],
    rotation: [0, Math.PI / 2, 0],
    inspectCam: [-11.45, 1.9, 1.0],
    inspectTarget: [-14.92, 1.9, 1.0],
    tags: ['Node.js', 'Express', 'Fastify', 'REST APIs', 'TypeScript'],
    skills: [
      { name: 'Node.js', level: 94 },
      { name: 'Express & Fastify', level: 92 },
      { name: 'TypeScript', level: 90 },
      { name: 'REST APIs & Architecture', level: 95 },
      { name: 'API Security & Rate Limiting', level: 92 }
    ]
  },
  {
    id: 'frontend',
    title: 'Frontend',
    description: 'Modern, high-converting responsive interfaces with fluid animations.',
    color: '#8b5cf6',
    wall: 'south',
    floor: 0,
    position: [-3.0, 1.9, 9.92],
    rotation: [0, Math.PI, 0],
    inspectCam: [-3.0, 1.9, 6.45],
    inspectTarget: [-3.0, 1.9, 9.92],
    tags: ['React', 'Next.js', 'Tailwind CSS', 'HTML/CSS'],
    skills: [
      { name: 'React', level: 90 },
      { name: 'Next.js', level: 86 },
      { name: 'Tailwind CSS', level: 94 },
      { name: 'Modern CSS & Animations', level: 88 }
    ]
  },
  {
    id: 'databases',
    title: 'Databases',
    description: 'Relational & NoSQL schema design, indexing, and low-latency caching.',
    color: '#10b981',
    wall: 'west-back',
    floor: 0,
    position: [-14.92, 1.9, -6.5],
    rotation: [0, Math.PI / 2, 0],
    inspectCam: [-11.45, 1.9, -6.5],
    inspectTarget: [-14.92, 1.9, -6.5],
    tags: ['PostgreSQL', 'MongoDB', 'Supabase', 'Prisma', 'Redis'],
    skills: [
      { name: 'PostgreSQL', level: 90 },
      { name: 'MongoDB', level: 88 },
      { name: 'Redis (45% latency cut)', level: 92 },
      { name: 'Supabase & Prisma', level: 88 }
    ]
  },
  {
    id: 'devops',
    title: 'DevOps',
    description: 'Automated CI/CD pipelines, containerization, and 99.9% uptime targets.',
    color: '#f59e0b',
    wall: 'mezzanine-back-left',
    floor: 1,
    position: [-8.0, 5.5, -9.92],
    rotation: [0, 0, 0],
    inspectCam: [-8.0, 5.5, -6.45],
    inspectTarget: [-8.0, 5.5, -9.92],
    tags: ['Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions', 'CI/CD'],
    skills: [
      { name: 'Docker Containerization', level: 90 },
      { name: 'Kubernetes Orchestration', level: 82 },
      { name: 'GitHub Actions & Jenkins', level: 88 },
      { name: 'Production CI/CD Pipelines', level: 90 }
    ]
  },
  {
    id: 'ai',
    title: 'AI',
    description: 'AI architectures, tool calling, prompt engineering, and modern LLM workflows.',
    color: '#ec4899',
    wall: 'mezzanine-back-center',
    floor: 1,
    position: [0.0, 5.5, -9.92],
    rotation: [0, 0, 0],
    inspectCam: [0.0, 5.5, -6.45],
    inspectTarget: [0.0, 5.5, -9.92],
    tags: ['AI Architectures', 'LLM Integration', 'Prompt Engineering', 'Workflows'],
    skills: [
      { name: 'LLM APIs & Tool Calling', level: 85 },
      { name: 'AI Architecture Workflows', level: 82 },
      { name: 'Prompt Engineering', level: 88 }
    ]
  },
  {
    id: 'tools',
    title: 'Tools',
    description: 'Essential developer toolchain for collaborative high-speed shipping.',
    color: '#06b6d4',
    wall: 'mezzanine-back-right',
    floor: 1,
    position: [8.0, 5.5, -9.92],
    rotation: [0, 0, 0],
    inspectCam: [8.0, 5.5, -6.45],
    inspectTarget: [8.0, 5.5, -9.92],
    tags: ['Git', 'GitHub', 'Postman', 'VS Code'],
    skills: [
      { name: 'Git & Version Control', level: 94 },
      { name: 'GitHub Collaboration', level: 92 },
      { name: 'Postman API Testing', level: 92 },
      { name: 'VS Code & Linux CLI', level: 96 }
    ]
  }
];
