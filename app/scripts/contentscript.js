const fs=require('fs')
const path=require('path')
const pump=require('pump')
const LocalMessageDuplexStream=require('post-message-stream')
const PongStream=require('ping-pong-stream/pong')
const ObjectMultiplex=require('obj-multiplex')
const extension=require('extensionizer')
const PortStream=require('./lib/port-stream.js')
const inpageContent=fs.readFileSync(path.join(__dirname,'..','..','dist','chrome','scripts','inpage.js')).toString()
const inpageSuffix='//# sourceURL='+extension.extension.getURL('scripts/inpage.js')+'\n'
const inpageBundle=inpageContent+inpageSuffix
if(shouldInjectWeb3()){setupInjection()
setupStreams()}
function setupInjection(){try{var scriptTag=document.createElement('script')
scriptTag.textContent=inpageBundle
scriptTag.onload=function(){this.parentNode.removeChild(this)}
var container=document.head||document.documentElement
container.insertBefore(scriptTag,container.children[0])}catch(e){console.error('Metamask injection failed.',e)}}
function setupStreams(){const pageStream=new LocalMessageDuplexStream({name:'contentscript',target:'inpage',})
const pluginPort=extension.runtime.connect({name:'contentscript'})
const pluginStream=new PortStream(pluginPort)
pump(pageStream,pluginStream,pageStream,(err)=>logStreamDisconnectWarning('MetaMask Contentscript Forwarding',err))
const mux=new ObjectMultiplex()
mux.setMaxListeners(25)
pump(mux,pageStream,mux,(err)=>logStreamDisconnectWarning('MetaMask Inpage',err))
pump(mux,pluginStream,mux,(err)=>logStreamDisconnectWarning('MetaMask Background',err))
const pongStream=new PongStream({objectMode:!0})
pump(mux,pongStream,mux,(err)=>logStreamDisconnectWarning('MetaMask PingPongStream',err))
const phishingStream=mux.createStream('phishing')
phishingStream.once('data',redirectToPhishingWarning)
mux.ignoreStream('provider')
mux.ignoreStream('publicConfig')}
function logStreamDisconnectWarning(remoteLabel,err){let warningMsg=`MetamaskContentscript - lost connection to ${remoteLabel}`
if(err)warningMsg+='\n'+err.stack
console.warn(warningMsg)}
function shouldInjectWeb3(){return doctypeCheck()&&suffixCheck()&&documentElementCheck()}
function doctypeCheck(){const doctype=window.document.doctype
if(doctype){return doctype.name==='html'}else{return!0}}
function suffixCheck(){var prohibitedTypes=['xml','pdf']
var currentUrl=window.location.href
var currentRegex
for(let i=0;i<prohibitedTypes.length;i++){currentRegex=new RegExp(`\\.${prohibitedTypes[i]}$`)
if(currentRegex.test(currentUrl)){return!1}}
return!0}
function documentElementCheck(){var documentElement=document.documentElement.nodeName
if(documentElement){return documentElement.toLowerCase()==='html'}
return!0}
function redirectToPhishingWarning(){console.log('MetaMask - redirecting to phishing warning')
window.location.href='https://metamask.io/phishing.html'}