declare class WeaveDB {
  constructor(options: { contractTxId: string; nocache?: boolean });
  init(): Promise<void>;
  createTempAddress(address: string): Promise<any>;
  getAddressLink(address: string): Promise<any>;
  add(data: any, collection_name: string, user?: string): Promise<any>;
  get<T>(...args: Parameters<GetFunction>): Promise<T>;
  cget<T>(...args: Parameters<GetFunction>): Promise<
    {
      id: string;
      data: T;
      setter: string;
      block: {
        height: number;
        timestamp: number;
      };
    }[]
  >;
  createTempAddress(address: string | null, expiry?: number): Promise<{ identity: any }>;  //changed to add expiry
  delete(collection_name: string, doc_id: string, user?: IUser): Promise<any>;
  update<T>(
    data: T,
    collection_name: string,
    doc_id: string,
    user?: IUser
  ): Promise<any>;
}

type IUser = {
  wallet: NullableValue<`0x${string}`>;
  privateKey: NullableValue<string>;
};

type CollectionQuery = string | [string, ...string[]];
type QueryParameter = [string, any];

type GetFunction = {
  (collectionName: string): void;
  (collectionName: string, docId: string): void;
  (
    collectionName: string,
    ...query: (string | QueryParameter | CollectionQuery)[]
  ): void;
};

export default WeaveDB;