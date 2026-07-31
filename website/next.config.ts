import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";
const repositoryBasePath = "/-agent-";
const agentApiBaseUrl = process.env.VITE_API_BASE_URL?.trim()
  || (isGitHubPages ? "" : "http://localhost:8000");

if (isGitHubPages && !agentApiBaseUrl) {
  throw new Error(
    "VITE_API_BASE_URL is required for the GitHub Pages production build. "
      + "Configure it in GitHub Actions repository variables.",
  );
}

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : undefined,
  basePath: isGitHubPages ? repositoryBasePath : undefined,
  assetPrefix: isGitHubPages ? repositoryBasePath : undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: isGitHubPages ? repositoryBasePath : "",
    // Expose the same Vite-style variable to both vinext development and the
    // Next.js static export used by GitHub Pages.
    VITE_API_BASE_URL: agentApiBaseUrl,
  },
  trailingSlash: isGitHubPages,
  images: {
    // All project images are local files under public/. Serving them directly
    // also avoids vinext's Cloudflare image optimizer requiring ASSETS/IMAGES
    // bindings while running the local development server.
    unoptimized: true,
  },
  typescript: {
    // The static mirror does not bundle the Cloudflare-only D1 helper.
    // The normal Vinext/Sites build still performs its existing checks.
    ignoreBuildErrors: isGitHubPages,
  },
};

export default nextConfig;
