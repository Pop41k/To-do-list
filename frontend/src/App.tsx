import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import TodoPage from "./pages/TodoPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tasks" element={<TodoPage />} />
    </Routes>
  );
}