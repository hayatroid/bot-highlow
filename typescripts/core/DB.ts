import { Collection, MongoClient } from 'mongodb';

const [USER, PASSWORD, HOSTNAME, DATABASE] = ['NS_MONGODB_USER', 'NS_MONGODB_PASSWORD', 'NS_MONGODB_HOSTNAME', 'NS_MONGODB_DATABASE']
  .map((key) => process.env[key] ?? (console.error(`${key} is not set.`), process.exit(1)))
  .map(encodeURIComponent);

export interface RunProps<D extends Document> {
  key: string;
  handle: (c: Collection<D>) => Promise<D | null>;
}

export class DB {
  private client: MongoClient;
  constructor() {
    this.client = new MongoClient(`mongodb://${USER}:${PASSWORD}@${HOSTNAME}/${DATABASE}`);
  }
  async run<D extends Document>(props: RunProps<D>) {
    try {
      await this.client.connect();
      const collection = this.client.db().collection<D>(props.key);
      return await props.handle(collection); // DO NOT REPLACE `return await` WITH `return`
    } finally {
      await this.client.close();
    }
  }
}
