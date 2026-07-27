import { useState, useEffect, useRef, useCallback } from 'react';
import { subscribeBadgeUnlocks } from '../../utils/rewardFeed';
import './BadgeUnlockToast.css';

const DISPLAY_MS = 4000;

export default function BadgeUnlockToast() {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef(null);
  const progressRef = useRef(null);

  // Subscribe to badge unlock events
  useEffect(() => {
    return subscribeBadgeUnlocks((badges) => {
      setQueue((prev) => [...prev, ...badges]);
    });
  }, []);

  const dismiss = useCallback(() => {
    clearTimeout(timerRef.current);
    clearInterval(progressRef.current);
    setVisible(false);
    setTimeout(() => {
      setCurrent(null);
      setProgress(100);
    }, 400);
  }, []);

  // Dequeue next badge when idle
  useEffect(() => {
    if (current || queue.length === 0) return;
    const [next, ...rest] = queue;
    setQueue(rest);
    setCurrent(next);
    setProgress(100);

    // Small delay to allow enter animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });

    // Progress bar countdown
    const startTime = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / DISPLAY_MS) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(progressRef.current);
    }, 50);

    // Auto dismiss
    timerRef.current = setTimeout(dismiss, DISPLAY_MS);
  }, [queue, current, dismiss]);

  if (!current) return null;

  return (
    <div
      className={`badge-toast${visible ? ' badge-toast--visible' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={`New badge unlocked: ${current.name}`}
    >
      <p className="badge-toast__subtitle">🎉 New badge unlocked!</p>
      <div className="badge-toast__icon">{current.icon || '🏅'}</div>
      <p className="badge-toast__name">{current.name}</p>
      {current.xp_reward > 0 && (
        <p className="badge-toast__xp">+{current.xp_reward} XP</p>
      )}
      <div className="badge-toast__progress">
        <div className="badge-toast__progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <button className="badge-toast__close" onClick={dismiss} aria-label="Dismiss">
        Dismiss
      </button>
    </div>
  );
}
