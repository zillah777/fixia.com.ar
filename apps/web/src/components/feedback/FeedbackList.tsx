import React from 'react';
import { MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeedbackCard } from './FeedbackCard';
import { Feedback } from '../../lib/services/feedback.service';

interface FeedbackListProps {
  feedbacks: Feedback[];
  currentUserId: string;
  variant?: 'received' | 'given';
  onEdit?: (feedback: Feedback) => void;
  onDelete?: (feedbackId: string) => void;
  emptyMessage?: string;
}

export const FeedbackList: React.FC<FeedbackListProps> = ({
  feedbacks,
  currentUserId,
  variant = 'received',
  onEdit,
  onDelete,
  emptyMessage = 'No hay feedback todavía',
}) => {
  if (feedbacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-20 w-20 rounded-full glass-medium flex items-center justify-center mb-4">
          <MessageSquare className="h-10 w-10 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-muted-foreground">{emptyMessage}</p>
        <p className="text-sm text-muted-foreground mt-2">
          {variant === 'received'
            ? 'Cuando otros usuarios te den feedback, aparecerá aquí'
            : 'Cuando des feedback a otros usuarios, aparecerá aquí'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {feedbacks.map((feedback) => (
          <FeedbackCard
            key={feedback.id}
            feedback={feedback}
            currentUserId={currentUserId}
            variant={variant}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
