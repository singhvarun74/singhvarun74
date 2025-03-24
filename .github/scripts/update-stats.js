const axios = require('axios');
const fs = require('fs-extra');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const USERNAME = process.env.USERNAME;

const XP_PER_COMMIT = 10;
const XP_PER_STAR = 5;
const XP_PER_STREAK_DAY = 50;
const XP_PER_LEVEL = 1000;

async function fetchGitHubStats() {
  const headers = { Authorization: `token ${GITHUB_TOKEN}` };

  // Fetch commit count
  const commitsResponse = await axios.get(`https://api.github.com/search/commits?q=author:${USERNAME}`, {
    headers: { ...headers, Accept: 'application/vnd.github.cloak-preview+json' }
  });
  const commitCount = commitsResponse.data.total_count;

  // Fetch stars received
  const reposResponse = await axios.get(`https://api.github.com/users/${USERNAME}/repos`, { headers });
  const totalStars = reposResponse.data.reduce((sum, repo) => sum + repo.stargazers_count, 0);

  // Fetch current streak (simplified)
  const contributionsResponse = await axios.get(`https://github.com/users/${USERNAME}/contributions`, { headers });
  const streak = 7; // Placeholder, parse the actual streak from the response

  // Calculate precision (simplified)
  const precision = 85; // Placeholder, calculate based on merged PRs / total PRs

  // Calculate activity score (simplified)
  const activityScore = Math.min(100, (commitCount + totalStars) / 10);

  // Calculate XP and level
  const totalXP = (commitCount * XP_PER_COMMIT) + (totalStars * XP_PER_STAR) + (streak * XP_PER_STREAK_DAY);
  const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  const currentLevelXP = totalXP % XP_PER_LEVEL;
  
  return {
    level,
    totalXP,
    currentLevelXP,
    nextLevelXP: XP_PER_LEVEL,
    commitCount,
    totalStars,
    streak,
    precision,
    activityScore
  };
}

async function updateSVG(stats) {
  let svgContent = await fs.readFile('./solo-leveling-stats.svg', 'utf8');
  
  const xpBarWidth = (stats.currentLevelXP / stats.nextLevelXP) * 700;
  const commitsWidth = Math.min(stats.commitCount, 500) / 500 * 500;
  const starsWidth = Math.min(stats.totalStars, 100) / 100 * 500;
  const streakWidth = Math.min(stats.streak, 30) / 30 * 500;
  const precisionWidth = stats.precision / 100 * 500;
  const activityWidth = stats.activityScore / 100 * 500;

  svgContent = svgContent
    .replace('{{LEVEL}}', stats.level)
    .replace('{{CURRENT_XP}}', stats.currentLevelXP)}
