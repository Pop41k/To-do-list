import "./TodoPage.css";
import { useEffect, useState } from "react";
import TaskList from "../components/tasklist";
import { getTasks, createTask, updateTask, deleteTask as deleteTaskApi } from "../api/tasks";
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

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newCompleted = !task.completed;
    
    // Оптимистичное обновление UI
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: newCompleted } : t))
    );

    try {
      // Синхронизация с бэкендом
      const updatedTask = await updateTask(id, newCompleted);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? updatedTask : t))
      );
    } catch (error) {
      console.error('Ошибка обновления задачи:', error);
      // Откатываем изменения при ошибке
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: task.completed } : t))
      );
    }
  };

  const deleteTask = async (id: string) => {
    // Оптимистичное обновление UI
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      // Синхронизация с бэкендом
      await deleteTaskApi(id);
    } catch (error) {
      console.error('Ошибка удаления задачи:', error);
      // При ошибке перезагружаем задачи из БД
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (reloadError) {
        console.error('Ошибка перезагрузки задач:', reloadError);
      }
    }
  };

  const addTask = async () => {
    const title = newTitle.trim();
    if (!title) return;

    setIsCreating(false);
    const tempId = crypto.randomUUID();
    
    // Оптимистичное обновление UI
    const tempTask: Task = {
      id: tempId,
      title,
      completed: false,
    };
    setTasks((prev) => [tempTask, ...prev]);
    setNewTitle("");

    try {
      // Синхронизация с бэкендом
      const newTask = await createTask(title);
      // Заменяем временную задачу на реальную из БД
      setTasks((prev) =>
        prev.map((t) => (t.id === tempId ? newTask : t))
      );
    } catch (error) {
      console.error('Ошибка создания задачи:', error);
      // Удаляем временную задачу при ошибке
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
      setIsCreating(true);
    }
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