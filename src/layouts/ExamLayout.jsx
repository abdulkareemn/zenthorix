import React from 'react';
import { Outlet } from 'react-router-dom';

const ExamLayout = () => {
  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col">
      <Outlet />
    </div>
  );
};

export default ExamLayout;
