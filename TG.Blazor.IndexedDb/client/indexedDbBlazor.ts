///// <reference path="Microsoft.JSInterop.d.ts"/>
import { IDbStore, IIndexSearch, IIndexSpec, IStoreRecord, IStoreSchema, IDotNetInstanceWrapper, IDbInformation } from './InteropInterfaces';
import { openDB, DBSchema, deleteDB, IDBPDatabase, IDBPObjectStore } from 'idb';

export type DB = IDBPDatabase<DBSchema>;

export class IndexedDbManager {

    private dbInstance: DB = undefined as any;
    private dotnetCallback = (message: string) => { };

    constructor() { }

    public openDb = async (data: IDbStore, instanceWrapper: IDotNetInstanceWrapper): Promise<string> => {
        const dbStore = data;
        //just a test for the moment
        this.dotnetCallback = (message: string) => {
            instanceWrapper.instance.invokeMethodAsync(instanceWrapper.methodName, message);
        }

        try {
            if (!this.dbInstance || this.dbInstance.version < dbStore.version) {
                if (this.dbInstance) {
                    this.dbInstance.close();
                }
                this.dbInstance = await openDB(
                    dbStore.dbName,
                    dbStore.version,
                    {
                        upgrade: (db, oldVersion, newVersion, transaction) => {
                            this.upgradeDatabase(db, dbStore, oldVersion, newVersion);
                        }
                    });
            }
        } catch (e) {
            this.dbInstance = await openDB(dbStore.dbName);
        }
        
        return `IndexedDB ${data.dbName} opened`;
    }

    public getDbInfo = async (dbName: string) : Promise<IDbInformation> => {
        if (!this.dbInstance) {
            this.dbInstance = await openDB<DBSchema>(dbName);
        }

        const currentDb = this.dbInstance;

        let getStoreNames = (list: DOMStringList): string[] => {
            let names: string[] = [];
            for (var i = 0; i < list.length; i++) {
                names.push(list[i]);
            }
            return names;
        }
        const dbInfo: IDbInformation = {
            version: currentDb.version,
            storeNames: getStoreNames(currentDb.objectStoreNames)
        };

        return dbInfo;
    }

    public deleteDb = async(dbName: string): Promise<string> => {
        this.dbInstance?.close();

        await deleteDB(dbName);

        this.dbInstance = undefined as any;

        return `The database ${dbName} has been deleted`;
    }

    public addRecord = async (record: IStoreRecord): Promise<string> => {
        const stName = record.storename;
        let itemToSave = record.data;
        const tx = this.getTransaction(this.dbInstance, stName, 'readwrite');
        const objectStore = tx.objectStore(stName as never);

        itemToSave = this.checkForKeyPath(objectStore, itemToSave);

        const result = objectStore.add === undefined 
            ? undefined
            : await objectStore.add(itemToSave, record.key);

        return `Added new record with id ${result}`;
    }

    public updateRecord = async (record: IStoreRecord): Promise<string> => {
        const stName = record.storename;
        const tx = this.getTransaction(this.dbInstance, stName, 'readwrite');
        const objectStore = tx.objectStore(stName as never);

        const result = objectStore.put === undefined
            ? undefined
            : await objectStore.put(record.data, record.key);
       
        return `updated record with id ${result}`;
    }

    public getRecords = async (storeName: string): Promise<any> => {
        const tx = this.getTransaction(this.dbInstance, storeName, 'readonly');

        let results = await tx.objectStore(storeName as never).getAll();

        await tx.done;

        return results;
    }

    public clearStore = async (storeName: string): Promise<string> => {
        
        const tx = this.getTransaction(this.dbInstance, storeName, 'readwrite');
        const objectStore = tx.objectStore(storeName as never);

        if (objectStore.clear !== undefined) {
            await objectStore.clear();
        }
        await tx.done;

        return `Store ${storeName} cleared`;
    }

    public getRecordByIndex = async (searchData: IIndexSearch): Promise<any> => {
        const tx = this.getTransaction(this.dbInstance, searchData.storename, 'readonly');
        const objectStore = tx.objectStore(searchData.storename as never);
        if (!objectStore.indexNames.contains(searchData.indexName as never)) {
            return undefined;
        }
        const results = await objectStore
            .index(searchData.indexName as never)
            .get(searchData.queryValue);

        await tx.done;
        return results;
    }

    public getAllRecordsByIndex = async (searchData: IIndexSearch): Promise<any> => {
        const tx = this.getTransaction(this.dbInstance, searchData.storename, 'readonly');
        let results: any[] = [];

        const objectStore = tx.objectStore(searchData.storename as never);
        let cursor = await objectStore.index(searchData.indexName as never).openCursor();
        while (cursor) {
            if (cursor.key === searchData.queryValue) {
                results.push(cursor.value);
            }
            cursor = await cursor.continue();
        }
        await tx.done;

        return results;
    }

    public getRecordById = async (storename: string, id: any): Promise<any> => {

        const tx = this.getTransaction(this.dbInstance, storename, 'readonly');
        const objectStore = tx.objectStore(storename as never);

        let result = await objectStore.get(id);
        return result;
    }

    public deleteRecord = async (storename: string, id: any): Promise<string> => {
        const tx = this.getTransaction(this.dbInstance, storename, 'readwrite');
        const objectStore = tx.objectStore(storename as never);
        if (objectStore.delete !== undefined) {
            await objectStore.delete(id);
        }

        return `Record with id: ${id} deleted`;
    }

    private getTransaction(dbInstance: DB, stName: string, mode?: 'readonly' | 'readwrite') {
        const tx = dbInstance.transaction(stName as never, mode);
        tx.done.catch(
            err => {
                if (err) {
                    console.error((err as Error).message);
                } else {
                    console.error('Undefined error in getTransaction()');
                }
                
            });

        return tx;
    }

    // Currently don't support aggregate keys
    private checkForKeyPath(objectStore: IDBPObjectStore<DBSchema, [never], never, "readonly" | "readwrite">, data: any) {
        if (!objectStore.autoIncrement || !objectStore.keyPath) {
            return data;
        }

        if (typeof objectStore.keyPath !== 'string') {
            return data;
        }

        const keyPath = objectStore.keyPath as string;

        if (!data[keyPath]) {
            delete data[keyPath];
        }
        return data;
    }

    private upgradeDatabase(upgradeDB: IDBPDatabase<DBSchema>, dbStore: IDbStore, oldVersion: number, newVersion: number | null) {
        if (oldVersion < dbStore.version) {
            if (dbStore.stores) {
                for (var store of dbStore.stores) {
                    if (!upgradeDB.objectStoreNames.contains(store.name as never)) {
                        this.addNewStore(upgradeDB, store);
                        this.dotnetCallback(`store added ${store.name}: db version: ${dbStore.version}`);
                    }
                }
            }
        }
    }

    private addNewStore(upgradeDB: IDBPDatabase<DBSchema>, store: IStoreSchema) {
        let primaryKey = store.primaryKey;

        if (!primaryKey) {
            primaryKey = { name: 'id', keyPath: 'id', auto: true };
        }

        const newStore = upgradeDB.createObjectStore(store.name as never, { keyPath: primaryKey.keyPath, autoIncrement: primaryKey.auto });

        for (var index of store.indexes) {
            newStore.createIndex(index.name as never, index.keyPath, { unique: index.unique });
        }
    }
}