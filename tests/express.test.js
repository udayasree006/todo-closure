const request = require("supertest");
const app = require("../server");
const db = require("../models/index");

async function getCsrfToken(agent) {
  const response = await agent.get("/csrf-token");
  return response.body.csrfToken;
}

describe("DELETE /todos/:id", () => {
  let todo;

  beforeEach(async () => {
    todo = await db.Todo.create({
      title: "Test Todo",
      dueDate: new Date(),
      completed: false,
    });
  });

  afterEach(async () => {
    await db.Todo.destroy({
      where: {
        id: todo.id,
      },
    });
  });

  test("should delete a todo and return true", async () => {
    const agent = request.agent(app);
    const csrfToken = await getCsrfToken(agent);

    const response = await agent
      .delete(`/todos/${todo.id}`)
      .set("CSRF-Token", csrfToken);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(true);

    const deletedTodo = await db.Todo.findByPk(todo.id);

    expect(deletedTodo).toBeNull();
  });
});

describe("POST /todos", () => {
  test("should create a new todo", async () => {
    const agent = request.agent(app);
    const csrfToken = await getCsrfToken(agent);

    const response = await agent
      .post("/todos")
      .set("CSRF-Token", csrfToken)
      .send({
        title: "New Test Todo",
        dueDate: "2026-09-20",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe("New Test Todo");
    expect(response.body.dueDate).toBe("2026-09-20");

    await db.Todo.destroy({
      where: {
        id: response.body.id,
      },
    });
  });

  test("should reject an empty todo title", async () => {
    const agent = request.agent(app);
    const csrfToken = await getCsrfToken(agent);

    const response = await agent
      .post("/todos")
      .set("CSRF-Token", csrfToken)
      .send({
        title: "   ",
        dueDate: "2026-09-20",
      });

    expect(response.statusCode).toBe(400);
  });
});

describe("PUT /todos/:id", () => {
  let todo;

  beforeEach(async () => {
    todo = await db.Todo.create({
      title: "Update Test Todo",
      dueDate: "2026-09-20",
      completed: false,
    });
  });

  afterEach(async () => {
    await db.Todo.destroy({
      where: {
        id: todo.id,
      },
    });
  });

  test("should mark a todo as complete", async () => {
    const agent = request.agent(app);
    const csrfToken = await getCsrfToken(agent);

    const response = await agent
      .put(`/todos/${todo.id}`)
      .set("CSRF-Token", csrfToken)
      .send({
        completed: true,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(true);

    const updatedTodo = await db.Todo.findByPk(todo.id);

    expect(updatedTodo.completed).toBe(true);
  });

  test("should mark a todo as incomplete", async () => {
    todo.completed = true;
    await todo.save();

    const agent = request.agent(app);
    const csrfToken = await getCsrfToken(agent);

    const response = await agent
      .put(`/todos/${todo.id}`)
      .set("CSRF-Token", csrfToken)
      .send({
        completed: false,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(true);

    const updatedTodo = await db.Todo.findByPk(todo.id);

    expect(updatedTodo.completed).toBe(false);
  });
});

afterAll(async () => {
  await db.sequelize.close();
});