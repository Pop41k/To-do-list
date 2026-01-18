import { Task } from "../types/task";
import TaskItem from "./TaskItems";

type Props = {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function TaskList({ tasks, onToggle, onDelete }: Props) {
  if (tasks.length === 0) {
    return <div className="cm-empty">Бездельник, иди работай</div>;
  }

  return (
    <div className="cm-taskList">
      {tasks.map((t) => (
        <TaskItem key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </div>
  );
}