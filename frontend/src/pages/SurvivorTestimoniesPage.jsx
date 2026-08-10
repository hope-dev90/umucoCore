import React from 'react';
import Layout from '../components/Layout';
import SurvivorTestimonyGallery from '../components/SurvivorTestimonyGallery';
import './SurvivorTestimoniesPage.css';

export default function SurvivorTestimoniesPage() {
  return (
    <Layout>
      <div className="survivor-testimonies-page">
        <SurvivorTestimonyGallery />
      </div>
    </Layout>
  );
}