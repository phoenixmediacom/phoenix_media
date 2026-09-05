import type { ReactNode } from "react";
import { MaintenancePage } from "./MaintenancePage";
import { VideoIntro } from "./VideoIntro";
import { ErrorState } from "./ui/AsyncStates";

interface PublicPageGateProps {
  introComplete: boolean;
  loading: boolean;
  maintenanceMode: boolean;
  serverUnavailable: boolean;
  error: string | null;
  errorStatus: number | null;
  onIntroComplete: () => void;
  onRetry: () => void;
  children: ReactNode;
}

export function PublicPageGate({
  introComplete,
  loading,
  maintenanceMode,
  serverUnavailable,
  error,
  errorStatus,
  onIntroComplete,
  onRetry,
  children,
}: PublicPageGateProps) {
  if (serverUnavailable) {
    return <ServerErrorPage onRetry={onRetry} />;
  }

  if (maintenanceMode) {
    return <MaintenancePage />;
  }

  if (error) {
    return <ErrorState message={error} statusCode={errorStatus} onRetry={onRetry} />;
  }

  if (!introComplete || loading) {
    return <VideoIntro onComplete={onIntroComplete} />;
  }

  return <>{children}</>;
}

function ServerErrorPage({ onRetry }: { onRetry: () => void }) {
  return (
    <div style={{
      position: "relative",
      width: "100vw",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "black",
      color: "white",
      overflow: "hidden",
      fontFamily: '"Roboto", sans-serif',
    }}>
      <div id="message" style={{
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        width: "90%",
        height: "90%",
        zIndex: 2,
      }}>
        <div id="m1" style={{ fontSize: "35px", fontWeight: 600, margin: "1%" }}>Internal Server Error</div>
        <div id="m2" style={{ fontSize: "80px", fontWeight: 700, margin: "1%" }}>500</div>
        <div id="m3" style={{ fontSize: "15px", width: "50%", minWidth: "40%", textAlign: "center", margin: "1%" }}>
          The server encountered an internal error or misconfiguration and was unable to complete your request.
        </div>
        <div id="m4" style={{ fontSize: "15px", width: "50%", minWidth: "40%", textAlign: "center", margin: "1%" }}>
          Our "experts" are trying to fix the problem, please stand by.
        </div>
        <button
          type="button"
          onClick={onRetry}
          style={{
            marginTop: "18px",
            border: "1px solid rgba(255,255,255,0.3)",
            background: "rgba(255,255,255,0.04)",
            color: "white",
            borderRadius: "999px",
            padding: "10px 18px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Retry
        </button>
      </div>

      <div id="charactersDiv" style={{ position: "absolute", width: "99%", height: "95%", zIndex: 1 }} />
      <canvas id="canvas" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');
        #charactersDiv { position: absolute; width: 99%; height: 95%; }
        .characters { width: 18%; height: 18%; position: absolute; }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        (() => {
          class Circulo {
            constructor(x, y, size) {
              this.x = x;
              this.y = y;
              this.size = size;
            }
          }

          let circulos = [];
          const canvas = document.getElementById('canvas');
          const context = canvas.getContext('2d');
          const charactersDiv = document.getElementById('charactersDiv');

          function initCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
          }

          function initArr() {
            circulos.length = 0;
            for (let index = 0; index < 300; index++) {
              const randomX = Math.floor(Math.random() * ((canvas.width * 3) - (canvas.width * 1.2) + 1)) + (canvas.width * 1.2);
              const randomY = Math.floor(Math.random() * ((canvas.height) - (canvas.height * (-0.2) + 1)) + (canvas.height * (-0.2)));
              const size = canvas.width / 1000;
              circulos.push(new Circulo(randomX, randomY, size));
            }
          }

          let timer = 0;
          let requestID;

          function draw() {
            timer++;
            context.setTransform(1, 0, 0, 1, 0, 0);
            const distanceX = canvas.width / 80;
            const growthRate = canvas.width / 1000;
            context.fillStyle = 'white';
            context.clearRect(0, 0, canvas.width, canvas.height);

            circulos.forEach((circulo) => {
              context.beginPath();

              if (timer < 65) {
                circulo.x = circulo.x - distanceX;
                circulo.size = circulo.size + growthRate;
              }

              if (timer > 65 && timer < 500) {
                circulo.x = circulo.x - (distanceX * 0.02);
                circulo.size = circulo.size + (growthRate * 0.2);
              }

              context.arc(circulo.x, circulo.y, circulo.size, 0, 360);
              context.fill();
            });

            requestID = requestAnimationFrame(draw);

            if (timer > 500) {
              cancelAnimationFrame(requestID);
            }
          }

          function charactersAnimate() {
            charactersDiv.innerHTML = '';

            for (let index = 0; index < 6; index++) {
              const stick = new Image();
              stick.classList.add('characters');

              let speedX;
              let speedRotation;

              switch (index) {
                case 0:
                  stick.style.top = '0%';
                  stick.src = 'https://raw.githubusercontent.com/RicardoYare/imagenes/9ef29f5bbe075b1d1230a996d87bca313b9b6a63/sticks/stick0.svg';
                  stick.style.transform = 'rotateZ(-90deg)';
                  speedX = 1500;
                  break;
                case 1:
                  stick.style.top = '10%';
                  stick.src = 'https://raw.githubusercontent.com/RicardoYare/imagenes/9ef29f5bbe075b1d1230a996d87bca313b9b6a63/sticks/stick1.svg';
                  speedX = 3000;
                  speedRotation = 2000;
                  break;
                case 2:
                  stick.style.top = '20%';
                  stick.src = 'https://raw.githubusercontent.com/RicardoYare/imagenes/9ef29f5bbe075b1d1230a996d87bca313b9b6a63/sticks/stick2.svg';
                  speedX = 5000;
                  speedRotation = 1000;
                  break;
                case 3:
                  stick.style.top = '25%';
                  stick.src = 'https://raw.githubusercontent.com/RicardoYare/imagenes/9ef29f5bbe075b1d1230a996d87bca313b9b6a63/sticks/stick0.svg';
                  speedX = 2500;
                  speedRotation = 1500;
                  break;
                case 4:
                  stick.style.top = '35%';
                  stick.src = 'https://raw.githubusercontent.com/RicardoYare/imagenes/9ef29f5bbe075b1d1230a996d87bca313b9b6a63/sticks/stick0.svg';
                  speedX = 2000;
                  speedRotation = 300;
                  break;
                case 5:
                  stick.style.bottom = '5%';
                  stick.src = 'https://raw.githubusercontent.com/RicardoYare/imagenes/9ef29f5bbe075b1d1230a996d87bca313b9b6a63/sticks/stick3.svg';
                  break;
                default:
                  break;
              }

              charactersDiv.appendChild(stick);

              if (index === 5) return;

              stick.animate(
                [{ left: '100%' }, { left: '-20%' }],
                { duration: speedX, easing: 'linear', fill: 'forwards' }
              );

              if (index !== 0) {
                stick.animate(
                  [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-360deg)' }],
                  { duration: speedRotation, iterations: Infinity, easing: 'linear' }
                );
              }
            }
          }

          const resize = () => {
            initCanvas();
            timer = 0;
            cancelAnimationFrame(requestID);
            context.reset();
            initArr();
            draw();
            charactersAnimate();
          };

          window.addEventListener('resize', resize);
          initCanvas();
          initArr();
          draw();
          charactersAnimate();
        })();
      `}} />
    </div>
  );
}
