import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import StudentNavbar from './StudentNavbar';
import Footer from './Footer';

const StudentLayout = () => {
  const location = useLocation();
  const isPlaygroundSimulator = location.pathname.includes('/playgrounds/');
  const isLearning = location.pathname.includes('/learning/');

  return (
    <div className="flex flex-col min-h-screen">
      <StudentNavbar />
      <div className="flex-1">
        <Outlet />
      </div>
      {!isPlaygroundSimulator &&  !isLearning && <Footer />}
    </div>
  );
};

export default StudentLayout;
