import React from 'react';
import Navbar from '../components/common/Navbar';
import HeroSection from '../components/landing/HeroSection';
import ProblemSection from '../components/landing/ProblemSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import CampusSection from '../components/landing/CampusSection';
import SustainabilitySection from '../components/landing/SustainabilitySection';
import CommunitiesSection from '../components/landing/CommunitiesSection';
import CtaSection from '../components/landing/CtaSection';
import Footer from '../components/common/Footer';

export default function LandingPage() {
  return (
    <div className="landing-page-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* A. Sticky Navbar */}
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* B. Hero Section */}
        <HeroSection />

        {/* C. The Problem Section */}
        <ProblemSection />

        {/* D. How It Works Section */}
        <HowItWorksSection />

        {/* E. Our Campus Section */}
        <CampusSection />

        {/* F. Sustainability & Non-Statistical Stewardship Section */}
        <SustainabilitySection />

        {/* G. Three Connected Communities Section */}
        <CommunitiesSection />

        {/* H. Final Call to Action Section */}
        <CtaSection />
      </main>

      {/* I. Footer */}
      <Footer />
    </div>
  );
}
