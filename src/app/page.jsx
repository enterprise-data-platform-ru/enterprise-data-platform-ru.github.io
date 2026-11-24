import React from 'react';
import Header from '../components/Header.jsx';
import Hero from '../components/Hero.jsx';
import Platform from '../components/Platform.jsx';
import Architecture from '../components/Architecture.jsx';
import Solutions from '../components/Solutions.jsx';
import Technology from '../components/Technology.jsx';
import FAQ from '../components/FAQ.jsx';
import Contact from '../components/Contact.jsx';
import Footer from '../components/Footer.jsx';

export default function Home(){
  return <>
    <a className="skip-link" href="#main">К содержимому</a>
    <Header/>
    <main id="main">
      <Hero/>
      <Platform/>
      <Architecture/>
      <Solutions/>
      <Technology/>
      <FAQ/>
      <Contact/>
    </main>
    <Footer/>
  </>;
}
