const axios = require('axios');
const fs = require('fs-extra');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const USERNAME = process.env.USERNAME || 'singhvarun74';

const XP_CONFIG = {
  COMMIT: 10,
  STAR: 5,
  STREAK_DAY: 7,
  PR_MERGED: 20,
  ISSUE_CLOSED: 15,
  REPO_CREATED: 50,
  NEXT_LEVEL: 1000
};

async function fetchGitHubStats() {
  try {
    const headers = { Authorization: `token ${GITHUB_TOKEN}` };

    const reposResponse = await axios.get(`https://api.github.com/users/${USERNAME}/repos`, { headers });
    const totalStars = reposResponse.data.reduce((sum, repo) => sum + repo.stargazers_count, 0);

    const commitsResponse = await axios.get(`https://api.github.com/search/commits?q=author:${USERNAME}`, { headers });
    const commitCount = commitsResponse.data.total_count || 0;

    const activityXP = commitCount * XP_CONFIG.COMMIT + totalStars * XP_CONFIG.STAR;
    const level = Math.floor(activityXP / XP_CONFIG.NEXT_LEVEL);
    const nextLevelXP = XP_CONFIG.NEXT_LEVEL * (level + 1);

    const svgTemplate = fs.readFileSync('solo-leveling-stats.svg', 'utf8');
    const updatedSvg = svgTemplate.replace('{{LEVEL}}', level).replace('{{CURRENT_XP}}', activityXP).replace('{{NEXT_LEVEL_XP}}', nextLevelXP);

    fs.writeFileSync('solo-leveling-stats.svg', updatedSvg);
  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
  }
}

fetchGitHubStats();
