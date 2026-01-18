import "./TodoPage.css";
import { useEffect, useState } from "react";
import TaskList from "../components/tasklist";
import { getTasks } from "../api/tasks";
import { Task } from "../types/task";
import CreateTaskModal from "../components/CreateTaskModal";
import { useNavigate } from "react-router-dom";


type Filter = "all" | "active" | "completed";

export default function TodoPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    getTasks()
      .then((data) => setTasks(data))
      .catch((err) => console.error("GET TASKS ERROR:", err))
      .finally(() => setLoading(false));
  }, []);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const addTask = () => {
    const title = newTitle.trim();
    if (!title) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTitle("");
    setIsCreating(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  return (
    <div className="cm-page">
      <div className="cm-container">
        <button className="cm-titleBtn" 
        onClick={() => navigate("/")}>
          Chaos Manager
        </button>

        <div className="cm-tabsRow">
          <div className="cm-tabs">
            <button
              className={filter === "all" ? "cm-tab active" : "cm-tab"}
              onClick={() => setFilter("all")}
              type="button"
            >
              Все задачи
            </button>

            <button
              className={filter === "active" ? "cm-tab active" : "cm-tab"}
              onClick={() => setFilter("active")}
              type="button"
            >
              Активные
            </button>

            <button
              className={filter === "completed" ? "cm-tab active" : "cm-tab"}
              onClick={() => setFilter("completed")}
              type="button"
            >
              Выполненные
            </button>
          </div>
        </div>

        <div className="cm-list">
          {loading ? (
            <div>Загрузка...</div>
          ) : (
            <TaskList
              tasks={filteredTasks}
              onToggle={toggleTask}
              onDelete={deleteTask}
            />
          )}
        </div>

        <div className="cm-createWrapBottom">
          <button
            className="cm-createBtn"
            onClick={() => setIsCreating(true)}
            type="button"
          >
            <span className="cm-createInner">Создать задачу</span>
          </button>
        </div>
      </div>

      <CreateTaskModal
        isOpen={isCreating}
        title={newTitle}
        onChangeTitle={setNewTitle}
        onSubmit={addTask}
        onClose={() => {
          setIsCreating(false);
          setNewTitle("");
        }}
      />
    </div>
  );
}