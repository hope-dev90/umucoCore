import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { gamificationEvents, GE } from '../../utils/gamificationEvents';
import { RewardToast } from './RewardToast';
import { BadgePopup } from './BadgePopup';

let _id = 0;
const nextId = () => `toast-${++_id}`;

export function RewardToastContainer() {
  const [queue, setQueue] = useState([]);
  const [badgeQueue, setBadgeQueue] = useState([]);
  const activeBadge = badgeQueue[0]?.badge || null;

  const push = (type, payload) => {
    const id = nextId();
    setQueue(q => [...q, { id, type, payload, createdAt: Date.now() }]);
    setTimeout(() => {
      setQueue(q => q.filter(t => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    const onXP          = p => push(GE.XP, p);
    const onLevelUp     = p => push(GE.LEVEL_UP, p);
    const onBadge       = p => setBadgeQueue(q => [...q, { id: nextId(), badge: p.badge }]);
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

  const remove = (id) => setQueue(q => q.filter(t => t.id !== id));
  const dismissBadge = () => setBadgeQueue(q => q.slice(1));

  return ReactDOM.createPortal(
    <>
      <div style={{
        position: 'fixed', bottom: 24, right: 24,
        display: 'flex', flexDirection: 'column', gap: 8,
        zIndex: 200, pointerEvents: 'none',
      }}>
        <AnimatePresence>
          {queue.map(toast => (
            <div key={toast.id} style={{ pointerEvents: 'auto' }}>
              <RewardToast toast={toast} onRemove={() => remove(toast.id)} />
            </div>
          ))}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {activeBadge && (
          <BadgePopup
            key={badgeQueue[0].id}
            badge={activeBadge}
            onDismiss={dismissBadge}
          />
        )}
      </AnimatePresence>
    </>,
    document.body,
  );
}
