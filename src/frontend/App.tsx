import { FormEvent, useEffect, useState } from 'react'
import { remult } from 'remult'
import { Task } from '../shared/Task'
import { TasksController } from '../shared/TasksController'

const taskRepo = remult.repo(Task)

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')

  useEffect(
    () =>
      taskRepo
        .query({
          where: { completed: undefined }
        })
        .subscribe(setTasks),
    []
  )

  const addTask = async (e: FormEvent) => {
    e.preventDefault()
    try {
      setTasks([
        ...tasks,
        await taskRepo.insert({
          title: newTaskTitle,
          completed: false,
          id: tasks.length + 1
        })
      ])
      setNewTaskTitle('')
    } catch (error: any) {
      alert(error.message)
    }
  }

  const setAllCompleted = async (completed: boolean) => {
    await TasksController.setAllCompleted(completed)
  }

  return (
    <div>
      <main>
        <form onSubmit={addTask}>
          <input
            value={newTaskTitle}
            placeholder="What needs to be done?"
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
        </form>
        {tasks.map((task) => {
          const setTask = (value: typeof task) =>
            setTasks(tasks.map((t) => (t === task ? value : t)))

          const setCompleted = async (completed: boolean) => {
            setTask({ ...task, completed })
            await taskRepo.save({ ...task, completed })
          }
          const setTitle = (title: string) => {
            setTask({ ...task, title })
          }

          const saveTask = async () => {
            try {
              await taskRepo.save(task)
            } catch (error: any) {
              alert(error.message)
            }
          }
          const deleteTask = async () => {
            await taskRepo.delete(task)
            setTasks(tasks.filter((t) => t !== task))
          }
          return (
            <div key={task.id}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={(e) => setCompleted(e.target.checked)}
              />
              <input
                value={task.title}
                onBlur={saveTask}
                onChange={(e) => setTitle(e.target.value)}
              />
              <button onClick={deleteTask}>x</button>
            </div>
          )
        })}
      </main>
      <div>
        <button onClick={() => setAllCompleted(true)}>
          Set all as completed
        </button>
        <button onClick={() => setAllCompleted(false)}>
          Set all as uncompleted
        </button>
      </div>
    </div>
  )
}
export default App
