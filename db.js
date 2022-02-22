const homedir = require("os").homedir();
const home = process.env.HOME || homedir;
const p = require("path");
const fs = require("fs");
const dbPath = p.join(home, ".todo");

const db = {
  read(path = dbPath) {
    return new Promise((resolve, reject) => {
      fs.readFile(path, { flag: "a+" }, (error, data) => {
        if (error) {
          return reject(error); //if失败的时候reject 然后退出
        }
        let list;
        try {
          list = JSON.parse(data.toString());
        } catch (error2) {
          list = [];
        }
        resolve(list); //else成功的时候resolve
      });
    });
  },
  write(list, path = dbPath) {
    return new Promise((resolve, reject) => {
      const string = JSON.stringify(list); //数组转成字符串
      fs.writeFile(path, string + "\n", (error) => {
        if (error) {
          return reject(error); //有错就reject然后直接退出
        }
        resolve();
      });
    });
  },
};

module.exports = db; //导出属性
