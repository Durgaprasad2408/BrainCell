// src/App.jsx

import React, { useState } from 'react'; // Import useState
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Import useAuth
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import DFAPlayground from './pages/Playgrounds/DFAPlayground';
import NFAPlayground from './pages/Playgrounds/NFAPlayground';
import RegexToDFAPlayground from './pages/Playgrounds/RegexToDFAPlayground';
import NFAToDFAPlayground from './pages/Playgrounds/NFAToDFAPlayground';
import DFAToNFAPlayground from './pages/Playgrounds/DFAToNFAPlayground';
import CFGPlayground from './pages/Playgrounds/CFGPlayground';
import TuringMachinePlayground from './pages/Playgrounds/TuringMachinePlayground';
import MealyMachinePlayground from './pages/Playgrounds/MealyMachinePlayground';
import MooreMachinePlayground from './pages/Playgrounds/MooreMachinePlayground';
import MealyToMoorePlayground from './pages/Playgrounds/MealyToMoorePlayground';
import MooreToMealyPlayground from './pages/Playgrounds/MooreToMealyPlayground';
import PDAPlayground from './pages/Playgrounds/PDAPlayground';
import ChomskyHierarchyPlayground from './pages/Playgrounds/ChomskyHierarchyPlayground';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Learning from './pages/Students/Learning';
import SubjectContent from './pages/Students/SubjectContent';
import Footer from './components/Footer';
import Playground from './pages/Playgrounds/Playgrounds';
import PumpingLemmaPlayground from './pages/Playgrounds/PumpingLemmaPlayground';
import Library from './pages/Students/Library';
import Practice from './pages/Students/Practice';
import Dashboard from './pages/Students/Dashboard';
import StudentLayout from './components/StudentLayout';
import Leaderboard from './pages/Students/Leaderboard';
import TakeChallenge from './pages/Students/TakeChallenge';
import ChallengeResults from './pages/Students/ChallengeResults';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ChallengeManagement from './pages/admin/ChallengeManagement';
import ChallengeMetrics from './pages/admin/ChallengeMetrics';
import LibraryManagement from './pages/admin/LibraryManagement';
import LearningContentManagement from './pages/admin/LearningContentManagement';
import SubjectUsersData from './pages/admin/SubjectUsersData';
import LessonMetrics from './pages/admin/LessonMetrics';
import Statistics from './pages/admin/Statistics';
import Profile from './pages/Profile';
import InstructorLayout from './components/InstructorLayout';
import InstructorDashboard from './pages/Instructor/InstructorDashboard';
import InstructorChallenges from './pages/Instructor/ChallengeManagement';
import InstructorLibrary from './pages/Instructor/LibraryManagement';
import InstructorLearning from './pages/Instructor/LearningContentManagement';
import InstructorSubjectUsersData from './pages/Instructor/SubjectUsersData';
import InstructorQueries from './pages/Instructor/Queries';
import AdminQueries from './pages/admin/Queries';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

// --- IMPORT CHATBOT COMPONENTS ---
// (Adjust this path if your files are in a different folder, e.g., './components/')
import ChatbotButton from './components/ChatbotButton';
import ChatbotWindow from './components/ChatbotWindow';
// --- END IMPORTS ---

const PlaygroundsLayout = () => (
  <Layout>
    <Outlet />
  </Layout>
);

const AppContent = () => {
  const location = useLocation();

  // --- ADD CHATBOT STATE & AUTH ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user } = useAuth(); // Get the authenticated user
  // --- END CHATBOT STATE & AUTH ---

  const hideNavbar = location.pathname.startsWith("/student") || location.pathname.startsWith("/admin") || location.pathname.startsWith("/instructor") || location.pathname === "/login" || location.pathname === "/register";
  const hideFooter = location.pathname.startsWith("/student") || location.pathname.startsWith("/admin") || location.pathname.startsWith("/instructor") || location.pathname === "/login" || location.pathname === "/register" || location.pathname.includes("/playgrounds/");

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/student" element={
          <ProtectedRoute allowedRoles={['user']}>
            <StudentLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Learning />} />
          <Route path="learning" element={<Learning />} />
          <Route path="learning/:subjectName" element={<SubjectContent />} />
          <Route path="library" element={<Library />} />
          
          <Route path="practice" element={<Practice />} />
          <Route path="practice/take/:challengeId" element={<TakeChallenge />} />
          <Route path="practice/results/:challengeId" element={<ChallengeResults />} />
          <Route path="practice/leaderboard/:challengeId" element={<Leaderboard />} />

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="playgrounds" element={<Playground />} />
          <Route path="playgrounds/dfa-simulator" element={<DFAPlayground />} />
          <Route path="playgrounds/nfa-simulator" element={<NFAPlayground />} />
          <Route path="playgrounds/regex-to-dfa" element={<RegexToDFAPlayground />} />
          <Route path="playgrounds/nfa-to-dfa" element={<NFAToDFAPlayground />} />
          <Route path="playgrounds/dfa-to-nfa" element={<DFAToNFAPlayground />} />
          <Route path="playgrounds/cfg-parser" element={<CFGPlayground />} />
          <Route path="playgrounds/turing-machine" element={<TuringMachinePlayground />} />
          <Route path="playgrounds/mealy-machine" element={<MealyMachinePlayground />} />
          <Route path="playgrounds/moore-machine" element={<MooreMachinePlayground />} />
          <Route path="playgrounds/mealy-to-moore" element={<MealyToMoorePlayground />} />
          <Route path="playgrounds/moore-to-mealy" element={<MooreToMealyPlayground />} />
          <Route path="playgrounds/pda-simulator" element={<PDAPlayground />} />
          <Route path="playgrounds/chomsky-hierarchy" element={<ChomskyHierarchyPlayground />} />
          <Route path="playgrounds/pumping-lemma" element={<PumpingLemmaPlayground />} />
        </Route>

        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="challenges" element={<ChallengeManagement />} />
          <Route path="challenges/metrics/:challengeId" element={<ChallengeMetrics />} />
          <Route path="library" element={<LibraryManagement />} />
          <Route path="learning" element={<LearningContentManagement />} />
          <Route path="learning/users/:subjectName" element={<SubjectUsersData />} />
          <Route path="learning/metrics/:lessonId" element={<LessonMetrics />} />
          <Route path="queries" element={<AdminQueries />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="/instructor" element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorLayout />
          </ProtectedRoute>
        }>
          <Route index element={<InstructorDashboard />} />
          <Route path="challenges" element={<InstructorChallenges />} />
          <Route path="challenges/metrics/:challengeId" element={<ChallengeMetrics />} />
          <Route path="library" element={<InstructorLibrary />} />
          <Route path="learning" element={<InstructorLearning />} />
          <Route path="learning/users/:subjectName" element={<InstructorSubjectUsersData />} />
          <Route path="learning/metrics/:lessonId" element={<LessonMetrics />} />
          <Route path="queries" element={<InstructorQueries />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideFooter && <Footer />}

      {/* --- RENDER CHATBOT IF USER IS LOGGED IN --- */}
      {user && (
        <>
          <ChatbotWindow user={user} isOpen={isChatOpen} />
          <ChatbotButton
            isOpen={isChatOpen}
            onClick={() => setIsChatOpen((prev) => !prev)}
          />
        </>
      )}
      {/* --- END CHATBOT RENDER --- */}
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;