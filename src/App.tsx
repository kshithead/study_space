import { Navigate, Route, Routes } from "react-router-dom";
import { AppStateProvider } from "@/store/appState";
import AppShell from "@/components/layout/AppShell";
import Home from "@/pages/Home";
import Explore from "@/pages/Explore";
import MyLearning from "@/pages/MyLearning";
import AiTutor from "@/pages/AiTutor";
import StudyMaterials from "@/pages/StudyMaterials";
import Flashcards from "@/pages/Flashcards";
import Quizzes from "@/pages/Quizzes";
import FocusRoom from "@/pages/FocusRoom";
import Bookmarks from "@/pages/Bookmarks";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import CoursePlayer from "@/pages/CoursePlayer";
import Login from "@/pages/Login";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return (
    <AppStateProvider>
      <Routes>
        {/* Full-screen dedicated authentication route */}
        <Route path="/login" element={<Login />} />

        {/* Main application shell with navbar & sidebar */}
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/course/:id" element={<CoursePlayer />} />
          <Route path="/my-learning" element={<MyLearning />} />
          <Route path="/ai-tutor" element={<AiTutor />} />
          <Route path="/study-materials" element={<StudyMaterials />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/quizzes" element={<Quizzes />} />
          <Route path="/focus-room" element={<FocusRoom />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AppStateProvider>
  );
}
