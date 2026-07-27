import React, { useEffect, useRef, useState } from 'react';
import './MapDiscoveryHint.css';

const INITIAL_DELAY_MS = 0;
const AUTO_DISMISS_AFTER_MS = 20000;

export default function MapDiscoveryHint(props) {
  const mapVisible = props.mapVisible;
  const onOpenMap = props.onOpenMap;

  const [visible, setVisible] = useState(false);
  const autoDismissRef = useRef(null);
  const dismissedRef = useRef(false);

  useEffect(function () {
    if (mapVisible || dismissedRef.current) return undefined;

    const showTimer = setTimeout(function () {
      setVisible(true);

      autoDismissRef.current = setTimeout(function () {
        setVisible(false);
      }, AUTO_DISMISS_AFTER_MS);
    }, INITIAL_DELAY_MS);

    return function () {
      clearTimeout(showTimer);
      if (autoDismissRef.current) clearTimeout(autoDismissRef.current);
    };
  }, [mapVisible]);

  useEffect(function () {
    if (mapVisible) {
      setVisible(false);
      if (autoDismissRef.current) clearTimeout(autoDismissRef.current);
    }
  }, [mapVisible]);

  const handleDismiss = function (e) {
    e.stopPropagation();
    dismissedRef.current = true;
    setVisible(false);
    if (autoDismissRef.current) clearTimeout(autoDismissRef.current);
  };

  const handleClick = function () {
    dismissedRef.current = true;
    setVisible(false);
    if (onOpenMap) onOpenMap();
  };

  if (!visible) return null;

  return (
    <div className="mdh-wrap">
      <div className="mdh-bubble" onClick={handleClick} role="button" tabIndex={0}>
        <button className="mdh-close" onClick={handleDismiss} aria-label="Dismiss">
          ×
        </button>
        <span className="mdh-icon">🗺️</span>
        <div className="mdh-text">
          <p className="mdh-title">Explore the map!</p>
          <p className="mdh-subtitle">Tap here to see every heritage site in Rwanda</p>
        </div>
      </div>
      <div className="mdh-arrow" />
    </div>
  );
}
