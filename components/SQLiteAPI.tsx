export const RemoveUserGroup = async (db: any, list: any[]) => {
  console.log("removingU");
  list.forEach(async (item) => {
    try {
      await db.runAsync(
        `DELETE FROM user_group_id_table WHERE user_group_id = ?`,
        [item.user_group_id]
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  });
};

export const AddUserGroup = async (db: any, list: any[]) => {
  console.log("addingU");
  list.forEach(async (item) => {
    try {
      await db.runAsync(
        `INSERT INTO user_group_id_table (group_id , timeStamp, user_group_id, user_group_name, emoji) VALUES (?,?,?,?,?)`,
        [
          item.group_id,
          item.timeStamp,
          item.user_group_id,
          item.user_group_name,
          item.emoji,
        ]
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  });
};

export const UpdateUserGroup = async (db: any, list: any[]) => {
  console.log("updatingU");
  list.forEach(async (item) => {
    try {
      await db.runAsync(
        `UPDATE user_group_id_table SET group_id = ?, timeStamp = ?, user_group_id = ?, user_group_name = ? emoji = ? WHERE user_group_id = ?`,
        [
          item.group_id,
          item.timeStamp,
          item.user_group_id,
          item.user_group_name,
          item.emoji,
          item.user_group_id,
        ]
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  });
};

export const RemoveGroup = async (db: any, list: any[]) => {
  console.log("removingG");
  list.forEach(async (item) => {
    try {
      await db.runAsync(`DELETE FROM group_id_table WHERE group_id = ?`, [
        item.group_id,
      ]);
    } catch (error) {
      console.log(error);
      throw error;
    }
  });
};

export const AddGroup = async (db: any, list: any[]) => {
  console.log("AddingG");
  list.forEach(async (item) => {
    try {
      await db.runAsync(
        `INSERT INTO group_id_table (group_id , timeStamp, group_name, user_group_id, timeStamp, emoji) VALUES  (?,?,?,?,?,?)`,
        [
          item.group_id,
          item.timeStamp,
          item.group_name,
          item.user_group_id,
          item.timeStamp,
          item.emoji,
        ]
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  });
};

export const UpdateGroup = async (db: any, list: any[]) => {
  console.log("updatingG");
  list.forEach(async (item) => {
    try {
      await db.runAsync(
        `UPDATE group_id_table SET group_id = ?, timeStamp = ?, group_name = ?, user_group_id = ?, emoji = ? WHERE group_id = ?`,
        [
          item.group_id,
          item.timeStamp,
          item.group_name,
          item.group_id,
          item.user_group_id,
          item.emoji,
        ]
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  });
};

export const RemoveTag = async (db: any, list: any[]) => {
  console.log("removingS");
  list.forEach(async (item) => {
    try {
      await db.runAsync(`DELETE FROM tag_table WHERE tag_id = ?`, [
        item.tag_id,
      ]);
    } catch (error) {
      console.log(error);
      throw error;
    }
  });
};

export const AddTag = async (db: any, list: any[]) => {
  list.forEach(async (item) => {
    try {
      await db.runAsync(
        `INSERT INTO tag_table (tag_id , tag_name, group_id, emoji, timeStamp) VALUES  (?,?,?,?,?)`,
        [item.tag_id, item.tag_name, item.group_id, item.emoji, item.timeStamp]
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  });
};

export const UpdateTag = async (db: any, list: any[]) => {
  console.log("updatingS");
  list.forEach(async (item) => {
    try {
      await db.runAsync(
        `UPDATE tag_table SET tag_id = ?, tag_name = ?, group_id = ?, emoji = ?, timeStamp = ? WHERE tag_id = ?`,
        [
          item.tag_id,
          item.tag_name,
          item.group_id,
          item.emoji,
          item.timeStamp,
          item.tag_id,
        ]
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  });
};

export const RemoveSession = async (db: any, list: any[]) => {
  console.log("removingS");
  list.forEach(async (item) => {
    try {
      await db.runAsync(`DELETE FROM session_id_table WHERE session_id = ?`, [
        item.session_id,
      ]);
    } catch (error) {
      console.log(error);
      throw error;
    }
  });
};

export const AddSession = async (db: any, list: any[]) => {
  console.log("addingS");
  list.forEach(async (item) => {
    try {
      await db.runAsync(
        `INSERT INTO session_id_table (session_id , session_name, group_id, date, timeStamp, tag_id) VALUES  (?,?,?,?,?,?)`,
        [
          item.session_id,
          item.session_name,
          item.group_id,
          item.date,
          item.timeStamp,
          item.tag_id,
        ]
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  });
};

export const UpdateSession = async (db: any, list: any[]) => {
  console.log("updatingS");
  list.forEach(async (item) => {
    try {
      await db.runAsync(
        `UPDATE session_id_table SET session_id = ?, session_name = ?, group_id = ?, date = ?, timeStamp = ?, tag_id = ? WHERE session_id = ?`,
        [
          item.session_id,
          item.session_name,
          item.group_id,
          item.date,
          item.timeStamp,
          item.tag_id,
          item.session_id,
        ]
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  });
};

export const RemoveTransaction = async (db: any, list: any[]) => {
  console.log("removingT");
  list.forEach(async (item) => {
    db.runAsync(`DELETE FROM transaction_table WHERE transaction_id = ?`, [
      item.transaction_id,
    ]);
  });
};

export const AddTransaction = async (db: any, list: any[]) => {
  try {
    console.log("addingT");
    db.withTransactionAsync(async () => {
      list.forEach(async (item, index) => {
        await db.runAsync(
          `INSERT INTO transaction_table (transaction_id, session_id , user_group_id, payer_payee, amount, currency, rate , timeStamp) VALUES  (?,?,?,?,?,?,?,?)`,
          [
            item.transaction_id,
            item.session_id,
            item.user_group_id,
            item.payer_payee,
            item.amount,
            item.currency,
            item.rate,
            item.timeStamp,
          ]
        );
        // console.log(index);
      });
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const UpdateTransaction = async (db: any, list: any[]) => {
  console.log("updatingT");
  list.forEach(async (item) => {
    try {
      await db.runAsync(
        `UPDATE transaction_table SET transaction_id = ?, session_id = ?, user_group_id = ?, payer_payee = ?, amount = ?, currency = ?, rate = ?, timeStamp = ? WHERE transaction_id = ?`,
        [
          item.transaction_id,
          item.session_id,
          item.user_group_id,
          item.payer_payee,
          item.amount,
          item.currency,
          item.rate,
          item.timeStamp,
          item.transaction_id,
        ]
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  });
};

export const ClearAll = async (db: any) => {
  try {
    await db.getAllAsync(`DELETE FROM group_id_table`);
    await db.getAllAsync(`DELETE FROM user_group_id_table`);
    await db.getAllAsync(`DELETE FROM session_id_table`);
    // await db.getAllAsync(`DROP TABLE session_id_table`);
    await db.getAllAsync(`DELETE FROM transaction_table`);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const GetUserGroup = async (db: any) => {
  try {
    return await db.getAllAsync(`SELECT * FROM user_group_id_table`);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const GetUserGroupSum = async (db: any, user_group_id: any) => {
  try {
    return await db.getAllAsync(
      `SELECT SUM(amount*rate) AS sum FROM transaction_table WHERE payer_payee = 0 AND user_group_id = ? GROUP BY user_group_id`,
      [user_group_id]
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const GetGroupUserNet = async (db: any, group_id: any) => {
  try {
    return await db.getAllAsync(
      `SELECT user_group_id_table.emoji, user_group_id_table.group_id, user_group_id_table.user_group_id, user_group_id_table.user_group_name, SUM(transaction_table.amount*transaction_table.rate*(transaction_table.payer_payee*2-1)) AS net ` +
        `FROM transaction_table JOIN user_group_id_table ON transaction_table.user_group_id = user_group_id_table.user_group_id AND user_group_id_table.group_id = ? GROUP BY user_group_id_table.user_group_id ORDER BY user_group_id_table.user_group_name ASC`,
      [group_id]
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const GetGroupUser = async (db: any, group_id: any) => {
  try {
    return await db.getAllAsync(
      `SELECT * FROM user_group_id_table WHERE group_id = ?`,
      [group_id]
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const GetGroupTag = async (db: any, group_id: any) => {
  try {
    return await db.getAllAsync(`SELECT * FROM tag_table WHERE group_id = ?`, [
      group_id,
    ]);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const GetGroup = async (db: any) => {
  try {
    return await db.getAllAsync(`SELECT * FROM group_id_table`);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const GetGroupInfo = async (db: any, group_id: any) => {
  try {
    return await db.getAllAsync(
      `SELECT * FROM group_id_table WHERE group_id = ?`,
      [group_id]
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const GetTags = async (db: any) => {
  try {
    return await db.getAllAsync(`SELECT * FROM tag_table`);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const GetTagEmoji = async (db: any, tag_id: any) => {
  try {
    return await db.getAllAsync(
      `SELECT emoji FROM tag_table WHERE tag_id = ?`,
      [tag_id]
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const GetSessions = async (db: any) => {
  try {
    return await db.getAllAsync(`SELECT * FROM session_id_table`);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const GetSessionByGroup = async (db: any, group_id: any) => {
  try {
    return await db.getAllAsync(
      `SELECT session_id_table.session_id, session_id_table.date, session_id_table.session_name, session_id_table.date, session_id_table.timeStamp, session_id_table.tag_id, transaction_table.currency, transaction_table.rate, SUM(transaction_table.amount) AS sum FROM session_id_table ` +
        `JOIN transaction_table ON session_id_table.session_id = transaction_table.session_id ` +
        `AND session_id_table.group_id = ? AND transaction_table.payer_payee = 1 GROUP BY transaction_table.session_id ORDER BY DATE DESC`,
      [group_id]
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const GetSessionInfo = async (db: any, session_id: any) => {
  try {
    return await db.getAllAsync(
      `SELECT * FROM session_id_table WHERE session_id = ?`,
      [session_id]
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const GetTransactions = async (db: any) => {
  try {
    return await db.getAllAsync(`SELECT * FROM transaction_table`);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const GetUnsortedTransaction = async (db: any) => {
  try {
    return await db.getAllAsync(
      `SELECT session_id_table.tag_id, session_id_table.session_name, group_id_table.group_name, transaction_table.session_id, session_id_table.date, transaction_table.payer_payee, transaction_table.amount, transaction_table.currency, transaction_table.rate, transaction_table.timeStamp, group_id_table.user_group_id ` +
        `FROM transaction_table JOIN group_id_table ON group_id_table.user_group_id = transaction_table.user_group_id AND transaction_table.payer_payee = 0 JOIN session_id_table ON session_id_table.session_id = transaction_table.session_id ` +
        `ORDER BY session_id_table.date DESC `
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const GetTransactionBySession = async (db: any, session_id: any) => {
  try {
    return await db.getAllAsync(
      `SELECT user_group_id_table.emoji, transaction_table.transaction_id, transaction_table.session_id, transaction_table.payer_payee, user_group_id_table.user_group_name, transaction_table.amount, transaction_table.currency, transaction_table.rate, transaction_table.timeStamp, transaction_table.user_group_id ` +
        `FROM transaction_table JOIN user_group_id_table ON user_group_id_table.user_group_id = transaction_table.user_group_id AND session_id = ? ORDER BY user_group_id_table.user_group_name ASC`,
      [session_id]
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};
