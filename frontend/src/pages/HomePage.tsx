import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import { useState, useRef, useLayoutEffect } from "react";
import { createOrGetUser } from "../api/users";

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
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const closeModal = () => {
    setIsEmailModalOpen(false);
    setEmail("");
  };

  const isEmailValid = email.trim().includes("@") && email.trim().includes(".");

  const submitEmail = async () => {
    if (!isEmailValid) return;

    setIsSaving(true);
    setError(null);

    try {
      // Сохраняем пользователя в базу данных
      await createOrGetUser(email.trim());
      console.log('Пользователь сохранен:', email.trim());
      
      // Закрываем модалку и переходим на страницу задач
      closeModal();
      navigate("/tasks");
    } catch (err) {
      console.error('Ошибка сохранения пользователя:', err);
      setError(err instanceof Error ? err.message : 'Ошибка сохранения пользователя');
      // Не закрываем модалку при ошибке, чтобы пользователь мог попробовать снова
    } finally {
      setIsSaving(false);
    }
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
              onClick={() => setIsEmailModalOpen(true)}
            >
              Перейти к To-do list
            </button>
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
              {error && (
                <div style={{ 
                  color: 'red', 
                  fontSize: '14px', 
                  marginBottom: '10px',
                  textAlign: 'center'
                }}>
                  {error}
                </div>
              )}
              <input
                className="hp-emailInput"
                placeholder="Ваша почта"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null); // Очищаем ошибку при изменении email
                }}
                style={{ width: inputWidth }}
                autoFocus
                disabled={isSaving}
              />

              <button
                className="hp-emailBtn"
                type="submit"
                disabled={!isEmailValid || isSaving}
                title={!isEmailValid ? "Введите корректную почту" : isSaving ? "Сохранение..." : "Продолжить"}
              >
                {isSaving ? "..." : "OK"}
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