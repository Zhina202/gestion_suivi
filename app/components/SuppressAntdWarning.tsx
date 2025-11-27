"use client";
import { useEffect } from 'react';

/**
 * Composant pour supprimer l'avertissement de compatibilité Ant Design avec React 19
 * Cet avertissement est non bloquant et Ant Design v5 fonctionne correctement avec React 19
 */
export default function SuppressAntdWarning() {
  useEffect(() => {
    // Sauvegarder la fonction console.warn originale
    const originalWarn = console.warn;
    
    // Remplacer console.warn pour filtrer le warning Ant Design
    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      // Ignorer le warning de compatibilité Ant Design
      if (message.includes('antd v5 support React is 16 ~ 18') || 
          message.includes('antd: compatible')) {
        return; // Ne pas afficher ce warning
      }
      // Afficher tous les autres warnings normalement
      originalWarn.apply(console, args);
    };
    
    // Restaurer console.warn lors du démontage du composant
    return () => {
      console.warn = originalWarn;
    };
  }, []);
  
  return null; // Ce composant ne rend rien
}

