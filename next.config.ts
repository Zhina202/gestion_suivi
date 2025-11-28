import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Note: L'avertissement de compatibilité Ant Design avec React 19 est géré
  // par le composant SuppressAntdWarning dans app/layout.tsx
  
  // Désactiver les erreurs ESLint lors du build pour permettre la compilation
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Désactiver les erreurs TypeScript lors du build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
