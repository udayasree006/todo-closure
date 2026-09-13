const todoList = () => {
    const all = [];

    const add = (todoItem) => {
        all.push(todoItem);
    };

    const markAsComplete = (index) => {
        all[index].completed = true;
    };

    const overdue = () => {
        const today = new Date();

        return all.filter((todo) => {
            const dueDate = new Date(todo.dueDate);
            return dueDate < today && !todo.completed;
        });
    };

    const dueToday = () => {
        const today = new Date();

        return all.filter((todo) => {
            const dueDate = new Date(todo.dueDate);

            return (
                dueDate.getFullYear() === today.getFullYear() &&
                dueDate.getMonth() === today.getMonth() &&
                dueDate.getDate() === today.getDate()
            );
        });
    };

    const dueLater = () => {
        const today = new Date();

        return all.filter((todo) => {
            const dueDate = new Date(todo.dueDate);
            return dueDate > today;
        });
    };

    const toDisplayableList = (list) => {
        const today = new Date();

        return list
            .map((todo) => {
                const dueDate = new Date(todo.dueDate);

                const isToday =
                    dueDate.getFullYear() === today.getFullYear() &&
                    dueDate.getMonth() === today.getMonth() &&
                    dueDate.getDate() === today.getDate();

                const checkbox = todo.completed ? "[x]" : "[]";

                if (isToday) {
                    return `${checkbox} ${todo.title}`;
                }

                const formattedDate = dueDate.toISOString().split("T")[0];

                return `${checkbox} ${todo.title} ${formattedDate}`;
            })
            .join("\n");
    };

    return {
        all,
        add,
        markAsComplete,
        overdue,
        dueToday,
        dueLater,
        toDisplayableList
    };
};

// DO NOT CHANGE ANYTHING BELOW THIS LINE.

const todos = todoList();

const formattedDate = (d) => {
    return d.toISOString().split("T")[0];
};

const dateToday = new Date();

const today = formattedDate(dateToday);

const yesterday = formattedDate(
    new Date(new Date().setDate(dateToday.getDate() - 1))
);

const tomorrow = formattedDate(
    new Date(new Date().setDate(dateToday.getDate() + 1))
);

todos.add({
    title: "Submit assignment",
    dueDate: yesterday,
    completed: false
});

todos.add({
    title: "Pay rent",
    dueDate: today,
    completed: true
});

todos.add({
    title: "Service vehicle",
    dueDate: today,
    completed: false
});

todos.add({
    title: "File taxes",
    dueDate: tomorrow,
    completed: false
});

todos.add({
    title: "Pay electric bill",
    dueDate: tomorrow,
    completed: false
});

console.log("My Todo list\n\n");

console.log("Overdue");

const overdues = todos.overdue();

const formattedOverdues = todos.toDisplayableList(overdues);

console.log(formattedOverdues);

console.log("\n\n");

console.log("Due Today");

const itemsDueToday = todos.dueToday();

const formattedItemsDueToday = todos.toDisplayableList(itemsDueToday);

console.log(formattedItemsDueToday);

console.log("\n\n");

console.log("Due Later");

const itemsDueLater = todos.dueLater();

const formattedItemsDueLater = todos.toDisplayableList(itemsDueLater);

console.log(formattedItemsDueLater);

console.log("\n\n");
module.exports = todoList;