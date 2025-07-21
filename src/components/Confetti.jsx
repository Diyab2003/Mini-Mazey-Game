// src/components/Confetti.jsx
import React, { useEffect, useState } from 'react';
// No specific CSS file needed, it uses styles.css directly

const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#9e9e9e', '#607d8b'];

function Confetti({ active, onComplete }) {
  const [confettiPieces, setConfettiPieces] = useState([]);

  useEffect(() => {
    if (active) {
      const newPieces = [];
      for (let i = 0; i < 50; i++) { // Generate 50 confetti pieces
        newPieces.push({
          id: i,
          left: Math.random() * 100 + 'vw', // Random horizontal position
          delay: Math.random() * 0.5 + 's', // Random start delay
          color: colors[Math.floor(Math.random() * colors.length)], // Random color
        });
      }
      setConfettiPieces(newPieces);

      // After animation duration, trigger onComplete and clear pieces
      const timer = setTimeout(() => {
        setConfettiPieces([]);
        if (onComplete) {
          onComplete();
        }
      }, 2000); // Matches confetti-fall animation duration

      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [active, onComplete]); // Re-run effect when 'active' changes

  if (!active && confettiPieces.length === 0) {
    return null; // Don't render if not active and no pieces
  }

  return (
    <div className="confetti-container">
      {confettiPieces.map(piece => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: piece.left,
            animationDelay: piece.delay,
            '--confetti-color': piece.color, // CSS custom property for color
          }}
        />
      ))}
    </div>
  );
}

export default Confetti;