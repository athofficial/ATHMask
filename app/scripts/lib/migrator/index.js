class Migrator{constructor(opts={}){const migrations=opts.migrations||[]
this.migrations=migrations.sort((a,b)=>a.version-b.version)
const lastMigration=this.migrations.slice(-1)[0]
this.defaultVersion=opts.defaultVersion||(lastMigration&&lastMigration.version)||0}
async migrateData(versionedData=this.generateInitialState()){const pendingMigrations=this.migrations.filter(migrationIsPending)
for(const index in pendingMigrations){const migration=pendingMigrations[index]
versionedData=await migration.migrate(versionedData)
if(!versionedData.data)throw new Error('Migrator - migration returned empty data')
if(versionedData.version!==undefined&&versionedData.meta.version!==migration.version)throw new Error('Migrator - Migration did not update version number correctly')}
return versionedData
function migrationIsPending(migration){return migration.version>versionedData.meta.version}}
generateInitialState(initState){return{meta:{version:this.defaultVersion,},data:initState,}}}
module.exports=Migrator