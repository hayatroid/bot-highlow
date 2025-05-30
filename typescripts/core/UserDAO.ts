import { Collection } from 'mongodb';
import { RunProps } from './DB.js';

const KEY = 'highlow-user';

const TEMPLATE: Partial<User> = {
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
  findOneOrInsert(userId: string) {
    return this.build((c) => c.findOneAndUpdate({ userId }, { $setOnInsert: { ...TEMPLATE, userId } }, { upsert: true }));
  }
  findOne(userId: string) {
    return this.build((c) => c.findOne({ userId, deleted: false }));
  }
  findOneAndDelete(userId: string) {
    return this.build((c) => c.findOneAndUpdate({ userId, deleted: false }, { $set: { deleted: true } }));
  }
  findOneAndAdd(userId: string, rhs: number) {
    return this.build((c) => c.findOneAndUpdate({ userId, deleted: false, balance: { $gte: -rhs } }, { $inc: { balance: rhs } }));
  }
  findOneAndRestore(userId: string) {
    return this.build((c) => c.findOneAndUpdate({ userId, deleted: true }, { $set: { deleted: false } }));
  }
  findOneAndForceDelete(userId: string) {
    return this.build((c) => c.findOneAndDelete({ userId, deleted: true }));
  }
}
