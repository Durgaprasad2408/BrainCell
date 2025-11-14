const generateDiceBearAvatar = (seed) => {
  const encodedSeed = encodeURIComponent(seed);
  return `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodedSeed}`;
};

export default generateDiceBearAvatar;