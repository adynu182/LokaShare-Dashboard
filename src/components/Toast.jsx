import React, { useEffect, useState } from 'react';

export default function Toast({ message, duration = 2500 }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (message) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  if (!message) return null;

  return (
    <div className={`toast ${show ? 'show' : ''}`}>
      {message}
    </div>
  );
}
