import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SplashScreen({ onComplete }) {
  const [text, setText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  // Blinking cursor
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 400);
    return () => clearInterval(cursorInterval);
  }, []);

  // Typing animation sequence
  useEffect(() => {
    let timeoutId;
    let isCancelled = false;
    
    const wait = (ms) => new Promise(resolve => { timeoutId = setTimeout(resolve, ms); });
    
    const typeText = async (str, speed = 60) => {
      for (let i = 0; i <= str.length; i++) {
        if (isCancelled) return;
        setText(str.slice(0, i));
        await wait(speed);
      }
    };

    const deleteText = async (currentStr, targetLength, speed = 40) => {
      for (let i = currentStr.length; i >= targetLength; i--) {
        if (isCancelled) return;
        setText(currentStr.slice(0, i));
        await wait(speed);
      }
    };

    const playAnimation = async () => {
      // 1. Wait a moment with blinking cursor
      await wait(150);
      if (isCancelled) return;
      
      // 2. Type "cai"
      await typeText("cai", 20);
      await wait(100);

      // 3. Delete "ai", type "hartered accountant intelligence" -> "chartered accountant intelligence"
      await deleteText("cai", 1, 10);
      await typeText("chartered accountant intelligence", 15);
      await wait(400);

      // 4. Delete all, type "cai"
      await deleteText("chartered accountant intelligence", 0, 6);
      await typeText("cai", 15);
      await wait(200);

      if (!isCancelled) {
        onComplete();
      }
    };

    playAnimation();

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
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
        fontSize: 'clamp(18px, 3.5vw, 24px)',
        fontWeight: 900,
        color: '#FF5722',
        fontFamily: "'Inter', sans-serif",
        display: 'flex',
        alignItems: 'center',
        whiteSpace: 'pre',
      }}>
        {text}
        <span style={{ opacity: showCursor ? 1 : 0 }}>_</span>
      </div>
    </motion.div>
  );
}
