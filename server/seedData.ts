import {
  Profile,
  CreatorProfileData,
  PortfolioProject,
  Campaign,
  CampaignProposal,
  CampaignInvitation,
  SavedCreator,
  Conversation,
  Message,
  Review,
  NotificationItem,
  ReportedItem,
  ExperienceLevel,
  AvailabilityStatus,
  ContentFormat,
} from '../src/types/index.js';

export interface UserCredential {
  userId: string;
  email: string;
  passwordHash: string;
}

export interface DatabaseSchema {
  version?: string;
  users: UserCredential[];
  profiles: Profile[];
  creator_profiles: CreatorProfileData[];
  portfolio_projects: PortfolioProject[];
  campaigns: Campaign[];
  campaign_proposals: CampaignProposal[];
  campaign_invitations: CampaignInvitation[];
  saved_creators: SavedCreator[];
  conversations: Conversation[];
  messages: Message[];
  reviews: Review[];
  notifications: NotificationItem[];
  reported_items: ReportedItem[];
}

export const SEED_VERSION = '2.0-discover-138-inr';

// Curated high-resolution face-centered portraits (?crop=faces&w=400&h=400)
const PORTRAIT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
];

interface CategoryBlueprint {
  category: string;
  specialization: string;
  roles: string[];
  skills: string[];
  tools: string[];
  formats: ContentFormat[];
  images: string[]; // Strictly category-specific 4:3 / 16:9 visuals
  projectTemplates: { title: string; desc: string; deliverables: string[] }[];
  creators: { name: string; location: string; priceINR: number; exp: ExperienceLevel; years: number; rating: number; reviews: number }[];
}

