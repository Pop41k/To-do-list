import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { saveUserEmail, hasUserEmail } from "../utils/email";

import bgLeft from "../bg/bg-left.png";
import bgRight from "../bg/bg-right.png";

export default function HomePage() {
  const navigate = useNavigate();
  const [demoTasks, setDemoTasks] = useState([
    { id: "t1", title: "Встреча с ВВ", done: true },
    {
      id: "t2",
      title: "Уложить Макгрегора в The Ultimate Fighter Final",
      done: false,
    },
    { id: "t3", title: "Подписать договор с SPOTIFY", done: false },
  ]);

  const toggleDemoTask = (id: string) => {
    setDemoTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [hasExistingEmail, setHasExistingEmail] = useState(false);

  const measureRef = useRef<HTMLSpanElement | null>(null);
  const [inputWidth, setInputWidth] = useState<number>(220);
  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const w = el.offsetWidth + 32;

    const min = 220;
    const max = 520;

    setInputWidth(Math.min(max, Math.max(min, w)));
  }, [email]);

  // Проверяем наличие сохраненного email при загрузке
  useEffect(() => {
    setHasExistingEmail(hasUserEmail());
  }, []);


  const closeModal = () => {
    setIsEmailModalOpen(false);
    setEmail("");
  };

  const isEmailValid = email.trim().includes("@") && email.trim().includes(".");

  const submitEmail = () => {
    if (!isEmailValid) return;

    // Сохраняем email пользователя
    saveUserEmail(email);

    closeModal();
    navigate("/tasks");
  };

  return (
    <div
      className="hp-page"
      style={
        {
          ["--bg-left" as any]: `url(${bgLeft})`,
          ["--bg-right" as any]: `url(${bgRight})`,
        } as React.CSSProperties
      }
    >
      <div className="hp-container">
        <div className="hp-header">
          <div className="hp-logo">Chaos Manager</div>
        </div>

        <div className="hp-main">
          <div className="hp-left">
            <div className="hp-slogan">
              Сделай свой день продуктивнее
              <br />
              вместе с To-Do list
            </div>

            <div className="hp-card">
              <div className="hp-card-date">27 мая:</div>

              {demoTasks.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="hp-card-row hp-rowBtn"
                  onClick={() => toggleDemoTask(t.id)}
                >
                  <span className={t.done ? "hp-miniCheck done" : "hp-miniCheck"} />
                  <span className={t.done ? "hp-card-text done" : "hp-card-text"}>
                    {t.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="hp-right">
            <div className="hp-exampleTitle">
              <span className="hp-arrow">←</span> Пример To-do листа
            </div>

            <button
              className="hp-btn"
              type="button"
              onClick={() => hasExistingEmail ? navigate("/tasks") : setIsEmailModalOpen(true)}
            >
              {hasExistingEmail ? "Продолжить с задачами" : "Перейти к To-do list"}
            </button>

            {hasExistingEmail && (
              <button
                className="hp-changeUserBtn"
                type="button"
                onClick={() => setIsEmailModalOpen(true)}
              >
                Сменить пользователя
              </button>
            )}
          </div>
        </div>

        <div className="hp-contacts">
          <div className="hp-contacts-title">Наши контакты:</div>
          <div className="hp-contacts-item">+79122796568</div>
          <div className="hp-contacts-item">ulyanovgleb3@gmail.com</div>
        </div>
      </div>

      {isEmailModalOpen && (
        <div
          className="hp-modalOverlay"
          onClick={closeModal} 
          role="presentation"
        >
          <div className="hp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hp-modalTitle">Введите вашу почту:</div>

            <span ref={measureRef} className="hp-measure">
              {email || "Ваша почта"}
            </span>

            <form
              className="hp-modalForm"
              onSubmit={(e) => {
                e.preventDefault();
                submitEmail();
              }}
            >
              <input
                className="hp-emailInput"
                placeholder="Ваша почта"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: inputWidth }}
                autoFocus
              />

              <button
                className="hp-emailBtn"
                type="submit"
                disabled={!isEmailValid}
                title={!isEmailValid ? "Введите корректную почту" : "Продолжить"}
              >
                OK
              </button>
            </form>

            <button className="hp-modalClose" type="button" onClick={closeModal}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}