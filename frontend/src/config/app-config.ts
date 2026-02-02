import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "CivicConnect",
  version: packageJson.version,
  copyright: `© ${currentYear}, CivicConnect.`,
  meta: {
    title: "CivicConnect - Modern Next.js Dashboard Starter Template",
    description: "CivicConnect is a modern pothole detection system, Next.js 16, Tailwind CSS v4, and shadcn/ui.",
  },
};