const CATEGORY_BLUEPRINTS: CategoryBlueprint[] = [
  {
    category: 'Finance & Investing',
    specialization: 'AI FinTech & Market Data Visuals',
    roles: [
      'AI Financial Explainer Director',
      'Algorithmic Market Visualizer & FinTech Creator',
      'WealthTech AI Video Producer',
      'Macroeconomics & Stock Analysis AI Storyteller',
      'Crypto & Quantitative Data Motion Designer',
      'Personal Finance AI Avatar Educator',
    ],
    skills: ['Market Data Visualization', 'Cinematic AI Video', 'Interactive Course Avatars', 'Direct-Response Ad Hooks'],
    tools: ['Runway Gen-3 Alpha', 'HeyGen', 'ElevenLabs', 'Midjourney v6', 'Adobe Firefly'],
    formats: ['video', 'image'],
    images: [
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&w=900&q=80',
    ],
    projectTemplates: [
      {
        title: 'NIFTY & S&P 500 Institutional AI Market Outlook Series',
        desc: 'Automated 4K financial data visualization and AI avatar market commentary produced for a leading brokerage platform.',
        deliverables: ['10x 60s Market Analysis Reels', '3D Candlestick & Portfolio Motion Graphics', 'Bilingual EN/HI Voiceover'],
      },
      {
        title: 'Zerodha-Style WealthTech App Onboarding Campaign',
        desc: 'High-trust investor education commercials combining HeyGen executive avatars with animated compounding charts.',
        deliverables: ['3x 45s Explainer Videos', '12x Financial Infographic Carousels', 'Compliance-Ready Script Deck'],
      },
      {
        title: 'Global Macro & Mutual Fund SIP Visual Identity',
        desc: 'Photorealistic editorial illustrations and animated wealth-building explainers for retail investors.',
        deliverables: ['15x 4K Editorial Finance Visuals', '2x 30s YouTube Pre-Roll Ads'],
      },
    ],
    creators: [
      { name: 'Raghav Singhania', location: 'Mumbai, India', priceINR: 28000, exp: 'expert', years: 7, rating: 4.96, reviews: 44 },
      { name: 'Ananya Deshmukh', location: 'Bengaluru, India', priceINR: 22000, exp: 'senior', years: 5, rating: 4.91, reviews: 31 },
      { name: 'Vikramaditya Rao', location: 'Delhi NCR, India', priceINR: 35000, exp: 'expert', years: 8, rating: 4.94, reviews: 52 },
      { name: 'claire.vance', location: 'Singapore', priceINR: 42000, exp: 'expert', years: 6, rating: 4.89, reviews: 27 },
      { name: 'Siddharth Kulkarni', location: 'Pune, India', priceINR: 16500, exp: 'intermediate', years: 3, rating: 4.84, reviews: 19 },
      { name: 'Neha Kapoor-Shah', location: 'Mumbai, India', priceINR: 24500, exp: 'senior', years: 4, rating: 4.92, reviews: 36 },
    ],
  },
  {
    category: 'Education & E-Learning',
    specialization: 'AI EdTech & Interactive Course Production',
    roles: [
      'AI Curriculum & Interactive Video Architect',
      'STEM 3D Concept Visualizer & AI Educator',
      'Multilingual AI Avatar Course Producer',
      'EdTech Gamified Learning Designer',
      'Academic & Medical Animation AI Specialist',
      'K-12 & Competitive Exam Visual Storyteller',
    ],
    skills: ['Interactive Course Avatars', 'Multilingual Voice Cloning', '3D Motion Graphics', 'Cinematic AI Video'],
    tools: ['HeyGen', 'ElevenLabs', 'Runway Gen-3 Alpha', 'Midjourney v6', 'Suno AI'],
    formats: ['video', 'audio', 'image'],
    images: [
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80',
    ],
    projectTemplates: [
      {
        title: 'Multilingual AI Instructor Micro-Course (6 Indian Languages)',
        desc: 'Produced a 20-module upskilling video series with lip-synced AI instructors speaking English, Hindi, Tamil, and Telugu.',
        deliverables: ['20x 5-Minute HD Lesson Videos', 'Interactive Quiz Infographics', '6-Language Dubbed Audio Tracks'],
      },
      {
        title: 'Visualizing Quantum Physics & Cellular Biology with AI Cinema',
        desc: 'Transformed abstract textbook chapters into immersive 4K animated visual journeys for university learners.',
        deliverables: ['8x 3D + AI Concept Animations', '40x High-Res Study Diagrams'],
      },
      {
        title: 'Cohort-Based Coding Bootcamp Launch Campaign',
        desc: 'High-retention educational trailers and student transformation stories built with Runway Gen-3 and ElevenLabs.',
        deliverables: ['3x 60s Course Trailers', '15x Educational Carousel Graphics'],
      },
    ],
    creators: [
      { name: 'Dr. Meera Iyer', location: 'Chennai, India', priceINR: 26000, exp: 'expert', years: 7, rating: 4.97, reviews: 49 },
      { name: 'Arjun Verma', location: 'New Delhi, India', priceINR: 18500, exp: 'senior', years: 4, rating: 4.88, reviews: 29 },
      { name: 'Priyanka Nair', location: 'Kochi, India', priceINR: 15000, exp: 'intermediate', years: 3, rating: 4.85, reviews: 22 },
      { name: 'Prof. Kabir Sen', location: 'Kolkata, India', priceINR: 31000, exp: 'expert', years: 9, rating: 4.95, reviews: 38 },
      { name: 'Elena Carter', location: 'London, UK', priceINR: 38000, exp: 'senior', years: 5, rating: 4.90, reviews: 25 },
      { name: 'Rohan Malhotra', location: 'Hyderabad, India', priceINR: 19500, exp: 'senior', years: 4, rating: 4.87, reviews: 24 },
    ],
  },
  {
    category: 'Business & Entrepreneurship',
    specialization: 'B2B Executive Branding & Startup Storytelling',
    roles: [
      'Startup Pitch & Keynote AI Visual Director',
      'Executive LinkedIn & B2B Video Strategist',
      'Corporate Brand Film AI Producer',
      'SaaS Growth & Founder Storyteller',
      'Venture Capital Deck & Vision Film Creator',
      'Enterprise AI Communications Specialist',
    ],
    skills: ['Cinematic AI Video', 'Direct-Response Ad Hooks', 'Market Data Visualization', 'Editorial Lookbooks'],
    tools: ['Midjourney v6', 'Runway Gen-3 Alpha', 'HeyGen', 'ElevenLabs', 'Flux.1 Pro'],
    formats: ['video', 'image'],
    images: [
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80',
    ],
    projectTemplates: [
      {
        title: 'Series B Startup Vision Film & Investor Pitch Visuals',
        desc: 'Directed a 90-second product vision film and 24 custom boardroom keynote slides that helped close a $18M Series B round.',
        deliverables: ['90s 4K Vision Manifesto Film', '24x Custom AI Pitch Deck Visuals', 'Executive Voiceover'],
      },
      {
        title: 'Founder Thought-Leadership Video Engine (30 Episodes)',
        desc: 'Built a repeatable AI video + b-roll synthesis pipeline for B2B SaaS founders on LinkedIn and YouTube.',
        deliverables: ['30x 60s Executive LinkedIn Videos', 'Custom Brand B-Roll Library'],
      },
      {
        title: 'Global Enterprise Summit Opening Title Sequence',
        desc: 'Futuristic corporate keynote opener blending architectural motion graphics and generative brand metaphors.',
        deliverables: ['45s 4K Event Opener', 'Stage LED Wall Loops'],
      },
    ],
    creators: [
      { name: 'Harshvardhan Joshi', location: 'Bengaluru, India', priceINR: 34000, exp: 'expert', years: 6, rating: 4.94, reviews: 37 },
      { name: 'Natasha Oberoi', location: 'Gurugram, India', priceINR: 29000, exp: 'senior', years: 5, rating: 4.91, reviews: 33 },
      { name: 'Karanvir Gill', location: 'Mumbai, India', priceINR: 21000, exp: 'senior', years: 4, rating: 4.86, reviews: 21 },
      { name: 'Marcus Vance', location: 'New York, USA', priceINR: 48000, exp: 'expert', years: 8, rating: 4.95, reviews: 45 },
      { name: 'Shreya Chatterjee', location: 'Bengaluru, India', priceINR: 18000, exp: 'intermediate', years: 3, rating: 4.83, reviews: 18 },
      { name: 'Devansh Parekh', location: 'Ahmedabad, India', priceINR: 23000, exp: 'senior', years: 4, rating: 4.89, reviews: 26 },
    ],
  },
  {
    category: 'Technology & AI',
    specialization: 'Neural Visuals, Robotics & DeepTech Demos',
    roles: [
      'DeepTech & AI Product Launch Director',
      'ComfyUI Workflow Architect & Neural Artist',
      'Robotics & Future-Tech Concept Visualizer',
      'Developer Tools & Cloud SaaS Motion Creator',
      'Generative UI & Spatial Computing Designer',
      'AI Research & Model Launch Filmmaker',
    ],
    skills: ['Cinematic AI Video', 'Custom LoRA Training', '3D Motion Graphics', 'Photorealistic Product Renders'],
    tools: ['OpenAI Sora', 'Runway Gen-3 Alpha', 'ComfyUI', 'Flux.1 Pro', 'Luma Dream Machine'],
    formats: ['video', 'image', 'interactive'],
    images: [
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=900&q=80',
    ],
    projectTemplates: [
      {
        title: 'SYNAPSE OS — Next-Gen AI Agent Platform Launch Film',
        desc: 'Futuristic 60-second product reveal combining holographic UI motion, neural data streams, and OpenAI Sora scenes.',
        deliverables: ['60s 4K Product Launch Film', '15x Hero Website Renders', 'Interactive Lottie Loops'],
      },
      {
        title: 'Humanoid Robotics Industrial Showcase',
        desc: 'Photorealistic robotics simulation and industrial automation visuals crafted with ComfyUI ControlNet and Flux.1 Pro.',
        deliverables: ['3x 30s Robotics Demo Spots', '20x 8K Hardware Stills'],
      },
      {
        title: 'Cybersecurity & Quantum Cloud Visual System',
        desc: 'Abstract dark-mode glassmorphic key visuals and 3D node animations for an enterprise cloud security unicorn.',
        deliverables: ['25x Brand Key Visuals', 'Custom Trained Brand Style LoRA'],
      },
    ],
    creators: [
      { name: 'Aria Vance', location: 'Los Angeles, USA', priceINR: 45000, exp: 'expert', years: 6, rating: 4.95, reviews: 28 },
      { name: 'Aarav Krishnamurthy', location: 'Bengaluru, India', priceINR: 32000, exp: 'expert', years: 6, rating: 4.96, reviews: 42 },
      { name: 'Tanvi Deshpande', location: 'Hyderabad, India', priceINR: 24000, exp: 'senior', years: 4, rating: 4.90, reviews: 30 },
      { name: 'Kenji Takahashi', location: 'Tokyo, Japan', priceINR: 49000, exp: 'expert', years: 7, rating: 4.94, reviews: 35 },
      { name: 'Pranav Subramanian', location: 'Chennai, India', priceINR: 19000, exp: 'intermediate', years: 3, rating: 4.85, reviews: 20 },
      { name: 'Zara Al-Mansoor', location: 'Dubai, UAE', priceINR: 38000, exp: 'senior', years: 5, rating: 4.91, reviews: 27 },
    ],
  },
  {
    category: 'Gaming & Esports',
    specialization: 'Game Trailers, Lore Worldbuilding & Esports VFX',
    roles: [
      'AI Game Trailer & Cinematic Lore Director',
      'Esports Tournament Graphics & Motion Artist',
      'RPG Character & Environment Concept Architect',
      'Unreal + ComfyUI Hybrid Cinematics Lead',
      'Gaming Streamer Identity & Animated Overlay Creator',
      'Sci-Fi & Fantasy Worldbuilding Specialist',
    ],
    skills: ['Cinematic AI Video', '3D Motion Graphics', 'Custom LoRA Training', 'Sonic Branding & AI Music'],
    tools: ['OpenAI Sora', 'Midjourney v6', 'Runway Gen-3 Alpha', 'ComfyUI', 'Suno AI'],
    formats: ['video', 'image', 'audio'],
    images: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
    ],
    projectTemplates: [
      {
        title: 'VALKYRIE PROTOCOL — 90s AAA Sci-Fi Game Lore Trailer',
        desc: 'Cinematic game reveal trailer featuring 12 consistent armored characters, mech battles, and bespoke spatial audio.',
        deliverables: ['90s 4K Game Trailer', '30x Character & Weapon Concept Sheets', 'Dolby Atmos Sound Mix'],
      },
      {
        title: 'Global Esports Arena Broadcast Package & Team Intro',
        desc: 'High-octane neon hype reels, player walkout visuals, and animated HUD overlays for a 500k-viewer tournament.',
        deliverables: ['60s Tournament Hype Opener', '16x Team Intro Loops', 'Stream Overlay Kit'],
      },
      {
        title: 'Dark Fantasy Open-World Environment Concept Bible',
        desc: '100+ consistent environment matte paintings and animated weather loops for an indie RPG studio.',
        deliverables: ['100x 8K Environment Concepts', 'Custom World Style LoRA'],
      },
    ],
    creators: [
      { name: 'Liam O’Connor', location: 'Dublin, Ireland', priceINR: 36000, exp: 'senior', years: 4, rating: 4.88, reviews: 23 },
      { name: 'DhruvBhattacharya', location: 'Bengaluru, India', priceINR: 22000, exp: 'senior', years: 4, rating: 4.92, reviews: 34 },
      { name: 'Riyaan Sheikh', location: 'Mumbai, India', priceINR: 17500, exp: 'intermediate', years: 3, rating: 4.86, reviews: 19 },
      { name: 'Soraia Mendes', location: 'Lisbon, Portugal', priceINR: 31000, exp: 'senior', years: 5, rating: 4.90, reviews: 28 },
      { name: 'Yashwardhan Rana', location: 'Pune, India', priceINR: 14500, exp: 'intermediate', years: 2, rating: 4.81, reviews: 15 },
      { name: 'Alexei Volkov', location: 'Warsaw, Poland', priceINR: 41000, exp: 'expert', years: 6, rating: 4.95, reviews: 39 },
    ],
  },
  {
    category: 'Health & Fitness',
    specialization: 'Athletic Performance, Gym Commercials & Wellness AI',
    roles: [
      'Sports & Athletic Brand AI Commercial Director',
      'Biomechanics & Workout Visualizer',
      'Fitness App & Wearable Tech Video Producer',
      'Holistic Wellness & Yoga Visual Storyteller',
      'Sports Nutrition & Supplement Ad Strategist',
      'AI Fitness Coach & Training Avatar Creator',
    ],
    skills: ['Cinematic AI Video', 'Direct-Response Ad Hooks', 'Virtual Brand Ambassadors', 'Photorealistic Product Renders'],
    tools: ['Runway Gen-3 Alpha', 'Kling AI', 'Flux.1 Pro', 'HeyGen', 'ElevenLabs'],
    formats: ['video', 'image'],
    images: [
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=900&q=80',
    ],
    projectTemplates: [
      {
        title: 'APEX PULSE — High-Intensity Sportswear & Gym Launch Spot',
        desc: 'Dynamic 30-second athletic commercial with slow-motion sweat physics, neon gym lighting, and motivational voiceover.',
        deliverables: ['30s 4K Hero Commercial', '4x 15s Vertical Reels', '15x High-Contrast Athlete Stills'],
      },
      {
        title: '3D Muscle Biomechanics & AI Workout App Library',
        desc: 'Created 60 anatomical exercise demonstrations highlighting targeted muscle activation for a mobile fitness app.',
        deliverables: ['60x 4K Exercise Loops', 'Voice-Guided Form Coaching Audio'],
      },
      {
        title: 'Whey & Electrolyte Hydration D2C Ad Suite',
        desc: 'Explosive powder-burst and ice-splash product visuals paired with high-converting TikTok/Reels hooks.',
        deliverables: ['20x Product Action Renders', '5x Performance Video Ads'],
      },
    ],
    creators: [
      { name: 'Kabir Shergill', location: 'Chandigarh, India', priceINR: 23000, exp: 'senior', years: 5, rating: 4.93, reviews: 32 },
      { name: 'Ayesha Merchant', location: 'Mumbai, India', priceINR: 21000, exp: 'senior', years: 4, rating: 4.89, reviews: 26 },
      { name: 'Lucas Thorne', location: 'Sydney, Australia', priceINR: 39000, exp: 'expert', years: 6, rating: 4.94, reviews: 38 },
      { name: 'Nikhil Gowda', location: 'Bengaluru, India', priceINR: 16000, exp: 'intermediate', years: 3, rating: 4.84, reviews: 17 },
      { name: 'Simran Kaur', location: 'New Delhi, India', priceINR: 19500, exp: 'senior', years: 4, rating: 4.88, reviews: 24 },
      { name: 'Mateo Silva', location: 'São Paulo, Brazil', priceINR: 27000, exp: 'senior', years: 5, rating: 4.91, reviews: 29 },
    ],
  },
  {
    category: 'Food & Cooking',
    specialization: 'Culinary AI Photography, Recipe Cinema & Beverage Ads',
    roles: [
      'AI Culinary Photographer & Food Stylist',
      'Artisanal Beverage & Splash VFX Director',
      'Cloud Kitchen & QSR Menu Visual Architect',
      'Recipe Reels & Gourmet Storytelling Producer',
      'CPG Food Packaging & Tabletop AI Artist',
      'Fine-Dining Hospitality Visual Director',
    ],
    skills: ['Photorealistic Product Renders', 'Custom LoRA Training', 'Cinematic AI Video', 'Editorial Lookbooks'],
    tools: ['Flux.1 Pro', 'Midjourney v6', 'Magnific AI', 'Runway Gen-3 Alpha', 'ComfyUI'],
    formats: ['image', 'video'],
    images: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
    ],
    projectTemplates: [
      {
        title: 'SPICE SYMPHONY — Michelin-Grade Indian Fusion Menu Suite',
        desc: 'Generated 50+ steaming, macro-textured culinary photographs for a luxury restaurant group and delivery app launch.',
        deliverables: ['50x 8K Culinary Dishes Stills', '5x Slow-Motion Pour & Steam Loops', 'Menu Print Layouts'],
      },
      {
        title: 'Artisanal Cold-Brew & Matcha Splash Commercial',
        desc: 'High-speed liquid simulation and botanical ingredient explosions crafted with Flux.1 LoRA and Runway Gen-3.',
        deliverables: ['2x 20s Beverage Commercials', '24x Condensation Can Renders'],
      },
      {
        title: 'Gourmet Artisanal Chocolate & Patisserie Campaign',
        desc: 'Velvety molten chocolate macro cinematography and festive gift-box visuals.',
        deliverables: ['18x Editorial Food Posters', '3x 15s Instagram Reels'],
      },
    ],
    creators: [
      { name: 'Chef Vivaan Luthra', location: 'Mumbai, India', priceINR: 25000, exp: 'expert', years: 6, rating: 4.95, reviews: 39 },
      { name: 'Amélie Laurent', location: 'Lyon, France', priceINR: 38000, exp: 'expert', years: 7, rating: 4.96, reviews: 41 },
      { name: 'Radhika Menon', location: 'Bengaluru, India', priceINR: 18000, exp: 'senior', years: 4, rating: 4.89, reviews: 27 },
      { name: 'Armaan Qureshi', location: 'Lucknow, India', priceINR: 15500, exp: 'intermediate', years: 3, rating: 4.85, reviews: 21 },
      { name: 'Kenzo Watanabe', location: 'Osaka, Japan', priceINR: 34000, exp: 'senior', years: 5, rating: 4.92, reviews: 30 },
      { name: 'Tara Bhandari', location: 'New Delhi, India', priceINR: 21000, exp: 'senior', years: 4, rating: 4.90, reviews: 25 },
    ],
  },
  {
    category: 'Travel & Tourism',
    specialization: 'Destination Cinema, Hospitality Campaigns & Virtual Tours',
    roles: [
      'Luxury Resort & Hospitality AI Film Director',
      'Destination Tourism Board Visual Storyteller',
      'Aerial & Landscape Neural Cinematographer',
      'Aviation & Cruise Line AI Campaign Producer',
      'Cultural Heritage & Eco-Tourism Visualizer',
      'Multilingual Travel Vlog & Itinerary Creator',
    ],
    skills: ['Cinematic AI Video', 'Editorial Lookbooks', 'Multilingual Voice Cloning', '3D Motion Graphics'],
    tools: ['OpenAI Sora', 'Runway Gen-3 Alpha', 'Luma Dream Machine', 'Midjourney v6', 'ElevenLabs'],
    formats: ['video', 'image'],
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=900&q=80',
    ],
    projectTemplates: [
      {
        title: 'ROYAL RAJASTHAN & HIMALAYAS — Luxury Hospitality Film',
        desc: 'Golden-hour cinematic travel campaign showcasing palace heritage suites and mountain retreats in 4K.',
        deliverables: ['60s Flagship Destination Film', '25x 8K Resort Editorial Photos', '4x Multilingual Cutdowns'],
      },
      {
        title: 'Maldives Overwater Villa & Marine Sanctuary Experience',
        desc: 'Seamless drone-to-underwater transition reel created with Luma Dream Machine and Runway Gen-3 Alpha.',
        deliverables: ['3x 30s Vertical Reels', '15x Luxury Suite Visuals'],
      },
      {
        title: 'Next-Gen Airline First-Class Cabin Concept Showcase',
        desc: 'Photorealistic interior cabin lighting and cloudscape window views for an international aviation rebrand.',
        deliverables: ['20x Cabin Concept Renders', '30s Commercial Spot'],
      },
    ],
    creators: [
      { name: 'Samarth Malhotra', location: 'Udaipur, India', priceINR: 27000, exp: 'expert', years: 6, rating: 4.94, reviews: 35 },
      { name: 'Ishita Sen-Gupta', location: 'Goa, India', priceINR: 22000, exp: 'senior', years: 4, rating: 4.90, reviews: 28 },
      { name: 'Matteo Rossi', location: 'Milan, Italy', priceINR: 42000, exp: 'expert', years: 7, rating: 4.96, reviews: 43 },
      { name: 'Reyansh Thakur', location: 'Manali, India', priceINR: 16500, exp: 'intermediate', years: 3, rating: 4.85, reviews: 19 },
      { name: 'Freya Lindqvist', location: 'Stockholm, Sweden', priceINR: 37000, exp: 'senior', years: 5, rating: 4.92, reviews: 31 },
      { name: 'Aaditya Chauhan', location: 'Jaipur, India', priceINR: 19500, exp: 'senior', years: 4, rating: 4.88, reviews: 22 },
    ],
  },
  {
    category: 'Fashion & Beauty',
    specialization: 'Haute Couture Lookbooks, Skincare Commercials & Virtual Models',
    roles: [
      'Generative Fashion Art Director & Editorial Lead',
      'Luxury Skincare & Cosmetics AI Film Director',
      'Virtual Runway & Digital Garment LoRA Specialist',
      'Jewelry & High-Watchmaking Macro AI Artist',
      'Clean Beauty & Botanical Campaign Producer',
      'Streetwear & Avant-Garde Lookbook Creator',
    ],
    skills: ['Editorial Lookbooks', 'Custom LoRA Training', 'Cinematic AI Video', 'Virtual Brand Ambassadors'],
    tools: ['Midjourney v6', 'Flux.1 Pro', 'Magnific AI', 'Runway Gen-3 Alpha', 'ComfyUI'],
    formats: ['image', 'video'],
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80',
    ],
    projectTemplates: [
      {
        title: 'MAISON ECLIPSE — Neo-Surrealist Haute Couture Lookbook',
        desc: '36-page digital fashion lookbook blending liquid gold textiles with Parisian neo-classical architecture.',
        deliverables: ['36x 8K Editorial Lookbook Stills', 'Garment Texture LoRA', '3x Runway Motion Reels'],
      },
      {
        title: 'LUMINA BOTANICALS — Bio-Retinol Serum 4K Commercial',
        desc: 'Macro botanical dewdrop physics and glass bottle caustics with 100% label typography preservation.',
        deliverables: ['30s 4K Beauty Spot', '15x Macro Skincare Stills'],
      },
      {
        title: 'Bridal & Fine Heritage Jewelry Campaign',
        desc: 'Hyper-detailed diamond and Kundan jewelry model portraits across royal courtyard lighting setups.',
        deliverables: ['25x 8K Jewelry Model Portraits', 'Social Carousel Suite'],
      },
    ],
    creators: [
      { name: 'Chloé Dubois', location: 'Paris, France', priceINR: 44000, exp: 'senior', years: 5, rating: 4.94, reviews: 25 },
      { name: 'Shanaya Kapoor-Modi', location: 'Mumbai, India', priceINR: 28000, exp: 'expert', years: 6, rating: 4.95, reviews: 41 },
      { name: 'Meherjaan Irani', location: 'New Delhi, India', priceINR: 23500, exp: 'senior', years: 4, rating: 4.91, reviews: 29 },
      { name: 'Valentina Moretti', location: 'Milan, Italy', priceINR: 46000, exp: 'expert', years: 7, rating: 4.96, reviews: 47 },
      { name: 'Dia Mirchandani', location: 'Mumbai, India', priceINR: 18500, exp: 'intermediate', years: 3, rating: 4.87, reviews: 22 },
      { name: 'Reyna Chatterjee', location: 'Kolkata, India', priceINR: 21000, exp: 'senior', years: 4, rating: 4.89, reviews: 24 },
    ],
  },
  {
    category: 'Digital Marketing',
    specialization: 'High-ROAS Performance Ads, UGC Hooks & Funnel Visuals',
    roles: [
      'Performance AI Ad Creative Strategist',
      'Direct-Response Meta & TikTok Video Producer',
      'A/B Creative Testing & Hook Engineer',
      'B2B Lead-Gen & Growth Marketing AI Creator',
      'Conversion Rate Optimization (CRO) Visual Designer',
      'Multi-Channel Ad Localization Specialist',
    ],
    skills: ['Direct-Response Ad Hooks', 'Cinematic AI Video', 'Virtual Brand Ambassadors', 'Multilingual Voice Cloning'],
    tools: ['HeyGen', 'Runway Gen-3 Alpha', 'ElevenLabs', 'Midjourney v6', 'Kling AI'],
    formats: ['video', 'image'],
    images: [
      'https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1557838923-2985c318be48?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&q=80',
    ],
    projectTemplates: [
      {
        title: 'FINFLOW — 20x Performance AI UGC Ad Suite (3.8x ROAS)',
        desc: 'Engineered 20 rapid-iteration TikTok & Meta video ads featuring AI spokespeople, dynamic B-roll, and split-tested visual hooks.',
        deliverables: ['20x 9:16 Video Ads', 'Hook Retention Matrix', 'Ad Copy Variations'],
      },
      {
        title: 'D2C Mega-Sale Omnichannel Conversion Kit',
        desc: 'Produced 45 static and animated performance ad banners across Meta, Google Discovery, and YouTube Shorts.',
        deliverables: ['45x Multi-Ratio Ad Creatives', '6x Video Hook Variants'],
      },
      {
        title: 'SaaS Free-Trial Funnel Explainer & Retargeting Series',
        desc: 'Data-backed retargeting ads addressing customer objections with realistic AI presenters.',
        deliverables: ['8x Retargeting Video Spots', 'Landing Page Hero Visuals'],
      },
    ],
    creators: [
      { name: 'Devon Brooks', location: 'Austin, USA', priceINR: 29000, exp: 'senior', years: 4, rating: 4.86, reviews: 21 },
      { name: 'Varun Sood-Mehta', location: 'Gurugram, India', priceINR: 22500, exp: 'senior', years: 5, rating: 4.92, reviews: 35 },
      { name: 'Kritika Bhardwaj', location: 'Mumbai, India', priceINR: 18500, exp: 'senior', years: 4, rating: 4.89, reviews: 27 },
      { name: 'Gaurav Taneja-Roy', location: 'Bengaluru, India', priceINR: 25000, exp: 'expert', years: 6, rating: 4.93, reviews: 38 },
      { name: 'SanaMirza-Khan', location: 'Hyderabad, India', priceINR: 14500, exp: 'intermediate', years: 3, rating: 4.84, reviews: 18 },
      { name: 'Jordan Lee', location: 'Toronto, Canada', priceINR: 34000, exp: 'senior', years: 5, rating: 4.90, reviews: 29 },
    ],
  },
  {
    category: 'Social Media Influencers',
    specialization: 'Virtual AI Influencers, Consistent Personas & Reels Creators',
    roles: [
      'Virtual AI Influencer & Digital Ambassador Architect',
      'Character Consistency & FaceID LoRA Specialist',
      'Gen-Z TikTok & Instagram Reels AI Persona Director',
      'Multilingual Virtual Spokesperson Creator',
      'Digital Fashion & Lifestyle Avatar Producer',
      'Always-On Brand Mascot & Virtual Creator Lead',
    ],
    skills: ['Virtual Brand Ambassadors', 'Custom LoRA Training', 'Direct-Response Ad Hooks', 'Multilingual Voice Cloning'],
    tools: ['Flux.1 Pro', 'ComfyUI', 'HeyGen', 'Kling AI', 'ElevenLabs', 'Midjourney v6'],
    formats: ['image', 'video'],
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
    ],
    projectTemplates: [
      {
        title: 'MIRA — Virtual Streetwear Ambassador (1.2M Organic Views)',
        desc: 'Created a digital Gen-Z sustainable fashion influencer with 100% facial identity lock across 25 shoots and 6 speaking Reels.',
        deliverables: ['Character Bible & Face LoRA', '25x Streetwear Lookbook Stills', '6x Lip-Synced Reels'],
      },
      {
        title: 'KAYA — Bilingual Tech & Lifestyle Virtual Creator',
        desc: 'Always-on brand ambassador reviewing wearable gadgets in English and Hindi with natural gesture synthesis.',
        deliverables: ['15x Product Placement Stills', '5x 30s Speaking Unboxing Reels'],
      },
      {
        title: 'Virtual Brand Host for Live E-Commerce Shopping',
        desc: 'Interactive digital presenter capable of showcasing seasonal apparel drops 24/7.',
        deliverables: ['Custom Avatar Rig', '10x Promotional Short Videos'],
      },
    ],
    creators: [
      { name: 'Zoya Mehta', location: 'Mumbai, India', priceINR: 32000, exp: 'senior', years: 4, rating: 4.88, reviews: 19 },
      { name: 'Aisha Qureshi', location: 'New Delhi, India', priceINR: 24000, exp: 'senior', years: 4, rating: 4.92, reviews: 31 },
      { name: 'Hana Kim', location: 'Seoul, South Korea', priceINR: 45000, exp: 'expert', years: 6, rating: 4.96, reviews: 44 },
      { name: 'Tanya Malhotra', location: 'Mumbai, India', priceINR: 19000, exp: 'intermediate', years: 3, rating: 4.86, reviews: 22 },
      { name: 'Rhea Chakraborty-Sen', location: 'Bengaluru, India', priceINR: 21500, exp: 'senior', years: 4, rating: 4.89, reviews: 25 },
      { name: 'Mila Novak', location: 'Prague, Czechia', priceINR: 31000, exp: 'senior', years: 5, rating: 4.91, reviews: 28 },
    ],
  },
  {
    category: 'Entertainment & Comedy',
    specialization: 'Viral Skits, Parody Trailers & Episodic AI Storytelling',
    roles: [
      'Viral AI Comedy & Satire Video Creator',
      'Episodic Short-Film & Sci-Fi Storyteller',
      'Pop-Culture Mashup & Concept Trailer Director',
      'Animated Sitcom & Character Voice Producer',
      'OTT Promo & Key Art Generative Designer',
      'Interactive Narrative & Meme Campaign Specialist',
    ],
    skills: ['Cinematic AI Video', 'Multilingual Voice Cloning', 'Direct-Response Ad Hooks', 'Sonic Branding & AI Music'],
    tools: ['Runway Gen-3 Alpha', 'OpenAI Sora', 'ElevenLabs', 'Suno AI', 'Pika Labs'],
    formats: ['video', 'audio'],
    images: [
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=80',
    ],
    projectTemplates: [
      {
        title: 'RETRO BOLLYWOOD 2099 — Viral Brand Parody Trailer',
        desc: 'Comedic cyberpunk-meets-70s cinema brand commercial that generated 4.2M organic shares for a snack brand.',
        deliverables: ['60s 4K Comedy Trailer', '5x Meme Cutdowns', 'Custom Retro-Synth Soundtrack'],
      },
      {
        title: 'Animated AI Office Sitcom Series for HR SaaS Brand',
        desc: '10-episode relatable workplace comedy shorts with expressive multi-character lip-sync and punchy dialogue.',
        deliverables: ['10x 45s Episodic Shorts', 'Character Voice Pack'],
      },
      {
        title: 'OTT Streaming Series Title Design & Promo Teasers',
        desc: 'Moody cinematic title sequence and character poster suite for a thriller web series.',
        deliverables: ['45s Title Sequence', '12x Character Key Art Posters'],
      },
    ],
    creators: [
      { name: 'Viraj Ghelani-ai', location: 'Mumbai, India', priceINR: 24000, exp: 'senior', years: 5, rating: 4.93, reviews: 36 },
      { name: 'Kunal Kamra-Synth', location: 'Bengaluru, India', priceINR: 19500, exp: 'senior', years: 4, rating: 4.88, reviews: 24 },
      { name: 'Mallika Dua-VFX', location: 'New Delhi, India', priceINR: 22000, exp: 'senior', years: 4, rating: 4.90, reviews: 29 },
      { name: 'Leo Fernandez', location: 'Madrid, Spain', priceINR: 33000, exp: 'expert', years: 6, rating: 4.92, reviews: 31 },
      { name: 'Abhishek Upmanyu-AI', location: 'Mumbai, India', priceINR: 26000, exp: 'senior', years: 5, rating: 4.94, reviews: 40 },
      { name: 'Srishti Dixit-Labs', location: 'Mumbai, India', priceINR: 17000, exp: 'intermediate', years: 3, rating: 4.85, reviews: 20 },
    ],
  },
  {
    category: 'Science & Research',
    specialization: 'Medical 3D Animation, Biotech & Space Visualization',
    roles: [
      'Biotech & Molecular AI Animation Director',
      'Astrophysics & Aerospace Concept Visualizer',
      'Medical Device & Pharmacology Explainer Producer',
      'Climate & Data Science Visual Communicator',
      'Nanotechnology & Quantum Physics Artist',
      'Academic Journal Cover & Research Filmmaker',
    ],
    skills: ['3D Motion Graphics', 'Cinematic AI Video', 'Market Data Visualization', 'Interactive Course Avatars'],
    tools: ['Runway Gen-3 Alpha', 'Midjourney v6', 'ComfyUI', 'Luma Dream Machine', 'ElevenLabs'],
    formats: ['video', 'image'],
    images: [
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=900&q=80',
    ],
    projectTemplates: [
      {
        title: 'CRISPR Gene Editing & mRNA Mechanism 4K Visualization',
        desc: 'Sub-cellular molecular animation and narrated mechanism-of-action (MoA) film for a Series C biotech firm.',
        deliverables: ['90s 4K Mechanism-of-Action Film', '20x High-Res Molecular Renders', 'Scientific Voiceover'],
      },
      {
        title: 'Orbital Satellite Constellation & Deep-Space Mission Promo',
        desc: 'Photorealistic low-Earth orbit satellite deployment visuals for a private aerospace startup.',
        deliverables: ['60s Aerospace Mission Video', '15x 8K Space Key Visuals'],
      },
      {
        title: 'NeuroTech Brain-Computer Interface Keynote Visuals',
        desc: ' synaptic impulse simulations and medical hardware renders for an international neurology symposium.',
        deliverables: ['12x 4K Medical Animation Loops', 'Keynote Slide Visuals'],
      },
    ],
    creators: [
      { name: 'Dr. Vikram Sarabhai-AI', location: 'Bengaluru, India', priceINR: 38000, exp: 'expert', years: 8, rating: 4.97, reviews: 41 },
      { name: 'Dr. Nandini Rao', location: 'Hyderabad, India', priceINR: 32000, exp: 'expert', years: 6, rating: 4.95, reviews: 33 },
      { name: 'Henrik Lindholm', location: 'Zurich, Switzerland', priceINR: 52000, exp: 'expert', years: 9, rating: 4.96, reviews: 37 },
      { name: 'Ashwin Rajagopal', location: 'Chennai, India', priceINR: 24000, exp: 'senior', years: 4, rating: 4.89, reviews: 22 },
      { name: 'Pallavi Joshi-PhD', location: 'Pune, India', priceINR: 26500, exp: 'senior', years: 5, rating: 4.91, reviews: 26 },
      { name: 'Dr. Ethan Brooks', location: 'Boston, USA', priceINR: 47000, exp: 'expert', years: 7, rating: 4.94, reviews: 30 },
    ],
  },
  {
    category: 'Real Estate',
    specialization: 'Architectural 3D Walkthroughs, Virtual Staging & Luxury PropTech',
    roles: [
      'Architectural AI Visualizer & 3D Flythrough Director',
      'Luxury Real Estate Virtual Staging Specialist',
      'Commercial Property & Smart City Concept Creator',
      'Interior Design Moodboard & ControlNet Architect',
      'Hospitality & Resort Pre-Construction Filmmaker',
      'PropTech Drone + AI Hybrid Video Producer',
    ],
    skills: ['Architectural AI Walkthroughs', '3D Motion Graphics', 'Photorealistic Product Renders', 'Cinematic AI Video'],
    tools: ['ComfyUI', 'ControlNet / LoRA', 'Midjourney v6', 'Luma Dream Machine', 'Magnific AI'],
    formats: ['image', 'video'],
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80',
    ],
    projectTemplates: [
      {
        title: 'THE SKYLINE PENTHOUSE — 4K Pre-Construction AI Flythrough',
        desc: 'Converted CAD wireframes using ComfyUI ControlNet Depth into photorealistic twilight penthouse renders and smooth camera flythroughs.',
        deliverables: ['60s 4K Architectural Flythrough', '25x 8K Interior & Exterior Renders', 'Day-to-Dusk Lighting Variants'],
      },
      {
        title: 'Instant Virtual Staging for 50 Luxury Villas',
        desc: 'Transformed empty shell rooms into warm Scandinavian and Modern Indian luxury interiors in 48 hours.',
        deliverables: ['50x 8K Virtually Staged Room Photos', 'Before/After Interactive Slider Assets'],
      },
      {
        title: 'Sustainable Commercial Tech Park Masterplan Film',
        desc: 'Aerial visualization of a biophilic commercial campus for an institutional real estate developer.',
        deliverables: ['45s Masterplan Reveal Video', '15x Brochure Hero Renders'],
      },
    ],
    creators: [
      { name: 'Ar. Kabir Raheja', location: 'Mumbai, India', priceINR: 35000, exp: 'expert', years: 7, rating: 4.95, reviews: 42 },
      { name: 'Niharika Hiranandani', location: 'Bengaluru, India', priceINR: 28000, exp: 'senior', years: 5, rating: 4.92, reviews: 31 },
      { name: 'Tariq Al-habtoor', location: 'Dubai, UAE', priceINR: 49000, exp: 'expert', years: 8, rating: 4.96, reviews: 48 },
      { name: 'Vedant Malhotra', location: 'Gurugram, India', priceINR: 22000, exp: 'senior', years: 4, rating: 4.88, reviews: 24 },
      { name: 'Sanjana Godrej-Labs', location: 'Pune, India', priceINR: 19000, exp: 'intermediate', years: 3, rating: 4.86, reviews: 19 },
      { name: 'Julian Vance-Arch', location: 'London, UK', priceINR: 41000, exp: 'senior', years: 6, rating: 4.91, reviews: 29 },
    ],
  },
  {
    category: 'E-commerce & Product Advertising',
    specialization: 'Zero-Studio 8K Product LoRAs, Packaging & Commercials',
    roles: [
      'Photorealistic AI Product Photographer & LoRA Architect',
      'D2C E-Commerce Hero Banner & PDP Video Creator',
      'Luxury Watch, Fragrance & Cosmetics AI Director',
      'Consumer Electronics & Gadget CGI+AI Visualizer',
      'Amazon & Shopify Conversion Visual Specialist',
      'Packaging Mockup & 3D Product Spin Producer',
    ],
    skills: ['Photorealistic Product Renders', 'Custom LoRA Training', 'Direct-Response Ad Hooks', 'Cinematic AI Video'],
    tools: ['Flux.1 Pro', 'Stable Diffusion XL', 'ComfyUI', 'ControlNet / LoRA', 'Magnific AI'],
    formats: ['image', 'video'],
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=80',
    ],
    projectTemplates: [
      {
        title: 'KORI MATCHA — Zero-Studio Global Beverage Campaign',
        desc: 'Trained a bespoke Flux LoRA on 18 smartphone photos of the client’s aluminum can to generate 40+ 8K condensation and Kyoto zen-garden visuals.',
        deliverables: ['40x 8K Product Stills', 'Custom Product LoRA Model', 'E-commerce Hero Banners'],
      },
      {
        title: 'SOLARIS EAU DE PARFUM — Volcanic Glass Editorial',
        desc: 'Physics-accurate caustic light refraction through amber perfume glass over black basalt cliffs.',
        deliverables: ['20x Editorial Print Renders', '3x 15s Product Cinemagraphs'],
      },
      {
        title: 'SonicPro ANC Headphones — 3D + AI Launch Kit',
        desc: 'Sleek matte-black industrial product renders and exploded-view acoustic animations for a D2C audio launch.',
        deliverables: ['30x Shopify PDP Product Images', '2x 20s Launch Videos'],
      },
    ],
    creators: [
      { name: 'Kael Tanaka', location: 'Tokyo, Japan', priceINR: 33000, exp: 'expert', years: 5, rating: 4.92, reviews: 41 },
      { name: 'Rishabh Jain-Studio', location: 'Mumbai, India', priceINR: 21000, exp: 'senior', years: 4, rating: 4.91, reviews: 33 },
      { name: 'Anushka Sharma-Synth', location: 'Bengaluru, India', priceINR: 18500, exp: 'senior', years: 4, rating: 4.88, reviews: 26 },
      { name: 'Prateek Agarwal', location: 'New Delhi, India', priceINR: 15000, exp: 'intermediate', years: 3, rating: 4.85, reviews: 20 },
      { name: 'Sofia Lindberg', location: 'Copenhagen, Denmark', priceINR: 39000, exp: 'expert', years: 6, rating: 4.95, reviews: 37 },
      { name: 'Karan Johar-VFX', location: 'Mumbai, India', priceINR: 27000, exp: 'senior', years: 5, rating: 4.90, reviews: 29 },
    ],
  },
  {
    category: 'Photography & Videography',
    specialization: 'Anamorphic Neural Cinema, Hybrid VFX & Portrait Stills',
    roles: [
      'AI Commercial Cinematographer & Colorist',
      'Hybrid Live-Action + Generative VFX Director',
      'Editorial Portrait & Cyberpunk Street Photographer',
      'Music Video & Visual Album AI Director',
      '8K Upscaling & Restoration Specialist',
      'Documentary & Archival Recreation Filmmaker',
    ],
    skills: ['Cinematic AI Video', 'Editorial Lookbooks', 'Photorealistic Product Renders', 'Custom LoRA Training'],
    tools: ['Runway Gen-3 Alpha', 'OpenAI Sora', 'Midjourney v6', 'Magnific AI', 'Flux.1 Pro'],
    formats: ['video', 'image'],
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1516961642265-531546e84af2?auto=format&fit=crop&w=900&q=80',
    ],
    projectTemplates: [
      {
        title: 'NEON MONSOON — Anamorphic 4K Brand Short Film',
        desc: 'Shot on RED V-Raptor and augmented with Runway Gen-3 neural set extensions and rain reflections.',
        deliverables: ['2-Minute 4K Master Short Film', '20x Anamorphic Stills', 'Custom LUT Pack'],
      },
      {
        title: 'Editorial Celebrity & Founder Portrait Series',
        desc: 'Studio-lit medium-format portrait series enhanced with Magnific 8K skin-texture preservation.',
        deliverables: ['30x 8K Retouched Portraits', 'Magazine Cover Layouts'],
      },
      {
        title: 'Historical Heritage Recreation Documentary Visuals',
        desc: 'Brought 19th-century archival photographs to life in smooth 24fps 4K motion for a museum exhibition.',
        deliverables: ['15x Archival Motion Recreations', 'Exhibition Projection Master'],
      },
    ],
    creators: [
      { name: 'Avinash Gowariker-AI', location: 'Mumbai, India', priceINR: 36000, exp: 'expert', years: 8, rating: 4.96, reviews: 46 },
      { name: 'Rohan Shrestha-Labs', location: 'Mumbai, India', priceINR: 31000, exp: 'expert', years: 6, rating: 4.93, reviews: 34 },
      { name: 'Zoya Akhtar-Frames', location: 'New Delhi, India', priceINR: 27500, exp: 'senior', years: 5, rating: 4.91, reviews: 28 },
      { name: 'Dabboo Ratnani-Synth', location: 'Mumbai, India', priceINR: 42000, exp: 'expert', years: 9, rating: 4.95, reviews: 51 },
      { name: 'Karthik Subbaraj-VFX', location: 'Chennai, India', priceINR: 23000, exp: 'senior', years: 4, rating: 4.88, reviews: 23 },
      { name: 'Nora Lindstrom', location: 'Berlin, Germany', priceINR: 34000, exp: 'senior', years: 5, rating: 4.90, reviews: 27 },
    ],
  },
  {
    category: 'Animation & Motion Graphics',
    specialization: 'FOOH Viral CGI, 3D ControlNet Motion & Anime Synthesis',
    roles: [
      '3D-to-AI Motion Artist & FOOH Viral Animator',
      'Blender + ComfyUI ControlNet Motion Lead',
      'Stylized Anime & 2D-to-3D AI Animation Director',
      'Kinetic Typography & Abstract Brand Motion Designer',
      'Liquid & Particle Simulation AI VFX Artist',
      'Interactive WebGL & Lottie AI Motion Creator',
    ],
    skills: ['3D Motion Graphics', 'Cinematic AI Video', 'Custom LoRA Training', 'Direct-Response Ad Hooks'],
    tools: ['ComfyUI', 'ControlNet / LoRA', 'Luma Dream Machine', 'Runway Gen-3 Alpha', 'Pika Labs'],
    formats: ['video', 'interactive'],
    images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1618172193763-c511deb635ca?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=900&q=80',
    ],
    projectTemplates: [
      {
        title: 'GIANT SNEAKER OVER MARINE DRIVE & BERLIN — Viral FOOH CGI',
        desc: 'Combined smartphone footage with Blender depth passes and ComfyUI ControlNet to animate a 40m holographic sneaker.',
        deliverables: ['3x 15s FOOH Vertical Videos', 'Custom SFX & Street Foley'],
      },
      {
        title: 'Cyber-Anime Brand Commercial for Gaming Laptop',
        desc: 'High-frame-rate anime action commercial with consistent mech transformations and custom LoRA shading.',
        deliverables: ['30s 4K Anime Spot', 'Character Turnaround Sheets'],
      },
      {
        title: 'Liquid Chrome & Iridescent Glass Brand Ident Package',
        desc: 'Seamless 3D + AI morphing loops for a global design festival.',
        deliverables: ['10x 4K Seamless Motion Loops', 'Broadcast Lower-Thirds'],
      },
    ],
    creators: [
      { name: 'Elena Rostova', location: 'Berlin, Germany', priceINR: 39000, exp: 'senior', years: 4, rating: 4.91, reviews: 22 },
      { name: 'Siddharth Anand-Motion', location: 'Mumbai, India', priceINR: 28000, exp: 'expert', years: 6, rating: 4.94, reviews: 35 },
      { name: 'Ayan Mukerji-VFX', location: 'Mumbai, India', priceINR: 32000, exp: 'expert', years: 7, rating: 4.95, reviews: 40 },
      { name: 'Tushar Kalia-3D', location: 'Bengaluru, India', priceINR: 19500, exp: 'senior', years: 4, rating: 4.88, reviews: 24 },
      { name: 'Haruki Sato', location: 'Tokyo, Japan', priceINR: 44000, exp: 'expert', years: 6, rating: 4.96, reviews: 38 },
      { name: 'Divya Khosla-Anim', location: 'Pune, India', priceINR: 16500, exp: 'intermediate', years: 3, rating: 4.84, reviews: 18 },
    ],
  },
  {
    category: 'Music & Audio',
    specialization: 'AI Sonic Branding, Multilingual Voice Cloning & Generative Scores',
    roles: [
      'AI Voiceover, Localization & Generative Audio Director',
      'Sonic Branding & Bespoke AI Music Composer',
      'Multilingual Dubbing & Lip-Sync Audio Engineer',
      'Spatial Audio & Dolby Atmos Commercial Mixer',
      'Podcast Synthesis & Audiobook AI Producer',
      'Game & Film Trailer Hybrid Score Composer',
    ],
    skills: ['Sonic Branding & AI Music', 'Multilingual Voice Cloning', 'Cinematic AI Video', 'Interactive Course Avatars'],
    tools: ['ElevenLabs', 'Suno AI', 'HeyGen'],
    formats: ['audio', 'video'],
    images: [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80',
    ],
    projectTemplates: [
      {
        title: 'NEBULA AUDIO — 8-Language Emotional AI Voice Campaign',
        desc: 'Produced an emotional cinematic brand manifesto narrated in 8 Indian and European languages using ethical voice cloning and generative orchestral stems.',
        deliverables: ['8x Localized 60s Audio Masters', 'Bespoke Sonic Logo', 'Dolby Atmos WAV Stems'],
      },
      {
        title: 'Sonic Mnemonic & Brand Anthem for FinTech Super-App',
        desc: '3-second payment confirmation sonic chime + 90-second upbeat electronic brand anthem.',
        deliverables: ['Master Sonic Logo Pack', 'Full Commercial Buyout Score'],
      },
      {
        title: 'Regional Ad Dubbing Suite (Hindi, Tamil, Telugu, Marathi, Bengali)',
        desc: 'Frame-accurate emotional voice localization for a national D2C television and YouTube campaign.',
        deliverables: ['5x Broadcast WAV Masters', 'Lip-Sync Aligned Video Exports'],
      },
    ],
    creators: [
      { name: 'Marcus Sterling', location: 'London, UK', priceINR: 22000, exp: 'expert', years: 7, rating: 4.85, reviews: 33 },
      { name: 'A.R. Ameen-Sonic', location: 'Chennai, India', priceINR: 34000, exp: 'expert', years: 8, rating: 4.97, reviews: 49 },
      { name: 'Shreya Ghoshal-Vox', location: 'Mumbai, India', priceINR: 29000, exp: 'expert', years: 6, rating: 4.95, reviews: 42 },
      { name: 'Prateek Kuhad-Audio', location: 'New Delhi, India', priceINR: 21000, exp: 'senior', years: 4, rating: 4.90, reviews: 28 },
      { name: 'nucleya.synth', location: 'Goa, India', priceINR: 26000, exp: 'senior', years: 5, rating: 4.92, reviews: 35 },
      { name: 'Anuv Jain-Acoustic', location: 'Ludhiana, India', priceINR: 15000, exp: 'intermediate', years: 3, rating: 4.86, reviews: 21 },
    ],
  },
  {
    category: 'Lifestyle & Personal Development',
    specialization: 'Mindfulness Apps, Productivity Aesthetics & Creator Vlogs',
    roles: [
      'Mindfulness & Meditation App AI Visual Director',
      'Productivity & Habit System Content Creator',
      'Minimalist Interior & Daily Aesthetic Storyteller',
      'Personal Growth & Audiobook Visual Producer',
      'Luxury Everyday Carry (EDC) & Workspace Creator',
      'Holistic Coaching & Retreats Campaign Designer',
    ],
    skills: ['Cinematic AI Video', 'Editorial Lookbooks', 'Multilingual Voice Cloning', 'Virtual Brand Ambassadors'],
    tools: ['Midjourney v6', 'Runway Gen-3 Alpha', 'ElevenLabs', 'Suno AI', 'Flux.1 Pro'],
    formats: ['video', 'image', 'audio'],
    images: [
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=900&q=80',
    ],
    projectTemplates: [
      {
        title: 'SERENITY AI — 30-Day Guided Sleep & Meditation Visuals',
        desc: 'Soothing ambient nature loops, bioluminescent forest animations, and calming spatial voiceovers for a top wellness app.',
        deliverables: ['30x 4K Ambient Visual Loops', '30x Guided Voice & Soundbath Tracks'],
      },
      {
        title: 'Notion-Style Productivity App Launch Campaign',
        desc: 'Clean minimalist workspace aesthetics and animated workflow explainers for a productivity SaaS launch.',
        deliverables: ['3x 30s Launch Videos', '20x Minimalist Social Visuals'],
      },
      {
        title: 'Bestselling Self-Improvement Book Trailer Suite',
        desc: 'Cinematic visual metaphors and author voice-cloned Reels for a global book launch.',
        deliverables: ['60s Book Trailer', '10x Quote Reels'],
      },
    ],
    creators: [
      { name: 'Jay Shetty-Inspire', location: 'London, UK', priceINR: 38000, exp: 'expert', years: 7, rating: 4.96, reviews: 45 },
      { name: 'Ankur Warikoo-Labs', location: 'New Delhi, India', priceINR: 29000, exp: 'expert', years: 6, rating: 4.94, reviews: 40 },
      { name: 'Prajakta Koli-Vibes', location: 'Mumbai, India', priceINR: 24000, exp: 'senior', years: 5, rating: 4.91, reviews: 32 },
      { name: 'Mira Rajput-Wellness', location: 'Mumbai, India', priceINR: 21000, exp: 'senior', years: 4, rating: 4.89, reviews: 25 },
      { name: 'Sadhguru-Visuals', location: 'Coimbatore, India', priceINR: 31000, exp: 'expert', years: 6, rating: 4.95, reviews: 38 },
      { name: 'Clara Lind', location: 'Oslo, Norway', priceINR: 27000, exp: 'senior', years: 4, rating: 4.88, reviews: 22 },
    ],
  },
  {
    category: 'News & Media',
    specialization: 'Virtual Broadcast Studios, Data Journalism & Documentary AI',
    roles: [
      'AI News Anchor & Virtual Broadcast Studio Architect',
      'Data Journalism & Interactive Infographic Director',
      'Current Affairs Documentary Visual Producer',
      'Multilingual Regional News Localization Lead',
      'Sports & Election Graphics Motion Specialist',
      'Digital Media Publisher Automation Consultant',
    ],
    skills: ['Interactive Course Avatars', 'Market Data Visualization', 'Multilingual Voice Cloning', 'Cinematic AI Video'],
    tools: ['HeyGen', 'ElevenLabs', 'Runway Gen-3 Alpha', 'Midjourney v6', 'Adobe Firefly'],
    formats: ['video', 'audio', 'image'],
    images: [
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1526666923127-b2970f64b422?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80',
    ],
    projectTemplates: [
      {
        title: '24/7 Multilingual AI News Desk & Virtual Anchor Rig',
        desc: 'Designed a virtual broadcast studio and 4 photorealistic news anchors delivering automated daily briefings in 6 languages.',
        deliverables: ['4x Custom Virtual Anchor Rigs', 'Broadcast Studio 3D Set', 'Automated TTS Pipeline'],
      },
      {
        title: 'Global Economic & Climate Data Documentary Series',
        desc: 'Investigative visual journalism blending satellite maps, 3D data charts, and archival reconstructions.',
        deliverables: ['6x 3-Minute Documentary Explainers', '30x Social News Infographics'],
      },
      {
        title: 'Podcast-to-Video Automated Newsroom Clips',
        desc: 'High-retention vertical news reels with dynamic captions and contextual AI b-roll.',
        deliverables: ['50x Vertical News Shorts', 'Brand Graphic Package'],
      },
    ],
    creators: [
      { name: 'Faye D’Souza-Media', location: 'Mumbai, India', priceINR: 32000, exp: 'expert', years: 7, rating: 4.95, reviews: 39 },
      { name: 'Palki Sharma-Studio', location: 'New Delhi, India', priceINR: 36000, exp: 'expert', years: 8, rating: 4.96, reviews: 47 },
      { name: 'Dhruv Rathee-Explainers', location: 'Berlin, Germany', priceINR: 41000, exp: 'expert', years: 6, rating: 4.97, reviews: 54 },
      { name: 'Ravish Kumar-Docs', location: 'New Delhi, India', priceINR: 28000, exp: 'senior', years: 6, rating: 4.92, reviews: 33 },
      { name: 'Shereen Bhan-Biz', location: 'Mumbai, India', priceINR: 34000, exp: 'expert', years: 7, rating: 4.94, reviews: 36 },
      { name: 'Nitish Rajput-Research', location: 'New Delhi, India', priceINR: 25000, exp: 'senior', years: 4, rating: 4.91, reviews: 30 },
    ],
  },
  {
    category: 'Automotive',
    specialization: 'EV Hypercar Commercials, CGI Track Action & Cockpit Renders',
    roles: [
      'Automotive CGI + AI Commercial Film Director',
      'Electric Vehicle (EV) Launch & Aerodynamics Visualizer',
      'Custom Car LoRA & Nocturnal Track Cinematographer',
      'Motorsport & Superbike High-Speed VFX Artist',
      'Luxury Cockpit & Infotainment UI Designer',
      'Auto Dealership & Configurator Visual Specialist',
    ],
    skills: ['Cinematic AI Video', 'Photorealistic Product Renders', 'Custom LoRA Training', '3D Motion Graphics'],
    tools: ['Runway Gen-3 Alpha', 'Flux.1 Pro', 'ComfyUI', 'ControlNet / LoRA', 'Luma Dream Machine'],
    formats: ['video', 'image'],
    images: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=80',
    ],
    projectTemplates: [
      {
        title: 'VOLT GT-R — Nocturnal Tokyo & Ladakh EV Launch Commercial',
        desc: 'Trained a custom vehicle LoRA on CAD renders to place an upcoming electric SUV across Himalayan passes and wet neon highways.',
        deliverables: ['45s 4K Automotive Commercial', '25x 8K Billboard & Print Renders', 'Custom Vehicle LoRA'],
      },
      {
        title: 'Aerodynamic Wind-Tunnel & Battery Chassis Visualization',
        desc: 'X-ray technical animation showcasing solid-state battery architecture and active downforce.',
        deliverables: ['30s Technical Reveal Spot', '12x Cutaway Engineering Visuals'],
      },
      {
        title: 'Superbike Monsoon Track Day Campaign',
        desc: 'High-adrenaline rolling shots and asphalt spray visuals generated without closing a physical racetrack.',
        deliverables: ['3x 15s High-Octane Reels', '20x Dealer Showroom Posters'],
      },
    ],
    creators: [
      { name: 'Hormazd Sorabjee-Auto', location: 'Mumbai, India', priceINR: 39000, exp: 'expert', years: 8, rating: 4.96, reviews: 42 },
      { name: 'Faisal Khan-Torque', location: 'Mumbai, India', priceINR: 28000, exp: 'senior', years: 5, rating: 4.92, reviews: 35 },
      { name: 'Pratap Bose-Design', location: 'Pune, India', priceINR: 46000, exp: 'expert', years: 9, rating: 4.97, reviews: 48 },
      { name: 'Lukas Weber', location: 'Stuttgart, Germany', priceINR: 54000, exp: 'expert', years: 7, rating: 4.95, reviews: 39 },
      { name: 'Gagan Choudhary-EV', location: 'Jaipur, India', priceINR: 22000, exp: 'senior', years: 4, rating: 4.89, reviews: 27 },
      { name: 'Rohan Kulkarni-CGI', location: 'Chennai, India', priceINR: 24500, exp: 'senior', years: 5, rating: 4.90, reviews: 24 },
    ],
  },
  {
    category: 'Agriculture & Farming',
    specialization: 'AgriTech Drone Visuals, Smart Farming & Rural Education AI',
    roles: [
      'AgriTech & Precision Farming AI Visual Director',
      'Multilingual Farmer Education & Kisan Avatar Creator',
      'Organic Farm-to-Table Supply Chain Storyteller',
      'Drone Crop Analytics & Hydroponics Visualizer',
      'Agricultural Machinery & Tractor 3D+AI Producer',
      'Sustainable Soil & Irrigation Campaign Specialist',
    ],
    skills: ['Multilingual Voice Cloning', 'Interactive Course Avatars', 'Cinematic AI Video', 'Photorealistic Product Renders'],
    tools: ['HeyGen', 'ElevenLabs', 'Midjourney v6', 'Runway Gen-3 Alpha', 'Flux.1 Pro'],
    formats: ['video', 'image', 'audio'],
    images: [
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80',
    ],
    projectTemplates: [
      {
        title: 'KISAN DRONE AI — 10-Language Precision Farming Education Suite',
        desc: 'Produced 30 WhatsApp-ready educational videos with local-dialect AI avatars explaining drone spraying and soil health.',
        deliverables: ['30x Regional Language Explainer Videos', 'Illustrated Crop Advisory Cards'],
      },
      {
        title: 'Farm-to-Fork Organic Spice & Grain Traceability Film',
        desc: 'Warm cinematic storytelling connecting Himalayan organic farmers to global supermarket shelves.',
        deliverables: ['60s Brand Origin Film', '20x Packaging & Field Stills'],
      },
      {
        title: 'Smart Hydroponics & Vertical Greenhouse Investor Showcase',
        desc: 'Futuristic controlled-environment agriculture renders for an AgriTech Series A pitch.',
        deliverables: ['15x 8K Greenhouse Renders', '45s Explainer Animation'],
      },
    ],
    creators: [
      { name: 'Dr. Balराम Jakhar-Agri', location: 'Ludhiana, India', priceINR: 18500, exp: 'senior', years: 5, rating: 4.93, reviews: 31 },
      { name: 'Kavita Kuruganti-Eco', location: 'Hyderabad, India', priceINR: 16500, exp: 'senior', years: 4, rating: 4.90, reviews: 24 },
      { name: 'Prashanth Patil', location: 'Nashik, India', priceINR: 14500, exp: 'intermediate', years: 3, rating: 4.87, reviews: 19 },
      { name: 'Subhash Palekar-Organic', location: 'Nagpur, India', priceINR: 21000, exp: 'expert', years: 6, rating: 4.94, reviews: 34 },
      { name: 'Meenakshi Sundaram', location: 'Coimbatore, India', priceINR: 17500, exp: 'senior', years: 4, rating: 4.89, reviews: 22 },
      { name: 'Hendrik Van Der Berg', location: 'Wageningen, Netherlands', priceINR: 35000, exp: 'expert', years: 7, rating: 4.92, reviews: 28 },
    ],
  },
  {
    category: 'Environment & Sustainability',
    specialization: 'CleanTech, Renewable Energy, ESG Reports & Climate Visuals',
    roles: [
      'CleanTech & Renewable Energy AI Film Director',
      'Corporate ESG & Net-Zero Impact Visualizer',
      'Solar, Wind & Green Hydrogen 3D+AI Architect',
      'Wildlife & Ocean Conservation Documentary Creator',
      'Circular Economy & Sustainable Packaging Designer',
      'Climate Data & Carbon Credit Explainer Producer',
    ],
    skills: ['Cinematic AI Video', 'Market Data Visualization', '3D Motion Graphics', 'Editorial Lookbooks'],
    tools: ['OpenAI Sora', 'Runway Gen-3 Alpha', 'Midjourney v6', 'Luma Dream Machine', 'ElevenLabs'],
    formats: ['video', 'image'],
    images: [
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=900&q=80',
    ],
    projectTemplates: [
      {
        title: 'GREEN HYDROGEN 2030 — Clean Energy Megaproject Film',
        desc: 'Aerial visualization of solar parks, offshore wind turbines, and green hydrogen electrolyzers for a global energy summit.',
        deliverables: ['90s 4K CleanTech Manifesto Film', '20x 8K Infrastructure Renders', 'ESG Report Infographics'],
      },
      {
        title: 'Zero-Plastic Ocean & Circular Packaging Campaign',
        desc: 'Biodegradable mycelium and seaweed packaging renders paired with ocean restoration storytelling.',
        deliverables: ['30s Impact Commercial', '15x Sustainable Packaging Mockups'],
      },
      {
        title: 'Satellite Reforestation & Biodiversity Impact Tracker',
        desc: 'Data-driven visual storytelling turning carbon-offset metrics into inspiring investor updates.',
        deliverables: ['4x Impact Explainer Reels', 'Interactive ESG Slide Deck'],
      },
    ],
    creators: [
      { name: 'Sunita Narain-Eco', location: 'New Delhi, India', priceINR: 28000, exp: 'expert', years: 7, rating: 4.96, reviews: 38 },
      { name: 'Sonam Wangchuk-Solar', location: 'Leh, Ladakh, India', priceINR: 34000, exp: 'expert', years: 8, rating: 4.98, reviews: 53 },
      { name: 'Dia Mirza-Earth', location: 'Mumbai, India', priceINR: 29000, exp: 'senior', years: 5, rating: 4.93, reviews: 34 },
      { name: 'Afroz Shah-Oceans', location: 'Mumbai, India', priceINR: 21000, exp: 'senior', years: 4, rating: 4.90, reviews: 27 },
      { name: 'Astrid Holm', location: 'Copenhagen, Denmark', priceINR: 42000, exp: 'expert', years: 6, rating: 4.95, reviews: 31 },
      { name: 'Kaveri Nambisan-Green', location: 'Coorg, India', priceINR: 18500, exp: 'intermediate', years: 3, rating: 4.87, reviews: 21 },
    ],
  },
];

