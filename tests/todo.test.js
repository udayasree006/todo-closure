const todoList = require("../index");

describe("Todo List", () => {
  test("should create a new todo", () => {
    const todos = todoList();

    const todo = {
      title: "Complete assignment",
      dueDate: "2026-09-13",
      completed: false,
    };

    todos.add(todo);

    expect(todos.all).toContain(todo);
  });

  test("should mark a todo as completed", () => {
    const todos = todoList();

    todos.add({
      title: "Complete assignment",
      dueDate: "2026-09-13",
      completed: false,
    });

    todos.markAsComplete(0);

    expect(todos.all[0].completed).toBe(true);
  });

  test("should retrieve overdue todos", () => {
    const todos = todoList();

    todos.add({
      title: "Old assignment",
      dueDate: "2020-01-01",
      completed: false,
    });

    expect(todos.overdue()).toHaveLength(1);
    expect(todos.overdue()[0].title).toBe("Old assignment");
  });

  test("should retrieve due today todos", () => {
    const todos = todoList();

    const today = new Date().toISOString().split("T")[0];

    todos.add({
      title: "Today's task",
      dueDate: today,
      completed: false,
    });

    expect(todos.dueToday()).toHaveLength(1);
    expect(todos.dueToday()[0].title).toBe("Today's task");
  });

  test("should retrieve due later todos", () => {
    const todos = todoList();

    todos.add({
      title: "Future task",
      dueDate: "2099-12-31",
      completed: false,
    });

    expect(todos.dueLater()).toHaveLength(1);
    expect(todos.dueLater()[0].title).toBe("Future task");
  });
});
