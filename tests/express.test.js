const request = require("supertest");
const app = require("../server");
const db = require("../models/index");

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
    const response = await request(app).delete(`/todos/${todo.id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(true);

    const deletedTodo = await db.Todo.findByPk(todo.id);

    expect(deletedTodo).toBeNull();
  });
});

afterAll(async () => {
  await db.sequelize.close();
});
