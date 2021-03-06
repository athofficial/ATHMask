const EventEmitter=require('events').EventEmitter
const async=require('async')
const Dnode=require('dnode')
const EthQuery=require('eth-query')
const launchMetamaskUi=require('../../ui')
const StreamProvider=require('web3-stream-provider')
const setupMultiplex=require('./lib/stream-utils.js').setupMultiplex
module.exports=initializePopup
function initializePopup({container,connectionStream},cb){async.waterfall([(cb)=>connectToAccountManager(connectionStream,cb),(accountManager,cb)=>launchMetamaskUi({container,accountManager},cb),],cb)}
function connectToAccountManager(connectionStream,cb){var mx=setupMultiplex(connectionStream)
setupControllerConnection(mx.createStream('controller'),cb)
setupWeb3Connection(mx.createStream('provider'))}
function setupWeb3Connection(connectionStream){var providerStream=new StreamProvider()
providerStream.pipe(connectionStream).pipe(providerStream)
connectionStream.on('error',console.error.bind(console))
providerStream.on('error',console.error.bind(console))
global.ethereumProvider=providerStream
global.ethQuery=new EthQuery(providerStream)}
function setupControllerConnection(connectionStream,cb){var eventEmitter=new EventEmitter()
var accountManagerDnode=Dnode({sendUpdate:function(state){eventEmitter.emit('update',state)},})
connectionStream.pipe(accountManagerDnode).pipe(connectionStream)
accountManagerDnode.once('remote',function(accountManager){accountManager.on=eventEmitter.on.bind(eventEmitter)
cb(null,accountManager)})}