import { Collection, MatchKeysAndValues } from 'mongodb';
import { RunProps } from './DB.js';

const KEY = 'highlow-user';
const TEMPLATE: MatchKeysAndValues<User> = {
  userId: '550e8400-e29b-41d4-a716-446655440000',
  balance: 1_000_000,
  deleted: false,
};

interface User extends Document {
  userId: string;
  balance: number;
  deleted: boolean;
}

export class UserDAO {
  private build(handle: (c: Collection<User>) => Promise<User | null>): RunProps<User> {
    return { key: KEY, handle };
  }
  create(userId: string) {
    return this.build((c) => c.findOneAndUpdate({ userId }, { $setOnInsert: { ...TEMPLATE, userId } }, { upsert: true, returnDocument: 'after' }));
  }
  get(userId: string) {
    return this.build((c) => c.findOne({ userId, deleted: false }));
  }
  delete(userId: string) {
    return this.build((c) => c.findOneAndUpdate({ userId, deleted: false }, { $set: { deleted: true } }, { returnDocument: 'after' }));
  }
  forceDelete(userId: string) {
    return this.build((c) => c.findOneAndDelete({ userId }));
  }
  restore(userId: string) {
    return this.build((c) => c.findOneAndUpdate({ userId, deleted: true }, { $set: { deleted: false } }, { returnDocument: 'after' }));
  }
  checkedAdd(userId: string, rhs: number) {
    return this.build((c) => c.findOneAndUpdate({ userId, balance: { $gte: -rhs } }, { $inc: { balance: rhs } }, { returnDocument: 'after' }));
  }
}
