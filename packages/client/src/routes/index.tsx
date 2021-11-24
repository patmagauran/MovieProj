import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

const HomePage = lazy(() => import('../pages/HomePage'));
const ErrorPage = lazy(() => import('../pages/ErrorPage'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="*" element={ <ErrorPage/>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
