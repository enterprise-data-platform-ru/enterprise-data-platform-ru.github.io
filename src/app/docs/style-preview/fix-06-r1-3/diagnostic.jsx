'use client';

import {useState} from 'react';
import {findActiveHeading} from '../../../../lib/scroll-spy.mjs';

const headings = [{id: 'a', top: 200}, {id: 'b', top: 400}, {id: 'c', top: 800}];
const scenarios = [
  {name: 'До первого', scroll: 0, expected: 'a'},
  {name: 'Граница второго', scroll: 300, expected: 'b'},
  {name: 'Обратная прокрутка', scroll: 250, expected: 'a'},
  {name: 'Конец документа', scroll: 600, expected: 'c', size: {scrollHeight: 1000, clientHeight: 400}},
  {name: 'Без прокрутки', scroll: 0, expected: 'a', size: {scrollHeight: 400, clientHeight: 400}},
];

export default function Diagnostic() {
  const [scroll, setScroll] = useState(0);
  return <>
    <p>Позиции: a = 200, b = 400, c = 800; порог = 100 px.</p>
    <table><thead><tr><th>Сценарий</th><th>Прокрутка</th><th>Высота документа / окна</th><th>Ожидается</th><th>Результат</th><th>Статус</th></tr></thead>
      <tbody>{scenarios.map(({name, scroll: position, expected, size}) => {
        const actual = findActiveHeading(headings, position, 100, size);
        return <tr key={name}><td>{name}</td><td>{position}</td><td>{size ? `${size.scrollHeight} / ${size.clientHeight}` : '—'}</td><td>{expected}</td><td>{actual}</td><td>{actual === expected ? 'PASS' : 'FAIL'}</td></tr>;
      })}</tbody></table>
    <label>Виртуальная прокрутка: {scroll} px <input type="range" min="0" max="900" value={scroll} onChange={event => setScroll(Number(event.target.value))} /></label>
    <p>Активный заголовок: {findActiveHeading(headings, scroll, 100)}</p>
  </>;
}
