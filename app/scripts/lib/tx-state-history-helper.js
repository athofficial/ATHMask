const jsonDiffer=require('fast-json-patch')
const clone=require('clone')
module.exports={generateHistoryEntry,replayHistory,snapshotFromTxMeta,migrateFromSnapshotsToDiffs,}
function migrateFromSnapshotsToDiffs(longHistory){return(longHistory.map((entry,index)=>{if(index===0)return entry
return generateHistoryEntry(longHistory[index-1],entry)}))}
function generateHistoryEntry(previousState,newState,note){const entry=jsonDiffer.compare(previousState,newState)
if(note&&entry[0])entry[0].note=note
return entry}
function replayHistory(_shortHistory){const shortHistory=clone(_shortHistory)
return shortHistory.reduce((val,entry)=>jsonDiffer.applyPatch(val,entry).newDocument)}
function snapshotFromTxMeta(txMeta){const snapshot=clone(txMeta)
delete snapshot.history
return snapshot}