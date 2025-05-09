import { Response, Robot } from 'hubot';
import { DB } from './core/DB.js';
import { UserDAO } from './core/UserDAO.js';
import { isAdmin } from './core/consts.js';

const db = new DB();
const userDAO = new UserDAO();

export default async (robot: Robot) => {
  robot.hear(/\/join$/, async (res: Response) => {
    const userId = res.message.user.id;
    if (!(await db.run(userDAO.create(userId)))) {
      res.send('参加しました！');
    } else if (await db.run(userDAO.restore(userId))) {
      res.send('お久しぶりです！');
    } else {
      res.send('参加済みです。');
    }
  });
  robot.hear(/\/show$/, async (res: Response) => {
    const userId = res.message.user.id;
    const user = await db.run(userDAO.get(userId));
    if (user) {
      res.send(`${user.balance} 円です。`);
    } else {
      res.send('参加してください');
    }
  });
  robot.hear(/\/work$/, async (res: Response) => {
    const userId = res.message.user.id;
    const updated = await db.run(userDAO.checkedAdd(userId, -400_000));
    if (updated) {
      res.send(`${updated.balance - 400_000} 円になりました。`);
    } else {
      res.send('所持金が足りません。');
    }
  });
  robot.hear(/\/leave$/, async (res: Response) => {
    const userId = res.message.user.id;
    if (await db.run(userDAO.delete(userId))) {
      res.send('退会しました。');
    } else {
      res.send('参加してください。');
    }
  });
  robot.hear(/\/force-leave$/, async (res: Response) => {
    const userId = res.message.user.id;
    if (!isAdmin(userId)) {
      res.send('権限がありません。');
    } else if (await db.run(userDAO.forceDelete(userId))) {
      res.send('削除しました。');
    } else {
      res.send('データがありません。');
    }
  });
};
