import React from 'react';
import {site} from '../content/site.mjs';
import {Icon} from './Icon.jsx';

export default function Contact(){
  return <section className="contact" id="contact">
    <div className="container contact-inner">
      <div>
        <div className="eyebrow">06 / NEXT STEP</div>
        <h2>Построим архитектуру<br/>вокруг ваших данных.</h2>
        <p>Определите ключевой сценарий, требования к инфраструктуре и ожидаемый результат — это основа для обсуждения платформы.</p>
      </div>
      <div className="contact-action">
        {site.email
          ? <a className="button button-dark" href={'mailto:' + site.email}>Написать о проекте <Icon name="diagonal" size={20}/></a>
          : <>
              <span className="contact-status">Контактный канал пока не настроен.</span>
              <a className="button button-dark" href="#architecture">Изучить архитектуру <Icon name="arrow" size={20}/></a>
            </>}
      </div>
    </div>
  </section>;
}
