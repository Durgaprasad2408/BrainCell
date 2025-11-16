import React from 'react';
import ChallengeCard from './ChallengeCard';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';

const ChallengeGrid = ({ loading, filteredChallenges, completedChallenges, timeRemaining, activeTab, isDark }) => {
  if (loading) {
    return <LoadingState isDark={isDark} />;
  }

  if (filteredChallenges.length === 0) {
    return <EmptyState activeTab={activeTab} isDark={isDark} />;
  }

  return (
    <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${
      activeTab === 'upcoming' ? 'lg:grid-cols-3' : ''
    }`}>
      {filteredChallenges.map(challenge => (
        <ChallengeCard
          key={challenge.id}
          challenge={challenge}
          userHasCompleted={!!completedChallenges[challenge.id]}
          timeRemaining={timeRemaining}
        />
      ))}
    </div>
  );
};

export default ChallengeGrid;