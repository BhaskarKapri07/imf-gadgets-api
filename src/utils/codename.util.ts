const adjectives = [
    'Silent', 'Shadow', 'Ghost', 'Stealth', 'Phantom', 'Dark', 'Swift', 'Hidden',
    'Secret', 'Covert', 'Night', 'Midnight', 'Twilight', 'Alpine', 'Arctic'
  ];
  
const nouns = [
    'Hawk', 'Eagle', 'Wolf', 'Fox', 'Raven', 'Panther', 'Tiger', 'Dragon',
    'Serpent', 'Phoenix', 'Falcon', 'Viper', 'Cobra', 'Jaguar', 'Owl'
    ];

export const generateCodename = (): string => {
const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
const noun = nouns[Math.floor(Math.random() * nouns.length)];
return `The ${adjective} ${noun}`;
};