import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function SplashScreen({ onComplete }) {
  const [showCursor, setShowCursor] = useState(true);
  const textRef = useRef(null);

  // Blinking cursor
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 400);
    return () => clearInterval(cursorInterval);
  }, []);

  // Typing animation sequence using pure DOM mutation to survive React renders
  useEffect(() => {
    let active = true;
    const runSequence = async () => {
      const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      const set = (str) => {
        if (active && textRef.current) textRef.current.textContent = str;
      };

      await wait(300);
      if (!active) return;
      
      const target = "chartered accountant ";
      
      // Type chartered accountant
      for (let i = 1; i <= target.length; i++) {
        if (!active) return;
        set(target.slice(0, i));
        await wait(40);
      }
      
      // Wait for one blink cycle (~800ms)
      await wait(800);
      if (!active) return;

      // Collapse rapidly back to "c"
      for (let i = target.length - 1; i >= 1; i--) {
        if (!active) return;
        set(target.slice(0, i));
        await wait(15);
      }

      // Type "ai" to finish on "cai"
      if (!active) return;
      set("ca");
      await wait(40);
      
      if (!active) return;
      set("cai");
      await wait(500);

      if (active) {
        onComplete();
      }
    };

    runSequence();

    return () => {
      active = false;
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#F4F2E9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div style={{
        fontSize: '32px',
        fontWeight: 900,
        color: '#FF5722',
        fontFamily: "'Inter', sans-serif",
        display: 'flex',
        alignItems: 'center',
        whiteSpace: 'pre',
      }}>
        <span ref={textRef}></span>
        <span style={{ opacity: showCursor ? 1 : 0 }}>_</span>
      </div>
    </motion.div>
  );
}
