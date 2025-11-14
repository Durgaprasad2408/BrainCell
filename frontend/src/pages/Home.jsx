import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import WorkflowFeatures from "../components/WorkflowFeatures";

const Home = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'instructor') {
        navigate('/instructor', { replace: true });
      } else {
        navigate('/student/learning', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="relative h-screen flex flex-col justify-center items-center bg-black text-white text-sm pb-16 bg-[url('https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/hero/bg-gradient-4.svg')] bg-center bg-cover">
  
        <h1 className="text-4xl md:text-6xl text-center font-semibold max-w-3xl mt-36 bg-gradient-to-r from-white to-[#748298] text-transparent bg-clip-text">
          Personalized Learning for Every Student
        </h1>

        <p className="text-slate-300 md:text-base line-clamp-3 max-md:px-2 text-center max-w-md mt-3">
          Experience adaptive learning paths tailored to your pace, style, and goals. Master complex concepts with our intelligent platform.
        </p>
  
        <div className="flex items-center gap-3 mt-8 text-sm">
          <button onClick={() => navigate('/login')} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 transition rounded-full">
            <span>Start Learning</span>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.79688 11.5117H18.2274M18.2274 11.5117L11.5121 4.79639M18.2274 11.5117L11.5121 18.2269"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
  
      </section>
      <WorkflowFeatures />
    </>
  );
};

export default Home;