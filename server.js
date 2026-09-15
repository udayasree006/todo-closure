const express = require("express");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const flash = require("connect-flash");
const bcrypt = require("bcrypt");
const db = require("./models/index");

const app = express();

app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "development-secret",
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((request, response, next) => {
  response.locals.messages = request.flash();
  next();
});

const csrfProtection = csrf({
  cookie: true,
});
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    async (email, password, done) => {
      try {
        const user = await db.User.findOne({
          where: { email },
        });

        if (!user) {
          return done(null, false, {
            message: "Invalid email or password",
          });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return done(null, false, {
            message: "Invalid email or password",
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/csrf-token", csrfProtection, (request, response) => {
  response.json({
    csrfToken: request.csrfToken(),
  });
});
app.use(express.static("public"));
app.set("view engine", "ejs");
app.get("/signup", (request, response) => {
  response.render("signup");
});

app.post("/signup", async (request, response) => {
  try {
    const { first_name, email, password } = request.body;

    const user = await db.User.create({
      first_name,
      email,
      password: await bcrypt.hash(password, 10),
    });

    request.flash("success", "Account created successfully. Please log in.");
    response.redirect("/login");
  } catch (error) {
    console.error(error);

    if (error.name === "SequelizeValidationError") {
      error.errors.forEach((validationError) => {
        request.flash("error", validationError.message);
      });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      request.flash("error", "Email is already registered.");
    } else {
      request.flash("error", "Unable to create account.");
    }

    response.redirect("/signup");
  }
});
app.get("/login", (request, response) => {
  response.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  }),
);
app.get("/logout", (request, response, next) => {
  request.logout((error) => {
    if (error) {
      return next(error);
    }

    request.session.destroy(() => {
      response.redirect("/login");
    });
  });
});
app.post("/todos", requireLogin, csrfProtection, async (request, response) => {
  try {
    const { title, dueDate } = request.body;

    const todo = await db.Todo.addTask({
      title: title ? title.trim() : title,
      dueDate,
      completed: false,
      userId: request.user.id,
    });

    response.status(201).json(todo);
  } catch (error) {
    console.error(error);

    if (error.name === "SequelizeValidationError") {
      error.errors.forEach((validationError) => {
        request.flash("error", validationError.message);
      });

      return response.status(400).json({
        error: error.errors[0].message,
      });
    }

    response.status(500).json({
      error: "Failed to create todo",
    });
  }
});
// GET /todos - Get all todos
app.get("/todos", requireLogin, async (request, response) => {
  try {
    const todos = await db.Todo.findAll({
      where: {
        userId: request.user.id
      }
    });
    response.json(todos);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Failed to get todos" });
  }
});

// DELETE /todos/:id - Delete a todo
app.delete(
  "/todos/:id",
  requireLogin,
  csrfProtection,
  async (request, response) => {
  try {
    const deletedCount = await db.Todo.destroy({
      where: {
        id: request.params.id,
        userId: request.user.id,
      },
    });

    response.json(deletedCount > 0);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Failed to delete todo" });
  }
});
function requireLogin(request, response, next) {
  if (request.isAuthenticated()) {
    return next();
  }

  response.redirect("/login");
}
app.get("/", requireLogin, async (request, response) => {
  try {
   const overdue = await db.Todo.overdue(request.user.id);
const dueToday = await db.Todo.dueToday(request.user.id);
const dueLater = await db.Todo.dueLater(request.user.id);
const completed = await db.Todo.completed(request.user.id);

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
app.put(
  "/todos/:id",
  requireLogin,
  csrfProtection,
  async (request, response) => {
    try {
      const todo = await db.Todo.findOne({
        where: {
          id: request.params.id,
          userId: request.user.id,
        },
      });

      if (!todo) {
        return response.status(404).json(false);
      }

      todo.completed = request.body.completed;
      await todo.save();

      response.json(true);
    } catch (error) {
      console.error(error);
      response.status(500).json(false);
    }
  },
);

if (require.main === module) {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
