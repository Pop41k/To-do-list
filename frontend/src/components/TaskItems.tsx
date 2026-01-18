import { Task } from "../types/task";

type Props = {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function TaskItem({ task, onToggle, onDelete }: Props) {
  return (
  <div className="cm-taskRow">
    <button className="cm-check" onClick={() => onToggle(task.id)} type="button">
      <span className={task.completed ? "cm-box checked" : "cm-box"} />
    </button>

    <div className="cm-taskMain">
      <span className={task.completed ? "cm-taskText done" : "cm-taskText"}>
        {task.title}
      </span>

      <button className="cm-delete" onClick={() => onDelete(task.id)} type="button">
        X
      </button>
    </div>
  </div>
);
}