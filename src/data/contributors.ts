/** Approved records maintained separately from GitHub's commit-contributor API. */
export const manualContributors = [
  { id: 186507724, login: "anand24mishra", name: "Anand Mishra" },
  { id: 178364528, login: "mitul-bhatia", name: "Mitul Bhatia" },
  { id: 183697596, login: "OmvedNagre", name: "Omved Nagre" },
  { id: 186388947, login: "UserAkku", name: "Akhilesh Kumar" },
] as const;

export const creatorGitHubId = 205837121;
export const creatorLogin = "rajatrsrivastav";
export const ossgridRepo = "rajatrsrivastav/ossgrid";
export const creatorContributor = {
  id: creatorGitHubId,
  login: creatorLogin,
  name: "Rajat Srivastav",
  avatarUrl: `https://github.com/${creatorLogin}.png?size=96`,
  profileUrl: `https://github.com/${creatorLogin}`,
} as const;
