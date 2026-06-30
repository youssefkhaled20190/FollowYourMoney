import "./App.css";
import { lazy, Suspense, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import i18n from "./i18n";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import WalletLoader from "./Components/UI/Walletloader";
import { checkLoginStatus } from "./Redux/actions/authAction";

// Lazy-loaded pages
const Auth = lazy(() => import("./Pages/Auth"));
const Layout = lazy(() => import("./Components/Layout/Layout"));
const MonthlyPlan = lazy(() => import("./Pages/monthly-plan/page"));
const Gameyas = lazy(() => import("./Pages/Gameyas/GameyaList"));
const InstallmentList = lazy(() => import("./Pages/Installments/InstallmentsList"));

function App() {
  const lang = useSelector((state) => state.language.lang);
  const authLoading = useSelector((state) => state.auth.loading);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();

  useEffect(() => {
    i18n.changeLanguage(lang);
    document.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  useEffect(() => {
    dispatch(checkLoginStatus());
  }, [dispatch]);

  if (authLoading) {
    return <WalletLoader message="Loading..." />;
  }

  return (
    <Router>
      <Suspense fallback={<WalletLoader message="Loading" />}>
        <Routes>
          {/* Prevent logged-in users from visiting login page */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/monthly-plan/page" replace /> : <Auth />} 
          />

          {/* Routes with Sidebar */}
          <Route
            path="/*"
            element={
              isAuthenticated ? (
                <Layout>
                  <Suspense fallback={<WalletLoader message="Loading" />}>
                    <Routes>
                      {/* Default landing page redirect */}
                      <Route path="/" element={<Navigate to="/monthly-plan/page" replace />} />
                      <Route path="/dashboard" element={""} />
                      <Route path="/monthly-plan/page" element={<MonthlyPlan />} />
                      <Route path="/Gameyas/GameyaList" element={<Gameyas />} />
                      <Route path="/Installments/InstallmentsList" element={<InstallmentList />} />
                      <Route path="/users/add" element={""} />
                      <Route path="/settings" element={""} />
                      {/* Catch-all to redirect back to main page if path not found
                      <Route path="*" element={<Navigate to="/monthly-plan/page" replace />} /> */}
                    </Routes>
                  </Suspense>
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;