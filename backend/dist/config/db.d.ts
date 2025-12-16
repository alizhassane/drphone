import sqlite3 from 'sqlite3';
export declare const getDb: () => Promise<import("sqlite").Database<sqlite3.Database, sqlite3.Statement>>;
export declare const query: (text: string, params?: any[]) => Promise<{
    rows: any[];
    rowCount: number;
    lastID?: never;
} | {
    rows: never[];
    rowCount: number | undefined;
    lastID: number | undefined;
}>;
declare const _default: {
    query: (text: string, params?: any[]) => Promise<{
        rows: any[];
        rowCount: number;
        lastID?: never;
    } | {
        rows: never[];
        rowCount: number | undefined;
        lastID: number | undefined;
    }>;
    connect: () => Promise<{
        query: (text: string, params?: any[]) => Promise<{
            rows: any[];
            rowCount: number;
            lastID?: never;
        } | {
            rows: never[];
            rowCount: number | undefined;
            lastID: number | undefined;
        }>;
        release: () => void;
    }>;
};
export default _default;
//# sourceMappingURL=db.d.ts.map