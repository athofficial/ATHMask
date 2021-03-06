const pump=require('pump')
const RpcEngine=require('json-rpc-engine')
const createIdRemapMiddleware=require('json-rpc-engine/src/idRemapMiddleware')
const createStreamMiddleware=require('json-rpc-middleware-stream')
const LocalStorageStore=require('obs-store')
const asStream=require('obs-store/lib/asStream')
const ObjectMultiplex=require('obj-multiplex')
module.exports=MetamaskInpageProvider
function MetamaskInpageProvider(connectionStream){const self=this
const mux=self.mux=new ObjectMultiplex()
pump(connectionStream,mux,connectionStream,(err)=>logStreamDisconnectWarning('MetaMask',err))
self.publicConfigStore=new LocalStorageStore({storageKey:'MetaMask-Config'})
pump(mux.createStream('publicConfig'),asStream(self.publicConfigStore),(err)=>logStreamDisconnectWarning('MetaMask PublicConfigStore',err))
mux.ignoreStream('phishing')
const streamMiddleware=createStreamMiddleware()
pump(streamMiddleware.stream,mux.createStream('provider'),streamMiddleware.stream,(err)=>logStreamDisconnectWarning('MetaMask RpcProvider',err))
const rpcEngine=new RpcEngine()
rpcEngine.push(createIdRemapMiddleware())
rpcEngine.push(streamMiddleware)
self.rpcEngine=rpcEngine}
MetamaskInpageProvider.prototype.sendAsync=function(payload,cb){const self=this
self.rpcEngine.handle(payload,cb)}
MetamaskInpageProvider.prototype.send=function(payload){const self=this
let selectedAddress
let result=null
switch(payload.method){case 'eth_accounts':selectedAddress=self.publicConfigStore.getState().selectedAddress
result=selectedAddress?[selectedAddress]:[]
break
case 'eth_coinbase':selectedAddress=self.publicConfigStore.getState().selectedAddress
result=selectedAddress||null
break
case 'eth_uninstallFilter':self.sendAsync(payload,noop)
result=!0
break
case 'net_version':const networkVersion=self.publicConfigStore.getState().networkVersion
result=networkVersion||null
break
default:var link='https://github.com/MetaMask/faq/blob/master/DEVELOPERS.md#dizzy-all-async---think-of-metamask-as-a-light-client'
var message=`The MetaMask Web3 object does not support synchronous methods like ${payload.method} without a callback parameter. See ${link} for details.`
throw new Error(message)}
return{id:payload.id,jsonrpc:payload.jsonrpc,result:result,}}
MetamaskInpageProvider.prototype.isConnected=function(){return!0}
MetamaskInpageProvider.prototype.isMetaMask=!0
function logStreamDisconnectWarning(remoteLabel,err){let warningMsg=`MetamaskInpageProvider - lost connection to ${remoteLabel}`
if(err)warningMsg+='\n'+err.stack
console.warn(warningMsg)}
function noop(){}