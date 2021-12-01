import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

const HomePage = lazy(() => import("../pages/HomePage"));
const ErrorPage = lazy(() => import("../pages/ErrorPage"));
const BrowsePage = lazy(() => import("../pages/BrowsePage"));
const RecommendationsPage = lazy(() => import("../pages/RecommendationsPage"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));

const AppRoutes = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/recommend" element={<RecommendationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
