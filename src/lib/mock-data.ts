export interface Player {
  id: string;
  name: string;
  initiative: number | null;
  statusEffects: string[];
  isActive: boolean;
}

export interface Asset {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  type: 'map' | 'letter' | 'clue' | 'handout' | 'artefact';
  sharedWith: string[]; // player ids, or ['all']
  createdAt: string;
}

export interface Note {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  type: 'personal' | 'session';
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  name: string;
  description: string;
  joinCode: string;
  createdAt: string;
  isActive: boolean;
}

export const STATUS_EFFECTS = [
  { id: 'blinded', name: 'Blinded', icon: '◐', description: 'Cannot see. Auto-fail sight checks. Attacks have disadvantage.' },
  { id: 'charmed', name: 'Charmed', icon: '♥', description: 'Cannot attack the charmer. Charmer has advantage on social checks.' },
  { id: 'deafened', name: 'Deafened', icon: '◎', description: 'Cannot hear. Auto-fail hearing checks.' },
  { id: 'frightened', name: 'Frightened', icon: '△', description: 'Disadvantage on checks while source is in sight. Cannot move closer.' },
  { id: 'grappled', name: 'Grappled', icon: '⊗', description: 'Speed becomes 0. Ends if grappler is incapacitated.' },
  { id: 'incapacitated', name: 'Incapacitated', icon: '✕', description: 'Cannot take actions or reactions.' },
  { id: 'invisible', name: 'Invisible', icon: '◇', description: 'Cannot be seen. Advantage on attacks. Attacks against have disadvantage.' },
  { id: 'paralyzed', name: 'Paralyzed', icon: '∥', description: 'Incapacitated. Auto-fail STR/DEX saves. Attacks have advantage.' },
  { id: 'petrified', name: 'Petrified', icon: '▣', description: 'Turned to stone. Weight x10. Resistant to all damage.' },
  { id: 'poisoned', name: 'Poisoned', icon: '☠', description: 'Disadvantage on attack rolls and ability checks.' },
  { id: 'prone', name: 'Prone', icon: '⏚', description: 'Disadvantage on attacks. Melee attacks against have advantage.' },
  { id: 'restrained', name: 'Restrained', icon: '⊞', description: 'Speed 0. Attacks have disadvantage. DEX saves have disadvantage.' },
  { id: 'stunned', name: 'Stunned', icon: '✳', description: 'Incapacitated. Auto-fail STR/DEX saves.' },
  { id: 'unconscious', name: 'Unconscious', icon: '○', description: 'Incapacitated, drops items, falls prone.' },
  { id: 'exhaustion', name: 'Exhaustion', icon: '▾', description: 'Cumulative levels of exhaustion with increasing penalties.' },
] as const;

export const MOCK_PLAYERS: Player[] = [
  { id: 'p1', name: 'Aethon', initiative: 18, statusEffects: ['poisoned'], isActive: false },
  { id: 'p2', name: 'Lyra', initiative: 15, statusEffects: [], isActive: true },
  { id: 'p3', name: 'Grimjaw', initiative: 12, statusEffects: ['grappled', 'prone'], isActive: false },
  { id: 'p4', name: 'Seraphina', initiative: 8, statusEffects: [], isActive: false },
];

export const MOCK_ASSETS: Asset[] = [
  {
    id: 'a1',
    title: 'Crypt of the Fallen',
    description: 'Map of the underground crypt beneath the cathedral.',
    imageUrl: '',
    type: 'map',
    sharedWith: ['all'],
    createdAt: '2025-03-10T18:00:00Z',
  },
  {
    id: 'a2',
    title: 'Mysterious Letter',
    description: 'A coded letter found in the vampire lord\'s study.',
    imageUrl: '',
    type: 'letter',
    sharedWith: ['p2'],
    createdAt: '2025-03-10T19:30:00Z',
  },
  {
    id: 'a3',
    title: 'Bloodstone Amulet',
    description: 'A strange amulet radiating necrotic energy.',
    imageUrl: '',
    type: 'clue',
    sharedWith: ['p1', 'p3'],
    createdAt: '2025-03-10T20:00:00Z',
  },
];

export const MOCK_NOTES: Note[] = [
  {
    id: 'n1',
    content: 'The vampire lord mentioned "the convergence" happens at the next blood moon. Party should investigate the observatory.',
    authorId: 'dm',
    authorName: 'DM',
    type: 'session',
    createdAt: '2025-03-10T18:30:00Z',
    updatedAt: '2025-03-10T18:30:00Z',
  },
  {
    id: 'n2',
    content: 'Lyra noticed the symbols on the crypt walls match the ones in the stolen spellbook. Need to cross-reference.',
    authorId: 'p2',
    authorName: 'Lyra',
    type: 'personal',
    createdAt: '2025-03-10T19:00:00Z',
    updatedAt: '2025-03-10T19:15:00Z',
  },
];

export const MOCK_SESSION: Session = {
  id: 's1',
  name: 'Curse of the Blood Moon',
  description: 'The party ventures into the Crimson Vale to uncover the source of the undying plague.',
  joinCode: 'BLOOD42',
  createdAt: '2025-03-10T17:00:00Z',
  isActive: true,
};
