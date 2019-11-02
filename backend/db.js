const mysql = require("mysql2");

class DB {
  constructor(data) {
    this.db = mysql.createPool({
      host    : data["host"],
      user    : data["user"],
      password: data["password"],
      database: data["database"]
    }).promise();
  }

  async Query(sql, args) {
    try {
      return (await this.db.query(sql, args))[0];
    } catch(error) {
      return {error: `${error["code"]} [${error["errno"]}]: ${error["message"]}`};
    }
  }

  async GetData() {
    let results = await this.Query("SELECT * FROM sample_table");
    return results;
  }

  async PostData(name, age) {
    let results = await this.Query("INSERT INTO sample_table (name, age) VALUES (?, ?)", [name, age]);
    return results;
  }

  async PutData(id, name, age) {
    let results = await this.Query("UPDATE sample_table SET name=?, age=? WHERE id=?", [name, age, id]);
    return results;
  }

  async DeleteData(id) {
    let results = await this.Query("DELETE FROM sample_table WHERE id=?", [id]);
    return results;
  }
};

module.exports = DB;
