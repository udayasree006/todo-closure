const express = require("express");
const db = require("./models/index");

const app = express();

app.use(express.json());

// GET /todos - Get all todos
app.get("/todos", async (request, response) => {
  try {
    const todos = await db.Todo.findAll();
    response.json(todos);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Failed to get todos" });
  }
});

// DELETE /todos/:id - Delete a todo
app.delete("/todos/:id", async (request, response) => {
  try {
    const deletedCount = await db.Todo.destroy({
      where: {
        id: request.params.id,
      },
    });

    response.json(deletedCount > 0);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Failed to delete todo" });
  }
});

module.exports = app;
