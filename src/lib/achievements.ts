export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}

export function computeAchievements(stats: {
  totalPicks: number;
  activePicks: number;
  winRate: number;
  streak: number;
  totalValue: number;
  followersCount: number;
}): Achievement[] {
  return [
    {
      id: "first_pick",
      name: "First Pick",
      description: "Made your first prediction",
      icon: "🎯",
      earned: stats.totalPicks >= 1,
    },
    {
      id: "ten_picks",
      name: "Getting Serious",
      description: "Made 10 predictions",
      icon: "📊",
      earned: stats.totalPicks >= 10,
    },
    {
      id: "fifty_picks",
      name: "Prediction Machine",
      description: "Made 50 predictions",
      icon: "🤖",
      earned: stats.totalPicks >= 50,
    },
    {
      id: "streak_3",
      name: "Hot Streak",
      description: "Won 3 predictions in a row",
      icon: "🔥",
      earned: stats.streak >= 3,
    },
    {
      id: "streak_5",
      name: "On Fire",
      description: "Won 5 predictions in a row",
      icon: "💥",
      earned: stats.streak >= 5,
    },
    {
      id: "streak_10",
      name: "Unstoppable",
      description: "Won 10 predictions in a row",
      icon: "⚡",
      earned: stats.streak >= 10,
    },
    {
      id: "beat_crowd",
      name: "Beat the Crowd",
      description: "Win rate above 60%",
      icon: "👑",
      earned: stats.winRate > 60 && stats.totalPicks >= 5,
    },
    {
      id: "sharp_mind",
      name: "Sharp Mind",
      description: "Win rate above 75%",
      icon: "🧠",
      earned: stats.winRate > 75 && stats.totalPicks >= 10,
    },
    {
      id: "profit_master",
      name: "Profit Master",
      description: "Portfolio value above $15,000",
      icon: "💰",
      earned: stats.totalValue >= 15000,
    },
    {
      id: "whale",
      name: "Whale",
      description: "Portfolio value above $50,000",
      icon: "🐋",
      earned: stats.totalValue >= 50000,
    },
    {
      id: "influencer",
      name: "Influencer",
      description: "Gained 5 followers",
      icon: "⭐",
      earned: stats.followersCount >= 5,
    },
    {
      id: "leader",
      name: "Community Leader",
      description: "Gained 25 followers",
      icon: "🏆",
      earned: stats.followersCount >= 25,
    },
  ];
}
