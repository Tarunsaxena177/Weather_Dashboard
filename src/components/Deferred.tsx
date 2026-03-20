import React, { useState, useEffect } from 'react';

interface DeferredProps {
  children: React.ReactNode;
  delay?: number;
}

export const Deferred: React.FC<DeferredProps> = ({ children, delay = 0 }) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShouldRender(true);
    }, delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  if (!shouldRender) return null;

  return <>{children}</>;
};
