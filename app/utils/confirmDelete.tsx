"use client";
import { Modal } from 'antd';

interface ConfirmDeleteOptions {
  title?: string;
  content?: string;
  onConfirm: () => Promise<void> | void;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const confirmDelete = ({
  title = 'Confirmer la suppression',
  content = 'Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.',
  onConfirm,
  onSuccess,
  onError,
}: ConfirmDeleteOptions) => {
  // Vérifier que nous sommes dans un environnement client
  if (typeof window === 'undefined') {
    console.error('confirmDelete ne peut être appelé que côté client');
    return;
  }

  // S'assurer que tous les modals précédents sont fermés
  Modal.destroyAll();
  
  // Créer le modal avec une configuration minimale mais robuste
  const modal = Modal.confirm({
    title: title,
    content: content,
    okText: 'Supprimer',
    okType: 'danger',
    cancelText: 'Annuler',
    width: 520,
    centered: true,
    maskClosable: false,
    closable: true,
    zIndex: 10000,
    getContainer: () => document.body,
    onOk: async () => {
      try {
        await onConfirm();
        modal.destroy();
        onSuccess?.();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        onError?.(error);
        // Re-throw pour empêcher la fermeture du modal en cas d'erreur
        return Promise.reject(error);
      }
    },
    onCancel: () => {
      modal.destroy();
    },
  });
};

