import React from 'react';
import { motion } from 'motion/react';

/**
 * NeuroBackground Component
 *
 * Creates a futuristic neural network-like background effect.
 * Perfect for premium sections and hero areas.
 *
 * Generates a mesh of interconnected glowing nodes that move
 * and pulse with energy, creating an addictive visual experience.
 */
const NeuroBackground: React.FC<{
  color?: string;
  nodeCount?: number;
  intensity?: number;
}> = ({
  color = 'rgba(168, 85, 247, 0.8)',
  nodeCount = 15,
  intensity = 0.6
}) => {
  const nodes = Array.from({ length: nodeCount }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <svg className="w-full h-full opacity-50" preserveAspectRatio="none">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connecting lines */}
        {nodes.map((node, i) => {
          const nextNode = nodes[(i + 1) % nodes.length];
          return (
            <motion.line
              key={`line-${i}`}
              x1={`${node.x}%`}
              y1={`${node.y}%`}
              x2={`${nextNode.x}%`}
              y2={`${nextNode.y}%`}
              stroke={color}
              strokeWidth="1"
              opacity={intensity * 0.3}
              animate={{
                opacity: [intensity * 0.1, intensity * 0.5, intensity * 0.1],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => (
          <motion.g key={`node-${node.id}`}>
            {/* Node glow */}
            <motion.circle
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r="8"
              fill={color}
              opacity={intensity * 0.4}
              filter="url(#glow)"
              animate={{
                r: [6, 12, 6],
                opacity: [intensity * 0.2, intensity * 0.6, intensity * 0.2],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Center node */}
            <motion.circle
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r="3"
              fill={color}
              animate={{
                r: [2, 5, 2],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.g>
        ))}
      </svg>

      {/* Animated light pulses */}
      <motion.div
        className="absolute w-full h-full"
        animate={{
          opacity: [0, 0.3, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          filter: 'blur(80px)',
        }}
      />
    </div>
  );
};

NeuroBackground.displayName = 'NeuroBackground';

export { NeuroBackground };
