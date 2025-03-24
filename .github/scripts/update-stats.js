const axios = require('axios');
const fs = require('fs-extra');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const USERNAME = process.env.USERNAME;

// XP values per action
const XP_PER_COMMIT = 10;
const XP_PER_STAR = 5;
const XP_PER_ISSUE = 20;
const XP_PER_PR = 30;
const XP_PER_PROJECT = 100;
const XP_PER_STREAK_DAY = 50 / 7; // 50 XP for a 7-day streak
const XP_PER_LEVEL = 1000;

async function fetchGitHubStats() {
  const headers = {
    Authorization: `token ${GITHUB_TOKEN}`
  };

  // Fetch commit count
  const commitsResponse = await axios.get(`https://api.github.com/search/commits?q=author:${USERNAME}`, {
    headers: {
      ...headers,
      Accept: 'application/vnd.github.cloak-preview+json'
    }
  });
  const commitCount = commitsResponse.data.total_count;

  // Fetch stars received
  const reposResponse = await axios.get(`https://api.github.com/users/${USERNAME}/repos`, { headers });
  const totalStars = reposResponse.data.reduce((sum, repo) => sum + repo.stargazers_count, 0);

  // Fetch current streak using contributions graph
  // This is a simplified version, you might need to use a more complex solution
  const contributionsResponse = await axios.get(`https://github.com/users/${USERNAME}/contributions`, {
    headers: {
      ...headers,
      Accept: 'application/json'
    }
  });
  // Parse the HTML response to get the streak (simplified)
  const streak = 7; // Placeholder, parse the actual streak from the response

  // Fetch precision (PRs merged / total PRs)
  const prsResponse = await axios.get(`https://api.github.com/search/issues?q=author:${USERNAME}+type:pr`, { headers });
  const totalPRs = prsResponse.data.total_count;
  const mergedPRsResponse = await axios.get(`https://api.github.com/search/issues?q=author:${USERNAME}+type:pr+is:merged`, { headers });
  const mergedPRs = mergedPRsResponse.data.total_count;
  const precision = totalPRs > 0 ? mergedPRs / totalPRs : 0;

  // Calculate XP
  const commitXP = commitCount * XP_PER_COMMIT;
  const starXP = totalStars * XP_PER_STAR;
  const streakXP = streak * XP_PER_STREAK_DAY;
  const precisionXP = Math.round(precision * 100);
  
  // Activity score (simplified)
  const activityScore = Math.min(100, (commitCount + totalPRs) / 10);
  const activityXP = Math.round(activityScore * 1.2);
  
  // Mana (knowledge) score - placeholder
  const manaScore = 100;

  // Total XP and level
  const totalXP = commitXP + starXP + streakXP + precisionXP + activityXP;
  const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  const currentLevelXP = totalXP % XP_PER_LEVEL;
  
  return {
    level,
    totalXP,
    currentLevelXP,
    nextLevelXP: XP_PER_LEVEL,
    commitCount,
    commitXP,
    totalStars,
    starXP,
    streak,
    streakXP,
    precision: Math.round(precision * 100),
    precisionXP,
    activityScore,
    activityXP,
    manaScore
  };
}

async function updateSVG(stats) {
  const svgTemplate = await fs.readFile('./github-stats-level.svg', 'utf8');
  
  // Calculate progress width percentages
  const xpProgressWidth = Math.min(700 * (stats.currentLevelXP / stats.nextLevelXP), 700);
  const activityWidth = 400 * (stats.activityScore / 100);
  const commitsWidth = Math.min(400 * (stats.commitCount / 300), 400); // Max at 300 commits
  const starsWidth = Math.min(400 * (stats.totalStars / 100), 400);    // Max at 100 stars
  const streakWidth = Math.min(400 * (stats.streak / 30), 400);        // Max at 30 days
  const precisionWidth = 400 * (stats.precision / 100);
  const manaWidth = 400; // Always full
  
  let updatedSvg = svgTemplate
    .replace('{{LEVEL}}', stats.level)
    .replace('{{CURRENT_XP}}', stats.currentLevelXP)
    .replace('{{NEXT_LEVEL_XP}}', stats.nextLevelXP)
    .replace('{{XP_PROGRESS_WIDTH}}', xpProgressWidth)
    .replace('{{ACTIVITY_WIDTH}}', activityWidth)
    .replace('{{ACTIVITY_XP}}', stats.activityXP)
    .replace('{{COMMITS_WIDTH}}', commitsWidth)
    .replace('{{COMMITS_XP}}', stats.commitXP)
    .replace('{{STARS_WIDTH}}', starsWidth)
    .replace('{{STARS_XP}}', stats.starXP)
    .replace('{{STREAK_WIDTH}}', streakWidth)
    .replace('{{STREAK_XP}}', stats.streakXP)
    .replace('{{PRECISION_WIDTH}}', precisionWidth)
    .replace('{{PRECISION_XP}}', stats.precisionXP)
    .replace('{{MANA_WIDTH}}', manaWidth);
  
  await fs.writeFile('./solo-leveling-stats.svg', updatedSvg, 'utf8');
}

async function main() {
  try {
    const stats = await fetchGitHubStats();
    await updateSVG(stats);
    console.log('Successfully updated GitHub stats!');
  } catch (error) {
    console.error('Error updating GitHub stats:', error);
    process.exit(1);
  }
}

main();
