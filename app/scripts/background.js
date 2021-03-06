const urlUtil=require('url')
const endOfStream=require('end-of-stream')
const pump=require('pump')
const log=require('loglevel')
const extension=require('extensionizer')
const LocalStorageStore=require('obs-store/lib/localStorage')
const storeTransform=require('obs-store/lib/transform')
const asStream=require('obs-store/lib/asStream')
const ExtensionPlatform=require('./platforms/extension')
const Migrator=require('./lib/migrator/')
const migrations=require('./migrations/')
const PortStream=require('./lib/port-stream.js')
const NotificationManager=require('./lib/notification-manager.js')
const MetamaskController=require('./metamask-controller')
const firstTimeState=require('./first-time-state')
const STORAGE_KEY='metamask-config'
const METAMASK_DEBUG='GULP_METAMASK_DEBUG'
window.log=log
log.setDefaultLevel(METAMASK_DEBUG?'debug':'warn')
const platform=new ExtensionPlatform()
const notificationManager=new NotificationManager()
global.METAMASK_NOTIFIER=notificationManager
let popupIsOpen=!1
const diskStore=new LocalStorageStore({storageKey:STORAGE_KEY})
initialize().catch(log.error)
async function initialize(){const initState=await loadStateFromPersistence()
await setupController(initState)
log.debug('MetaMask initialization complete.')}
async function loadStateFromPersistence(){const migrator=new Migrator({migrations})
let versionedData=diskStore.getState()||migrator.generateInitialState(firstTimeState)
versionedData=await migrator.migrateData(versionedData)
diskStore.putState(versionedData)
return versionedData.data}
function setupController(initState){const controller=new MetamaskController({showUnconfirmedMessage:triggerUi,unlockAccountMessage:triggerUi,showUnapprovedTx:triggerUi,initState,platform,})
global.metamaskController=controller
pump(asStream(controller.store),storeTransform(versionifyData),asStream(diskStore))
function versionifyData(state){const versionedData=diskStore.getState()
versionedData.data=state
return versionedData}
extension.runtime.onConnect.addListener(connectRemote)
function connectRemote(remotePort){const isMetaMaskInternalProcess=remotePort.name==='popup'||remotePort.name==='notification'
const portStream=new PortStream(remotePort)
if(isMetaMaskInternalProcess){popupIsOpen=popupIsOpen||(remotePort.name==='popup')
controller.setupTrustedCommunication(portStream,'MetaMask')
if(remotePort.name==='popup'){endOfStream(portStream,()=>{popupIsOpen=!1})}}else{const originDomain=urlUtil.parse(remotePort.sender.url).hostname
controller.setupUntrustedCommunication(portStream,originDomain)}}
updateBadge()
controller.txController.on('update:badge',updateBadge)
controller.messageManager.on('updateBadge',updateBadge)
controller.personalMessageManager.on('updateBadge',updateBadge)
function updateBadge(){var label=''
var unapprovedTxCount=controller.txController.getUnapprovedTxCount()
var unapprovedMsgCount=controller.messageManager.unapprovedMsgCount
var unapprovedPersonalMsgs=controller.personalMessageManager.unapprovedPersonalMsgCount
var unapprovedTypedMsgs=controller.typedMessageManager.unapprovedTypedMessagesCount
var count=unapprovedTxCount+unapprovedMsgCount+unapprovedPersonalMsgs+unapprovedTypedMsgs
if(count){label=String(count)}
extension.browserAction.setBadgeText({text:label})
extension.browserAction.setBadgeBackgroundColor({color:'#506F8B'})}
return Promise.resolve()}
function triggerUi(){if(!popupIsOpen)notificationManager.showPopup()}
extension.runtime.onInstalled.addListener(function(details){if((details.reason==='install')&&(!METAMASK_DEBUG)){extension.tabs.create({url:'https://atheios.com/'})}})