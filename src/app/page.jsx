import React from 'react';
import Header from '../components/Header.jsx';
import Hero from '../components/Hero.jsx';
import Platform from '../components/Platform.jsx';
import Architecture from '../components/Architecture.jsx';
import {Solutions,Technology,FAQ,Contact,Footer} from '../components/Solutions.jsx';
export default function Home(){return <><a className="skip-link" href="#main">К содержимому</a><Header/><main id="main"><Hero/><Platform/><Architecture/><Solutions/><Technology/><FAQ/><Contact/></main><Footer/></>}
