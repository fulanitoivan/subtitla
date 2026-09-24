import React from 'react';
import type { UserProfile, AuthMode } from '../../types/auth';
import { MultiStepOnboardingModal } from './MultiStepOnboardingModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
  initialMode?: AuthMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'register',
}) => {
  return (
    <MultiStepOnboardingModal
      isOpen={isOpen}
      onClose={onClose}
      onAuthSuccess={onAuthSuccess}
      initialMode={initialMode}
    />
  );
};
