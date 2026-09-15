const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../server");
const db = require("../models/index");

let user;

async function createTestUser() {
  return await db.User.create({
    first_name: "Test User",
    email: `test-${Date.now()}@example.com`,
    password: await bcrypt.hash("password123", 10),
  });
}

async function login(agent) {
  await agent
    .post("/login")
    .send({
      email: user.email,
      password: "password123",
    })
    .expect(302);
}

async function getCsrfToken(agent) {
  const response = await agent.get("/csrf-token");
  return response.body.csrfToken;
}

beforeAll(async () => {
  user = await createTestUser();
});

afterAll(async () => {
  await db.Todo.destroy({
    where: {
      userId: user.id,
    },
  });

  await db.User.destroy({
    where: {
      id: user.id,
    },
  });

  await db.sequelize.close();
});

describe("DELETE /todos/:id", () => {
  let todo;

  beforeEach(async () => {
    todo = await db.Todo.create({
      title: "Test Todo",
      dueDate: new Date(),
      completed: false,
      userId: user.id,
    });
  });

  afterEach(async () => {
    if (todo) {
      await db.Todo.destroy({
        where: {
          id: todo.id,
        },
      });
    }
  });

  test("should delete a todo and return true", async () => {
    const agent = request.agent(app);

    await login(agent);

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

    await login(agent);

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
    expect(response.body.userId).toBe(user.id);

    await db.Todo.destroy({
      where: {
        id: response.body.id,
      },
    });
  });

  test("should reject an empty todo title", async () => {
    const agent = request.agent(app);

    await login(agent);

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
      userId: user.id,
    });
  });

  afterEach(async () => {
    if (todo) {
      await db.Todo.destroy({
        where: {
          id: todo.id,
        },
      });
    }
  });

  test("should mark a todo as complete", async () => {
    const agent = request.agent(app);

    await login(agent);

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

    await login(agent);

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