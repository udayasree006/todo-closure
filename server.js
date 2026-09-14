const express = require("express");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const db = require("./models/index");

const app = express();
app.use(cookieParser());

const csrfProtection = csrf({
  cookie: true,
});
app.use(express.json());
app.get("/csrf-token", csrfProtection, (request, response) => {
  response.json({
    csrfToken: request.csrfToken(),
  });
});
app.use(express.static("public"));
app.set("view engine", "ejs");

app.post("/todos", csrfProtection, async (request, response)  => {
  try {
    const { title, dueDate } = request.body;

    if (!title || !title.trim()) {
      return response.status(400).json({
        error: "Todo title is required",
      });
    }

    const todo = await db.Todo.addTask({
      title: title.trim(),
      dueDate,
      completed: false,
    });

    response.status(201).json(todo);
  } catch (error) {
    console.error(error);
    response.status(500).json({
      error: "Failed to create todo",
    });
  }
});
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
app.delete("/todos/:id", csrfProtection, async (request, response) => {
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
    const completed = await db.Todo.completed();

    response.render("index", {
      overdue: overdue,
      dueToday: dueToday,
      dueLater: dueLater,
      completed: completed,
    });
  } catch (error) {
    console.error(error);
    response.status(500).send("Failed to load todos");
  }
});
app.put("/todos/:id", csrfProtection, async (request, response) => {
  try {
    const todo = await db.Todo.setCompletionStatus(
      request.params.id,
      request.body.completed,
    );

    if (!todo) {
      return response.status(404).json(false);
    }

    response.json(true);
  } catch (error) {
    console.error(error);
    response.status(500).json(false);
  }
});

if (require.main === module) {
  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
}

module.exports = app;
