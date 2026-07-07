import { useEffect, useState } from "react";
import "./splash.css";

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let p = 0;

    const timer = setInterval(() => {
      setProgress((old) => Math.min(100, old + 12));
    }, 120);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => onFinish?.(), 400);
    }
  }, [progress, onFinish]);

  return (
    <div className="splash-container">
      <div className="splash-card">
        <div className="loader" />
        <h1>Carregando <span className="brand">AtendeTicket</span></h1>
        <p>Isso pode levar alguns segundos, por favor aguarde.</p>

        <div className="progress-track">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <div className="footer">
          © {new Date().getFullYear()} • AtendeTicket
        </div>
      </div>
    </div>
  );
}
