import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";
const repositoryBasePath = "/-agent-";

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : undefined,
  basePath: isGitHubPages ? repositoryBasePath : undefined,
  assetPrefix: isGitHubPages ? repositoryBasePath : undefined,
  trailingSlash: isGitHubPages,
  images: {
    unoptimized: isGitHubPages,
  },
  typescript: {
    // The static mirror does not bundle the Cloudflare-only D1 helper.
    // The normal Vinext/Sites build still performs its existing checks.
    ignoreBuildErrors: isGitHubPages,
  },
};

export default nextConfig;
