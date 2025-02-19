const adjectives = [
    'Silent', 'Shadow', 'Ghost', 'Stealth', 'Phantom', 'Dark', 'Swift', 'Hidden',
    'Secret', 'Covert', 'Night', 'Midnight', 'Twilight', 'Alpine', 'Arctic',
    'Mystic', 'Crimson', 'Golden', 'Crystal', 'Storm', 'Thunder', 'Lightning',
    'Frost', 'Winter', 'Summer', 'Autumn', 'Spring', 'Desert', 'Ocean', 'Mountain'
  ];
  
  const nouns = [
    'Hawk', 'Eagle', 'Wolf', 'Fox', 'Raven', 'Panther', 'Tiger', 'Dragon',
    'Serpent', 'Phoenix', 'Falcon', 'Viper', 'Cobra', 'Jaguar', 'Owl',
    'Lion', 'Bear', 'Shark', 'Dolphin', 'Sword', 'Shield', 'Arrow', 'Dagger',
    'Blade', 'Cloak', 'Mask', 'Crown', 'Scepter', 'Orb', 'Guardian'
  ];

export const generateCodename = (): string => {
  const adjectiveIndex = Math.floor(Math.random() * adjectives.length);
  const nounIndex = Math.floor(Math.random() * nouns.length);
  
  const adjective = adjectives[adjectiveIndex];
  const noun = nouns[nounIndex];

  return `The ${adjective} ${noun}`
};