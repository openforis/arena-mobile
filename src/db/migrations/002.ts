export const migration_002 = async (dbClient: any) => {
  await dbClient.transaction(async () => {
    await dbClient.executeSql(`ALTER TABLE record ADD COLUMN summary1 TEXT;`);
    await dbClient.executeSql(`ALTER TABLE record ADD COLUMN summary2 TEXT;`);
    await dbClient.executeSql(`ALTER TABLE record ADD COLUMN summary3 TEXT;`);
    await dbClient.executeSql(`ALTER TABLE record ADD COLUMN summary4 TEXT;`);
    await dbClient.executeSql(`ALTER TABLE record ADD COLUMN summary5 TEXT;`);
  });
};
