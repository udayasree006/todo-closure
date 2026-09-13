"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static async addTask(params) {
      return await Todo.create(params);
    }

    static async showList() {
      console.log("My Todo list\n");

      console.log("Overdue");
      const overdueTodos = await Todo.overdue();
      overdueTodos.forEach((todo) => console.log(todo.displayableString()));

      console.log();
      console.log("Due Today");
      const todayTodos = await Todo.dueToday();
      todayTodos.forEach((todo) => console.log(todo.displayableString()));

      console.log();
      console.log("Due Later");
      const laterTodos = await Todo.dueLater();
      laterTodos.forEach((todo) => console.log(todo.displayableString()));
    }

    static async overdue() {
      const today = new Date().toISOString().split("T")[0];

      return await Todo.findAll({
        where: {
          dueDate: {
            [sequelize.Sequelize.Op.lt]: today,
          },
        },
      });
    }

    static async dueToday() {
      const today = new Date().toISOString().split("T")[0];

      return await Todo.findAll({
        where: {
          dueDate: today,
        },
      });
    }

    static async dueLater() {
      const today = new Date().toISOString().split("T")[0];

      return await Todo.findAll({
        where: {
          dueDate: {
            [sequelize.Sequelize.Op.gt]: today,
          },
        },
      });
    }

    static async markAsComplete(id) {
      const todo = await Todo.findOne({
        where: {
          id,
        },
      });

      if (todo) {
        todo.completed = true;
        await todo.save();
      }

      return todo;
    }

    static associate(models) {
      // define association here
    }

    displayableString() {
      const checkbox = this.completed ? "[x]" : "[]";
      return `${this.id}. ${checkbox} ${this.title} ${this.dueDate}`;
    }
  }

  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    },
  );

  return Todo;
};
