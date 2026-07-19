import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { gamificationEvents, GE } from '../../utils/gamificationEvents';
import { pushRewardFeedItem } from '../../utils/rewardFeed';
import { AchievementNoticeCard } from './AchievementNoticeCard';

let _id = 0;
const nextId = () => `toast-${++_id}`;

export function RewardToastContainer() {
  const [pendingQueue, setPendingQueue] = useState([]);
  const [activeNotice, setActiveNotice] = useState(null);

  const push = (type, payload) => {
    const now = Date.now();
    const notice = { id: nextId(), type, payload, createdAt: now, readyAt: now + 5000 };
    pushRewardFeedItem(notice);
    setPendingQueue((current) => [...current, notice]);
  };

  useEffect(() => {
    const onXP          = p => push(GE.XP, p);
    const onLevelUp     = p => push(GE.LEVEL_UP, p);
    const onBadge       = p => push(GE.BADGE, p);
    const onCollectible = p => push(GE.COLLECTIBLE, p);
    const onStreak      = p => { if (p.isNew) push(GE.STREAK, p); };

    gamificationEvents.on(GE.XP,          onXP);
    gamificationEvents.on(GE.LEVEL_UP,    onLevelUp);
    gamificationEvents.on(GE.BADGE,       onBadge);
    gamificationEvents.on(GE.COLLECTIBLE, onCollectible);
    gamificationEvents.on(GE.STREAK,      onStreak);

    return () => {
      gamificationEvents.off(GE.XP,          onXP);
      gamificationEvents.off(GE.LEVEL_UP,    onLevelUp);
      gamificationEvents.off(GE.BADGE,       onBadge);
      gamificationEvents.off(GE.COLLECTIBLE, onCollectible);
      gamificationEvents.off(GE.STREAK,      onStreak);
    };
  }, []);

  useEffect(() => {
    if (activeNotice || pendingQueue.length === 0) return undefined;

    const waitMs = Math.max(0, pendingQueue[0].readyAt - Date.now());
    const delayTimer = setTimeout(() => {
      setActiveNotice(pendingQueue[0]);
      setPendingQueue((current) => current.slice(1));
    }, waitMs);

    return () => clearTimeout(delayTimer);
  }, [activeNotice, pendingQueue]);

  useEffect(() => {
    if (!activeNotice) return undefined;

    const hideTimer = setTimeout(() => {
      setActiveNotice(null);
    }, 4500);

    return () => clearTimeout(hideTimer);
  }, [activeNotice]);

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      right: 24,
      top: 96,
      zIndex: 220,
      pointerEvents: 'none',
    }}>
      <AnimatePresence mode="wait">
        {activeNotice && (
          <div key={activeNotice.id} style={{ pointerEvents: 'auto' }}>
            <AchievementNoticeCard
              notice={activeNotice}
              onDismiss={() => setActiveNotice(null)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
