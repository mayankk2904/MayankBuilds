import React, { useLayoutEffect } from 'react';

declare global {
  interface Window {
    particlesJS: any;
  }
}

interface ParticlesBackgroundProps {
  colors?: string[];
  size?: number;
  countDesktop?: number;
  countTablet?: number;
  countMobile?: number;
  zIndex?: number;
  height?: string;
  opacity?: number;
}

const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({
  colors = ['#ff223e', '#ff5f1f', '#ff7300'],
  size = 2.8,
  countDesktop = 120,
  countTablet = 90,
  countMobile = 60,
  zIndex = 1,
  height = '100%',
  opacity = 0.8,
}) => {
  useLayoutEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js";
    script.onload = () => {
      const particlesElement = document.getElementById('js-particles');
      if (particlesElement && window.particlesJS) {
        const getParticleCount = () => {
          const screenWidth = window.innerWidth;
          if (screenWidth > 1024) return countDesktop;
          if (screenWidth > 768) return countTablet;
          return countMobile;
        };

        window.particlesJS('js-particles', {
          particles: {
            number: {
              value: getParticleCount(),
              density: {
                enable: true,
                value_area: 800,
              }
            },
            color: {
              value: colors,
            },
            shape: {
              type: 'circle',
            },
            opacity: {
              value: opacity,
              random: true,
              anim: {
                enable: true,
                speed: 1,
                opacity_min: 0.3,
                sync: false,
              },
            },
            size: {
              value: size,
              random: true,
              anim: {
                enable: true,
                speed: 2,
                size_min: 1,
                sync: false,
              },
            },
            line_linked: {
              enable: false,
            },
            move: {
              enable: true,
              speed: 2.8,
              direction: 'none',
              random: true,
              straight: false,
              out_mode: 'out',
              bounce: false,
            },
          },
          interactivity: {
            detect_on: 'canvas',
            events: {
              onhover: {
                enable: true,
                mode: 'repulse',
              },
              onclick: {
                enable: true,
                mode: 'push',
              },
              resize: true,
            },
          },
          retina_detect: true,
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [colors, size, countDesktop, countTablet, countMobile, opacity]);

  return (
    <div
      id="js-particles"
      style={{
        width: '100%',
        height: height,
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: zIndex,
        pointerEvents: 'none',
      }}
    >
      <style>{`
        #js-particles canvas {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .particles-js-canvas-el {
          position: absolute;
        }

        .particles-js-canvas-el circle {
          fill: currentColor;
          filter: drop-shadow(0 0 6px currentColor);
        }
      `}</style>
    </div>
  );
};

export default ParticlesBackground;