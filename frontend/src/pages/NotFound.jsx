import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * An animated "panicked earth" component to be used as the '0' in 404.
 * Includes dark mode classes.
 */
const AnimatedEarth = () => {
  return (
    <div className="relative w-24 h-24 md:w-32 md:h-32 bg-blue-400 dark:bg-blue-500 rounded-full overflow-hidden shadow-inner animate-panic">
      {/* Sweat Drop */}
      <div className="absolute top-4 right-6 w-3 h-4 bg-cyan-300 rounded-full opacity-0 animate-drip" style={{ transform: 'rotate(20deg)' }} />

      {/* Landmass 1 */}
      <div className="absolute top-5 left-2 w-16 h-12 bg-blue-600 dark:bg-blue-700 rounded-t-full rounded-br-full" style={{ transform: 'rotate(-10deg)' }} />
      {/* Landmass 2 */}
      <div className="absolute bottom-4 right-1 w-10 h-8 bg-blue-600 dark:bg-blue-700 rounded-b-full rounded-tl-full" style={{ transform: 'rotate(10deg)' }} />

      {/* Face */}
      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
        {/* Eyes */}
        <div className="flex space-x-5">
          {/* Left Eye */}
          <div className="relative w-5 h-5 bg-white dark:bg-gray-200 rounded-full">
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-black rounded-full animate-dart" style={{ transform: 'translate(-50%, -50%)' }} />
          </div>
          {/* Right Eye */}
          <div className="relative w-5 h-5 bg-white dark:bg-gray-200 rounded-full">
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-black rounded-full animate-dart" style={{ transform: 'translate(-50%, -50%)' }} />
          </div>
        </div>
        {/* Mouth */}
        <div className="w-8 h-4 border-b-4 border-black dark:border-gray-900 rounded-b-full animate-mouth" />
      </div>
    </div>
  );
};

/**
 * The main 404 page component, styled after the provided GIF.
 * Responds to the ThemeContext via Tailwind's 'dark:' utility classes.
 */
const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/'); // Simplified navigation.
    // You can re-add your useAuth logic here if you need to redirect
    // users to specific dashboards (e.g., /admin, /student/learning)
  };

  return (
    <>
      {/* Keyframe animations */}
      <style>{`
        @keyframes panic {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          20% { transform: translateX(-6px) rotate(-4deg); }
          40% { transform: translateX(6px) rotate(4deg); }
          60% { transform: translateX(-6px) rotate(-4deg); }
          80% { transform: translateX(6px) rotate(4deg); }
        }

        @keyframes dart {
          0%, 100% { transform: translate(-50%, -50%) translateX(0); }
          30% { transform: translate(-50%, -50%) translateX(-3px); }
          60% { transform: translate(-50%, -50%) translateX(3px); }
          90% { transform: translate(-50%, -50%) translateX(0); }
        }

        @keyframes mouth {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.5); }
        }
        
        @keyframes drip {
          0% { transform: translateY(-10px) rotate(20deg); opacity: 0; }
          40% { opacity: 1; }
          100% { transform: translateY(20px) rotate(20deg); opacity: 0; }
        }

        .animate-panic {
          animation: panic 0.8s ease-in-out infinite;
        }
        .animate-dart {
          animation: dart 1.5s ease-in-out infinite;
        }
        .animate-mouth {
          animation: mouth 0.3s ease-in-out infinite;
        }
        .animate-drip {
          animation: drip 1.2s cubic-bezier(0.64, 0, 0.78, 0) infinite;
          animation-delay: 0.5s;
        }
      `}</style>

      {/* Main container with light/dark background */}
      <div className="h-screen bg-white dark:bg-slate-900">
        {/* Main Content */}
        <main className="h-full flex flex-col items-center justify-center text-center p-8">
          {/* 404 Number with light/dark text colors */}
          <div className="flex items-center justify-center text-blue-600 dark:text-blue-400 font-black">
            <span className="text-8xl md:text-9xl">4</span>
            <div className="mx-2">
              <AnimatedEarth />
            </div>
            <span className="text-8xl md:text-9xl">4</span>
            <span className="text-5xl md:text-6xl text-blue-400 dark:text-blue-300 self-start ml-1">*</span>
          </div>

          {/* Text Content with light/dark text colors */}
          <h1 className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mt-10">
            What on earth are you doing here!?
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mt-3 max-w-md">
            Well, this is awkward, the page you were trying to view does not exist.
          </p>

          {/* Home Link with light/dark text color */}
          <button
            onClick={handleGoHome}
            className="text-blue-600 dark:text-blue-400 font-semibold underline mt-10 text-lg transition-transform hover:scale-105"
          >
            Get yourself home
          </button>
        </main>
      </div>
    </>
  );
};

export default NotFound;