export function getInitialSeedData(hashPasswordFn: (pw: string) => string): DatabaseSchema {
  const defaultPasswordHash = hashPasswordFn('Demo@123');

  const profiles: Profile[] = [];
  const creator_profiles: CreatorProfileData[] = [];
  const portfolio_projects: PortfolioProject[] = [];

  // Map specific known IDs so existing campaigns/proposals/logins work seamlessly
  const preservedEmails: Record<string, { id: string; email: string }> = {
    'Aria Vance': { id: 'creator-1', email: 'aria.vance@creatorconnect.ai' },
    'Kael Tanaka': { id: 'creator-2', email: 'kael.tanaka@creatorconnect.ai' },
    'Zoya Mehta': { id: 'creator-3', email: 'zoya.mehta@creatorconnect.ai' },
    'Marcus Sterling': { id: 'creator-4', email: 'marcus.sterling@creatorconnect.ai' },
    'Elena Rostova': { id: 'creator-5', email: 'elena.rostova@creatorconnect.ai' },
    'Devon Brooks': { id: 'creator-6', email: 'devon.brooks@creatorconnect.ai' },
    'Chloé Dubois': { id: 'creator-7', email: 'chloe.dubois@creatorconnect.ai' },
    'Liam O’Connor': { id: 'creator-8', email: 'liam.oconnor@creatorconnect.ai' },
  };

  let runningCreatorCounter = 9;
  let runningPortfolioCounter = 1;

  CATEGORY_BLUEPRINTS.forEach((bp, catIdx) => {
    bp.creators.forEach((cInfo, cIdx) => {
      const preserved = preservedEmails[cInfo.name];
      const creatorId = preserved ? preserved.id : `creator-${runningCreatorCounter++}`;
      const slug = cInfo.name.toLowerCase().replace(/[^a-z0-9]/g, '.');
      const email = preserved ? preserved.email : `${slug}.${catIdx}@creatorconnect.ai`;
      const avatarUrl = PORTRAIT_AVATARS[(catIdx * 6 + cIdx) % PORTRAIT_AVATARS.length];
      const roleTitle = bp.roles[cIdx % bp.roles.length];
      const availability: AvailabilityStatus = cIdx === 4 ? 'busy' : 'available';

      // Neighboring category for secondary cross-disciplinary expertise
      const secondaryCat = CATEGORY_BLUEPRINTS[(catIdx + 1) % CATEGORY_BLUEPRINTS.length].category;

      const createdDate = new Date(
        Date.UTC(2026, (catIdx + cIdx) % 9, ((cIdx * 4 + catIdx) % 27) + 1, 10, 0, 0)
      ).toISOString();

      profiles.push({
        id: creatorId,
        email,
        name: cInfo.name,
        role: 'creator',
        avatar_url: avatarUrl,
        bio: `${roleTitle} specializing in ${bp.category} and ${bp.specialization}. Crafting high-impact commercial deliverables using ${bp.tools.slice(0, 3).join(', ')} with ${cInfo.years}+ years of industry experience.`,
        location: cInfo.location,
        languages: cInfo.location.includes('India') ? ['English', 'Hindi'] : ['English'],
        company_name: `${cInfo.name.split(' ')[0]} AI Studio`,
        website: `https://creatorconnect.ai/creators/${creatorId}`,
        social_links: {
          portfolio: `https://creatorconnect.ai/creators/${creatorId}`,
          instagram: `@${slug}.ai`,
          linkedin: slug,
        },
        verified: cIdx < 5,
        created_at: createdDate,
      });

      const starterPrice = cInfo.priceINR;
      const proPrice = Math.round(starterPrice * 2.2);
      const entPrice = Math.round(starterPrice * 4.5);

      creator_profiles.push({
        creator_id: creatorId,
        title: roleTitle,
        industry_category: bp.category,
        specialization: bp.category,
        secondary_categories: [bp.specialization, secondaryCat],
        skills: bp.skills,
        ai_tools: bp.tools,
        content_formats: bp.formats,
        starting_price: starterPrice,
        packages: [
          {
            name: 'Starter',
            price: starterPrice,
            deliveryDays: 3,
            revisions: 2,
            description: `Essential ${bp.category} AI creative package tailored to your brand brief.`,
            deliverables: bp.projectTemplates[0].deliverables.slice(0, 2),
          },
          {
            name: 'Pro',
            price: proPrice,
            deliveryDays: 6,
            revisions: 4,
            description: `Full multi-format ${bp.category} campaign bundle with custom model consistency.`,
            deliverables: bp.projectTemplates[0].deliverables,
          },
          {
            name: 'Enterprise',
            price: entPrice,
            deliveryDays: 12,
            revisions: 6,
            description: `End-to-end commercial suite with bespoke LoRA training and full buyout rights.`,
            deliverables: [...bp.projectTemplates[0].deliverables, 'Custom Trained Brand LoRA Weights'],
          },
        ],
        availability,
        experience_years: cInfo.years,
        experience_level: cInfo.exp,
        rating: cInfo.rating,
        review_count: cInfo.reviews,
        completed_campaigns: Math.round(cInfo.reviews * 1.25),
        profile_views: 650 + (catIdx * 130 + cIdx * 190),
        featured: cIdx === 0 || cIdx === 1,
        response_time: cIdx % 2 === 0 ? '< 1 hour' : '< 2 hours',
      });

      // Create 3 distinct category-matched portfolio projects for this creator
      for (let pIdx = 0; pIdx < 3; pIdx++) {
        const tpl = bp.projectTemplates[pIdx % bp.projectTemplates.length];
        const img1 = bp.images[(cIdx + pIdx * 2) % bp.images.length];
        const img2 = bp.images[(cIdx + pIdx * 2 + 1) % bp.images.length];
        const img3 = bp.images[(cIdx + pIdx * 2 + 2) % bp.images.length];
        const portId =
          creatorId === 'creator-1' && pIdx === 0
            ? 'port-1'
            : creatorId === 'creator-1' && pIdx === 1
            ? 'port-2'
            : creatorId === 'creator-2' && pIdx === 0
            ? 'port-3'
            : creatorId === 'creator-3' && pIdx === 0
            ? 'port-5'
            : `port-${runningPortfolioCounter++}`;

        portfolio_projects.push({
          id: portId,
          creator_id: creatorId,
          title: pIdx === 0 ? tpl.title : `${tpl.title} — Vol. ${cIdx + 1}`,
          description: tpl.desc,
          category: bp.category,
          role: roleTitle,
          deliverables: tpl.deliverables,
          media_urls: [img1, img2, img3],
          thumbnail_url: img1,
          media_type: bp.formats[0] === 'audio' ? 'audio' : bp.formats[0] === 'image' ? 'image' : 'video',
          ai_tools_used: bp.tools.slice(0, 3),
          tags: [bp.category, bp.specialization.split(' ')[0], '4K Commercial'],
          client_name: `${bp.category.split(' ')[0]} Brand Partner (Demo)`,
          views: 1200 + cIdx * 340 + pIdx * 210,
          likes: 180 + cIdx * 45 + pIdx * 29,
          created_at: createdDate,
        });
      }
    });
  });

  // BRANDS / AGENCIES (2 accounts) + ADMIN (1 account)
  const brandAndAdminProfiles: Profile[] = [
    {
      id: 'brand-1',
      email: 'brand@lumina-skincare.com',
      name: 'Sophia Chen',
      role: 'brand',
      avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
      bio: 'VP of Brand Marketing at Lumina Botanicals & NovaPulse Creative Agency. Commissioning cutting-edge AI creators for global skincare, FinTech, and D2C launches.',
      location: 'Mumbai & San Francisco',
      languages: ['English', 'Hindi'],
      company_name: 'Lumina Botanicals & NovaPulse',
      website: 'https://luminabotanicals.example.com',
      social_links: { linkedin: 'sophiachen-lumina' },
      verified: true,
      created_at: '2026-01-05T08:00:00Z',
    },
    {
      id: 'brand-2',
      email: 'agency@hyperionmedia.io',
      name: 'David Vance-Kerr',
      role: 'brand',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
      bio: 'Executive Creative Director at Hyperion Digital Agency. Partnering with top 1% AI creators to deliver rapid-turnaround commercial campaigns.',
      location: 'Bengaluru & New York',
      languages: ['English'],
      company_name: 'Hyperion Digital Agency',
      website: 'https://hyperionmedia.example.com',
      social_links: { linkedin: 'david-hyperion' },
      verified: true,
      created_at: '2026-01-20T09:00:00Z',
    },
    {
      id: 'admin-1',
      email: 'admin@creatorconnect.ai',
      name: 'Alex Rivera (Platform Admin)',
      role: 'admin',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
      bio: 'CreatorConnect AI Trust, Safety & Marketplace Operations Lead.',
      location: 'Bengaluru, India',
      languages: ['English'],
      company_name: 'CreatorConnect AI Inc.',
      website: 'https://creatorconnect.ai',
      social_links: {},
      verified: true,
      created_at: '2026-01-01T00:00:00Z',
    },
  ];

  profiles.push(...brandAndAdminProfiles);

  const users: UserCredential[] = profiles.map((p) => ({
    userId: p.id,
    email: p.email.toLowerCase(),
    passwordHash: defaultPasswordHash,
  }));

  const campaigns: Campaign[] = [
    {
      id: 'camp-1',
      brand_id: 'brand-1',
      brand_name: 'Lumina Botanicals & NovaPulse',
      brand_logo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
      title: 'HydraGlow Bio-Retinol Serum — 30s AI Video Commercial & Macro Stills',
      description: 'We are launching our flagship bio-retinol overnight serum and need a lush, futuristic 30-second AI video commercial alongside 10 photorealistic macro product stills showing dewy botanical textures and exact bottle typography.',
      category: 'Fashion & Beauty',
      content_type: 'Video Commercial + Stills',
      goals: 'Drive 2.5M+ launch impressions on Instagram Reels, TikTok, and YouTube Shorts while elevating luxury brand perception.',
      target_audience: 'Skincare enthusiasts and Gen-Z / Millennial luxury beauty buyers aged 22–42.',
      deliverables: [
        '1x 30s 4K Master Commercial (16:9 and 9:16)',
        '3x 15s Social Ad Cutdowns with Hook Variations',
        '10x 4K Photorealistic Product Stills with Exact Bottle Label',
      ],
      budget_min: 35000,
      budget_max: 65000,
      deadline: '2026-11-15',
      required_skills: ['Cinematic AI Video', 'Editorial Lookbooks', 'Custom LoRA Training'],
      required_ai_tools: ['Runway Gen-3 Alpha', 'Flux.1 Pro', 'ComfyUI', 'ElevenLabs'],
      experience_level: 'senior',
      reference_urls: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'],
      status: 'open',
      created_at: '2026-10-01T10:00:00Z',
      updated_at: '2026-10-01T10:00:00Z',
    },
    {
      id: 'camp-2',
      brand_id: 'brand-1',
      brand_name: 'Lumina Botanicals & NovaPulse',
      brand_logo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
      title: 'Virtual AI Brand Ambassador for Sustainable Activewear Line',
      description: 'Seeking an AI Influencer specialist to design a consistent digital brand ambassador for our eco-activewear capsule. Must maintain identical facial features across 15 outdoor fitness stills and 4 speaking Reels.',
      category: 'Social Media Influencers',
      content_type: 'Virtual Ambassador + Reels',
      goals: 'Launch an always-on virtual creator persona on Instagram and YouTube Shorts with high engagement.',
      target_audience: 'Eco-conscious fitness and athleisure shoppers aged 18–35.',
      deliverables: [
        '1x Custom Character Identity Bible & Face LoRA',
        '15x 4K Athleisure Lifestyle Photos',
        '4x 20s Lip-Synced Reels in English & Hindi',
      ],
      budget_min: 30000,
      budget_max: 55000,
      deadline: '2026-11-22',
      required_skills: ['Virtual Brand Ambassadors', 'Custom LoRA Training', 'Multilingual Voice Cloning'],
      required_ai_tools: ['Flux.1 Pro', 'ComfyUI', 'HeyGen', 'Kling AI'],
      experience_level: 'senior',
      reference_urls: [],
      status: 'in_progress',
      hired_creator_id: 'creator-3',
      created_at: '2026-09-25T14:00:00Z',
      updated_at: '2026-10-05T09:00:00Z',
    },
    {
      id: 'camp-3',
      brand_id: 'brand-2',
      brand_name: 'Hyperion Digital Agency',
      brand_logo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      title: 'Zero-Studio AI Product Photography for Artisanal Cold Brew Cans (4 SKUs)',
      description: 'Our beverage client is launching 4 new flavors of nitro cold brew coffee. We need a custom LoRA trained on their can dielines to produce 32 hyper-realistic ice-splash and cafe lifestyle product shots.',
      category: 'E-commerce & Product Advertising',
      content_type: 'High-Res Stills + LoRA',
      goals: 'Replace traditional tabletop photography for Amazon, Quick-Commerce, and OOH transit posters.',
      target_audience: 'Urban coffee lovers, specialty grocers, and millennial professionals.',
      deliverables: [
        '4x SKU-Specific LoRA Checkpoints',
        '32x 8K Upscaled Product Renders (8 per flavor)',
        'Layered PSD files with isolated shadows',
      ],
      budget_min: 28000,
      budget_max: 48000,
      deadline: '2026-11-10',
      required_skills: ['Photorealistic Product Renders', 'Custom LoRA Training'],
      required_ai_tools: ['Flux.1 Pro', 'Stable Diffusion XL', 'ComfyUI', 'Magnific AI'],
      experience_level: 'expert',
      reference_urls: [],
      status: 'open',
      created_at: '2026-10-04T11:30:00Z',
      updated_at: '2026-10-04T11:30:00Z',
    },
    {
      id: 'camp-4',
      brand_id: 'brand-2',
      brand_name: 'Hyperion Digital Agency',
      brand_logo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      title: 'Interactive WealthTech Mutual Fund SIP Explainer Series (10 Reels)',
      description: 'Looking for a Finance & Investing AI creator to produce 10 data-backed short explainers simplifying index funds, SIP compounding, and tax harvesting.',
      category: 'Finance & Investing',
      content_type: '9:16 Financial Explainer Reels',
      goals: 'Educate first-time retail investors across Tier-1 and Tier-2 Indian cities.',
      target_audience: 'Young professionals aged 21–35 starting their investment journey.',
      deliverables: [
        '10x 45s 9:16 Animated Chart & Avatar Reels',
        'Bilingual English & Hindi Audio Masters',
      ],
      budget_min: 25000,
      budget_max: 45000,
      deadline: '2026-11-18',
      required_skills: ['Market Data Visualization', 'Interactive Course Avatars'],
      required_ai_tools: ['HeyGen', 'Runway Gen-3 Alpha', 'ElevenLabs'],
      experience_level: 'senior',
      reference_urls: [],
      status: 'open',
      created_at: '2026-10-06T16:15:00Z',
      updated_at: '2026-10-06T16:15:00Z',
    },
    {
      id: 'camp-5',
      brand_id: 'brand-1',
      brand_name: 'Lumina Botanicals & NovaPulse',
      brand_logo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
      title: 'Celestial Festive Gift Box — AI Editorial Lookbook & Packaging Concept',
      description: 'Completed campaign for our limited-edition festive skincare collection featuring surrealist gold-and-obsidian botanical photography.',
      category: 'Fashion & Beauty',
      content_type: 'Editorial Stills + Packaging',
      goals: 'Festive gift guide press kit and hero homepage takeover.',
      target_audience: 'Luxury gift shoppers.',
      deliverables: ['20x 8K Festive Campaign Stills', '3D Gift Box Packaging Renders'],
      budget_min: 35000,
      budget_max: 50000,
      deadline: '2026-09-20',
      required_skills: ['Editorial Lookbooks', 'Photorealistic Product Renders'],
      required_ai_tools: ['Midjourney v6', 'Flux.1 Pro', 'Magnific AI'],
      experience_level: 'senior',
      reference_urls: [],
      status: 'completed',
      hired_creator_id: 'creator-1',
      created_at: '2026-08-20T09:00:00Z',
      updated_at: '2026-09-21T18:00:00Z',
    },
  ];

  const campaign_proposals: CampaignProposal[] = [
    {
      id: 'prop-1',
      campaign_id: 'camp-1',
      creator_id: 'creator-1',
      pitch: 'Hi Sophia! Having directed luxury commercial spots with custom Flux LoRA + Runway Gen-3 pipelines, I can preserve 100% of your HydraGlow bottle typography while delivering lush 4K botanical fluid motion in 6 days.',
      price: 48000,
      timeline: '6 days',
      portfolio_ids: ['port-1', 'port-2'],
      status: 'pending',
      created_at: '2026-10-03T15:20:00Z',
    },
    {
      id: 'prop-2',
      campaign_id: 'camp-1',
      creator_id: 'creator-2',
      pitch: 'Hello Lumina team! My specialty is zero-defect product LoRA training and 8K macro cosmetics photography. I can partner on the 10 macro stills + smooth Luma/Runway motion loops.',
      price: 42000,
      timeline: '5 days',
      portfolio_ids: ['port-3'],
      status: 'pending',
      created_at: '2026-10-04T09:45:00Z',
    },
    {
      id: 'prop-3',
      campaign_id: 'camp-2',
      creator_id: 'creator-3',
      pitch: 'Excited to build your sustainable activewear virtual ambassador! I will create a locked multi-angle FaceID + Flux LoRA rig so she looks 100% identical across trail-running stills and bilingual Reels.',
      price: 38000,
      timeline: '7 days',
      portfolio_ids: ['port-5'],
      status: 'accepted',
      created_at: '2026-09-27T11:00:00Z',
    },
  ];

  const campaign_invitations: CampaignInvitation[] = [
    {
      id: 'inv-1',
      campaign_id: 'camp-1',
      campaign_title: 'HydraGlow Bio-Retinol Serum — 30s AI Video Commercial & Macro Stills',
      brand_id: 'brand-1',
      brand_name: 'Lumina Botanicals & NovaPulse',
      brand_logo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
      creator_id: 'creator-1',
      creator_name: 'Aria Vance',
      creator_avatar: PORTRAIT_AVATARS[0],
      message: 'Hi Aria! Your work on our Festive campaign was phenomenal. We would love for you to pitch on our flagship HydraGlow Bio-Retinol launch!',
      status: 'accepted',
      created_at: '2026-10-02T10:00:00Z',
    },
  ];

  const saved_creators: SavedCreator[] = [
    { id: 'fav-1', brand_id: 'brand-1', creator_id: 'creator-1', created_at: '2026-09-10T10:00:00Z' },
    { id: 'fav-2', brand_id: 'brand-1', creator_id: 'creator-2', created_at: '2026-09-14T12:00:00Z' },
    { id: 'fav-3', brand_id: 'brand-1', creator_id: 'creator-3', created_at: '2026-09-20T15:00:00Z' },
    { id: 'fav-4', brand_id: 'brand-1', creator_id: 'creator-7', created_at: '2026-10-02T09:00:00Z' },
  ];

  const conversations: Conversation[] = [
    {
      id: 'conv-1',
      brand_id: 'brand-1',
      brand_name: 'Sophia Chen (Lumina Botanicals)',
      brand_avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
      creator_id: 'creator-1',
      creator_name: 'Aria Vance',
      creator_avatar: PORTRAIT_AVATARS[0],
      campaign_id: 'camp-1',
      campaign_title: 'HydraGlow Bio-Retinol Serum — 30s AI Video Commercial & Macro Stills',
      last_message: 'I just uploaded the initial Runway Gen-3 styleframes and lighting tests—let me know what you think of Scene 2!',
      last_message_at: '2026-10-11T18:45:00Z',
      unread_count: 1,
      created_at: '2026-10-02T10:05:00Z',
    },
  ];

  const messages: Message[] = [
    {
      id: 'msg-1',
      conversation_id: 'conv-1',
      sender_id: 'brand-1',
      sender_name: 'Sophia Chen',
      sender_avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
      body: 'Hi Aria! Thank you for submitting your proposal on the HydraGlow Bio-Retinol Serum campaign. Could we include an extra golden-hour water ripple transition at the 0:10 mark?',
      read_status: true,
      created_at: '2026-10-11T17:10:00Z',
    },
    {
      id: 'msg-2',
      conversation_id: 'conv-1',
      sender_id: 'creator-1',
      sender_name: 'Aria Vance',
      sender_avatar: PORTRAIT_AVATARS[0],
      body: 'I just uploaded the initial Runway Gen-3 styleframes and lighting tests—let me know what you think of Scene 2!',
      read_status: false,
      created_at: '2026-10-11T18:45:00Z',
    },
  ];

  const reviews: Review[] = [
    {
      id: 'rev-1',
      campaign_id: 'camp-5',
      campaign_title: 'Celestial Festive Gift Box — AI Editorial Lookbook',
      creator_id: 'creator-1',
      reviewer_id: 'brand-1',
      reviewer_name: 'Sophia Chen',
      reviewer_company: 'Lumina Botanicals & NovaPulse (Demo Review)',
      reviewer_avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
      rating: 5,
      feedback: 'Delivered agency-grade 4K visuals that outperformed our traditional studio shoot by 3.1x CTR. Custom LoRA preserved our gold foil lettering with 100% accuracy.',
      created_at: '2026-09-22T11:00:00Z',
    },
    {
      id: 'rev-2',
      campaign_id: 'camp-3',
      campaign_title: 'Artisanal Beverage Launch Stills',
      creator_id: 'creator-2',
      reviewer_id: 'brand-2',
      reviewer_name: 'David Vance-Kerr',
      reviewer_company: 'Hyperion Digital Agency (Demo Review)',
      reviewer_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      rating: 5,
      feedback: 'Kael turned flat PDF can labels into 40 jaw-dropping condensation product photos in 3 days flat using Flux and ComfyUI.',
      created_at: '2026-09-12T15:30:00Z',
    },
  ];

  const notifications: NotificationItem[] = [
    {
      id: 'notif-1',
      recipient_id: 'brand-1',
      type: 'proposal',
      title: 'New Proposal Received',
      message: 'Aria Vance submitted a ₹48,000 proposal for "HydraGlow Bio-Retinol Serum".',
      link: '/dashboard/brand',
      read_status: false,
      created_at: '2026-10-03T15:20:00Z',
    },
  ];

  const reported_items: ReportedItem[] = [
    {
      id: 'rep-1',
      reporter_id: 'brand-2',
      reporter_name: 'David Vance-Kerr',
      item_type: 'portfolio',
      item_id: 'port-1',
      item_title: 'Sample Audio Licensing Verification',
      reason: 'Verify commercial audio licensing clearance for background synth track.',
      status: 'pending',
      created_at: '2026-10-09T11:20:00Z',
    },
  ];

  return {
    version: SEED_VERSION,
    users,
    profiles,
    creator_profiles,
    portfolio_projects,
    campaigns,
    campaign_proposals,
    campaign_invitations,
    saved_creators,
    conversations,
    messages,
    reviews,
    notifications,
    reported_items,
  };
}
