import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { Dispatch, Download, Faq, Footer, Partners, Services, Trust } from './components/Sections';

export default function App() {
  return (
    <>
      <a className="skip" href="#main">
        Bỏ qua, tới nội dung chính
      </a>
      <Header />
      <main id="main">
        <Hero />
        <HowItWorks />
        <Dispatch />
        <Services />
        <Trust />
        <Partners />
        <Faq />
        <Download />
      </main>
      <Footer />
    </>
  );
}
