const homedir = require("os").homedir();
const home = process.env.HOME || homedir;
const p = require("path");
const fs = require("fs");
const dbPath = p.join(home, ".todo");
const db = require("./db.js");

const inquirer = require("inquirer");

// add功能   module.exports是要导出的所有功能
module.exports.add = async (title) => {
  // 读取之前的任务
  const list = await db.read(); //await(可以拿到成功的结果)和async是配套promise的
  // 往里面添加一个title任务
  list.push({ title, done: false });
  // 存储任务到文件
  await db.write(list);
};

module.exports.clear = async () => {
  await db.write([]);
};

function markAsDone(list, index) {
  list[index].done = true;
  db.write(list);
}

function markAsUndone(list, index) {
  list[index].done = false;
  db.write(list);
}

function updateTitle(list, index) {
  inquirer
    .prompt({
      type: "input",
      name: "title",
      message: "新的标题",
      default: list[index].title, //旧标题
    })
    .then((answer) => {
      list[index].title = answer.title;
      db.write(list);
    });
}

function remove(list, index) {
  list.splice(index, 1);
  db.write(list);
}

function askForAction(list, index) {
  const actions = { markAsDone, markAsUndone, updateTitle, remove }; //key和value同名可以缩写
  inquirer
    .prompt({
      type: "list",
      name: "action",
      message: "请选择操作",
      choices: [
        { name: "退出", value: "quit" },
        { name: "已完成", value: "markAsDone" },
        { name: "未完成", value: "markAsUndone" },
        { name: "改标题", value: "updateTitle" },
        { name: "删除", value: "remove" },
      ],
    })
    .then((answer2) => {
      const action = actions[answer2.action];
      action && action(list, index);
    });
}

function askForCreateTask(list) {
  inquirer
    .prompt({
      type: "input",
      name: "title",
      message: "输入任务标题",
    })
    .then((answer) => {
      list.push({
        title: answer.title,
        done: false,
      });
      db.write(list);
    });
}

function printTasks(list) {
  //打印之前的任务printTasks
  inquirer
    .prompt({
      type: "list",
      name: "index",
      message: "请选择你想操作的任务",
      choices: [
        { name: "退出", value: "-1" },
        ...list.map((task, index) => {
          return {
            name: `${task.done ? "[x]" : "[_]"}${index + 1} - ${task.title}`,
            value: index.toString(),
          };
        }),
        { name: "创建任务", value: "-2" },
      ],
    })
    .then((answer) => {
      const index = parseInt(answer.index); //把字符串变成整数
      //大于等于0就是选中了一个任务-1  什么都不用做会自动退出 等于-2就是创建任务
      if (index >= 0) {
        //询问操作askForAction
        askForAction(list, index);
      } else if (index === -2) {
        //创建任务
        askForCreateTask(list);
      }
    });
}

module.exports.showAll = async () => {
  //读取之前的任务
  const list = await db.read();
  printTasks(list);
};
