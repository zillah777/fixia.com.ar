// Mock for motion/react to prevent animation-related test issues
import React from 'react';

const motion = {
  div: React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => 
    React.createElement('div', { ...props, ref }, children)
  ),
  span: React.forwardRef<HTMLSpanElement, any>(({ children, ...props }, ref) => 
    React.createElement('span', { ...props, ref }, children)
  ),
  button: React.forwardRef<HTMLButtonElement, any>(({ children, ...props }, ref) => 
    React.createElement('button', { ...props, ref }, children)
  ),
  section: React.forwardRef<HTMLElement, any>(({ children, ...props }, ref) => 
    React.createElement('section', { ...props, ref }, children)
  ),
  form: React.forwardRef<HTMLFormElement, any>(({ children, ...props }, ref) => 
    React.createElement('form', { ...props, ref }, children)
  ),
};

export { motion };
export default motion;