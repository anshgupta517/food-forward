import React from 'react';
import Navbar from '../components/navbar'; // Assuming Navbar is in components

const Contact: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="pt-20 min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Contact Us
            </h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Get in Touch</h2>
                <p className="text-gray-600 mb-2">
                  If you have any questions, feedback, or inquiries, please feel free to reach out to us.
                </p>
                <p className="text-gray-600 mb-2">
                  Email: <a href="mailto:contact@foodforward.app" className="text-blue-600 hover:underline">contact@foodforward.app</a>
                </p>
                <p className="text-gray-600">
                  We typically respond within 1-2 business days.
                </p>
                {/* A simple contact form could be added here later */}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Contact;
