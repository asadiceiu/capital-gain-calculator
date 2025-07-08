declare module 'sql.js' {
  export interface SqlJsStatic {
    Database: new (data?: Uint8Array) => any;
    // You can expand this type later as needed
  }

  const initSqlJs: (config?: {
    locateFile?: (file: string) => string;
  }) => Promise<SqlJsStatic>;

  export default initSqlJs;
}