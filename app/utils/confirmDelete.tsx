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
  Modal.confirm({
    title,
    content,
    okText: 'Supprimer',
    okType: 'danger',
    cancelText: 'Annuler',
    width: 500,
    centered: true,
    onOk: async () => {
      try {
        await onConfirm();
        onSuccess?.();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        onError?.(error);
        throw error; // Re-throw pour que le modal reste ouvert en cas d'erreur
      }
    },
  });
};

