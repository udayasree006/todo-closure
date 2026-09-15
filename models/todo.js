"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static async addTask(params) {
      return await Todo.create(params);
    }

    static async showList(userId) {
      console.log("My Todo list\n");

      console.log("Overdue");
      const overdueTodos = await Todo.overdue(userId);
      overdueTodos.forEach((todo) => console.log(todo.displayableString()));

      console.log();
      console.log("Due Today");
      const todayTodos = await Todo.dueToday(userId);
      todayTodos.forEach((todo) => console.log(todo.displayableString()));

      console.log();
      console.log("Due Later");
      const laterTodos = await Todo.dueLater(userId);
      laterTodos.forEach((todo) => console.log(todo.displayableString()));
    }

    static async overdue(userId) {
      const today = new Date().toISOString().split("T")[0];

      return await Todo.findAll({
        where: {
          userId: userId,
          completed: false,
          dueDate: {
            [sequelize.Sequelize.Op.lt]: today,
          },
        },
      });
    }

    static async dueToday(userId) {
      const today = new Date().toISOString().split("T")[0];

      return await Todo.findAll({
        where: {
          userId: userId,
          completed: false,
          dueDate: today,
        },
      });
    }

    static async dueLater(userId) {
      const today = new Date().toISOString().split("T")[0];

      return await Todo.findAll({
        where: {
          userId: userId,
          dueDate: {
            [sequelize.Sequelize.Op.gt]: today,
          },
        },
      });
    }

    static async completed(userId) {
      return await Todo.findAll({
        where: {
          userId: userId,
          completed: true,
        },
      });
    }

    static async setCompletionStatus(id, completed) {
      const todo = await Todo.findOne({
        where: {
          id,
        },
      });

      if (todo) {
        todo.completed = completed;
        await todo.save();
      }

      return todo;
    }

    static associate(models) {
      Todo.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }

    displayableString() {
      const checkbox = this.completed ? "[x]" : "[]";
      return `${this.id}. ${checkbox} ${this.title} ${this.dueDate}`;
    }
  }

  Todo.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Todo title is required",
          },
          notEmpty: {
            msg: "Todo title is required",
          },
        },
      },

      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Due date is required",
          },
          notEmpty: {
            msg: "Due date is required",
          },
        },
      },

      completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "Todo",
    },
  );

  return Todo;
};
