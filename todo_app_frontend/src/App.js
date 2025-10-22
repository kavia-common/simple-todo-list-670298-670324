import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import './index.css';

/**
 * Ocean Professional palette
 * primary: #3b82f6, secondary: #64748b, success: #06b6d4, error: #EF4444
 * background: #f9fafb, surface: #ffffff, text: #111827
 */

// Types
/**
 * Todo type representing a single todo item.
 * PUBLIC_INTERFACE
 */
export function createTodo(id, text, completed = false) {
  /** Creates a plain todo object */
  return { id, text, completed };
}

// PUBLIC_INTERFACE
export function useLocalStorage(key, initialValue) {
  /**
   * React hook to persist a stateful value in localStorage.
   * - key: localStorage key
   * - initialValue: default value or initializer function
   * Returns [value, setValue].
   */
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item != null ? JSON.parse(item) : (typeof initialValue === 'function' ? initialValue() : initialValue);
    } catch {
      return typeof initialValue === 'function' ? initialValue() : initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // ignore write errors
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

// Components

function Header() {
  return (
    <header className="header">
      <div className="header__gradient" />
      <h1 className="header__title">My Todos</h1>
      <p className="header__subtitle">Stay organized with a simple, modern list</p>
    </header>
  );
}

function TodoInput({ value, onChange, onAdd }) {
  return (
    <div className="inputRow">
      <label htmlFor="todo-input" className="sr-only">Add a new todo</label>
      <input
        id="todo-input"
        className="inputRow__input"
        placeholder="What do you need to do?"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onAdd();
          }
        }}
        aria-label="Todo text"
      />
      <button
        className="btn btn--primary"
        onClick={onAdd}
        aria-label="Add todo"
      >
        Add
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="empty">
      <div className="empty__icon" aria-hidden>📝</div>
      <div className="empty__text">No todos yet. Add one above to get started.</div>
    </div>
  );
}

function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className={`todoItem ${todo.completed ? 'todoItem--completed' : ''}`}>
      <div className="todoItem__left">
        <input
          id={`todo-${todo.id}`}
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          aria-label={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}
          className="todoItem__checkbox"
        />
        <label htmlFor={`todo-${todo.id}`} className="todoItem__text">
          {todo.text}
        </label>
      </div>
      <button
        className="iconBtn iconBtn--danger"
        onClick={() => onDelete(todo.id)}
        aria-label={`Delete "${todo.text}"`}
        title="Delete"
      >
        ✕
      </button>
    </li>
  );
}

function TodoList({ todos, onToggle, onDelete }) {
  if (!todos.length) return <EmptyState />;
  return (
    <ul className="todoList">
      {todos.map((t) => (
        <TodoItem key={t.id} todo={t} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** Root component for the single-page Todo UI. */
  const [todos, setTodos] = useLocalStorage('todos', []);
  const [text, setText] = useState('');

  const remaining = useMemo(() => todos.filter(t => !t.completed).length, [todos]);

  const addTodo = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setTodos(prev => [{ id, text: trimmed, completed: false }, ...prev]);
    setText('');
  };

  const toggleTodo = (id) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="app">
      <Header />
      <main className="container">
        <section className="card">
          <TodoInput value={text} onChange={setText} onAdd={addTodo} />
          <div className="meta">
            <span className="meta__count" aria-live="polite">
              {remaining} remaining
            </span>
          </div>
          <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
        </section>
      </main>
      <footer className="footer">
        <span>Built with Ocean Professional theme</span>
      </footer>
    </div>
  );
}

export default App;
