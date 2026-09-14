const express = require("express");
const db = require("./models/index");

const app = express();

app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");

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
app.get("/", async (request, response) => {
  try {
    const overdue = await db.Todo.overdue();
    const dueToday = await db.Todo.dueToday();
    const dueLater = await db.Todo.dueLater();

    response.render("index", {
      overdue: overdue,
      dueToday: dueToday,
      dueLater: dueLater,
    });
  } catch (error) {
    console.error(error);
    response.status(500).send("Failed to load todos");
  }
});

if (require.main === module) {
  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
}

module.exports = app;
