import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <div className="section home-section">
        <h1 className="section-title">Главная страница</h1>
        <h2 className="app-name">Chaos Manager</h2>
        <p className="slogan">Сделай свой день продуктивнее вместе с To-Do list</p>
        
        <div className="todo-example-container">
          <div className="todo-example-box">
            <div className="todo-date">27 мая:</div>
            <div className="todo-item">
              <input type="checkbox" id="example1" checked disabled />
              <label htmlFor="example1">Встреча с ВВ</label>
            </div>
            <div className="todo-item">
              <input type="checkbox" id="example2" disabled />
              <label htmlFor="example2">Уложить Монгрегора в The Ultimate Fighter Final</label>
            </div>
            <div className="todo-item">
              <input type="checkbox" id="example3" disabled />
              <label htmlFor="example3">Подписать договор с SPOTIFY</label>
            </div>
          </div>
          <div className="example-info">
            <div className="arrow-text">← Пример To-do листа</div>
            <Link to="/todo" className="purple-button">
              Перейти к To-do list
            </Link>
          </div>
        </div>
        
        <div className="contacts">
          <p><strong>Наши контакты:</strong></p>
          <p>+79122796568</p>
          <p>ulyanovgleb3@gmail.com</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

