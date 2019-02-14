module.exports=setupDappAutoReload
function setupDappAutoReload(web3,observable){let hasBeenWarned=!1
let reloadInProgress=!1
let lastTimeUsed
let lastSeenNetwork
global.web3=new Proxy(web3,{get:(_web3,key)=>{if(!hasBeenWarned&&key!=='currentProvider'){console.warn('MetaMask: web3 will be deprecated in the near future in favor of the ethereumProvider \nhttps://github.com/MetaMask/faq/blob/master/detecting_metamask.md#web3-deprecation')
hasBeenWarned=!0}
lastTimeUsed=Date.now()
return _web3[key]},set:(_web3,key,value)=>{_web3[key]=value},})
observable.subscribe(function(state){if(reloadInProgress)return
const currentNetwork=state.networkVersion
if(!lastSeenNetwork){lastSeenNetwork=currentNetwork
return}
if(!lastTimeUsed)return
if(currentNetwork===lastSeenNetwork)return
reloadInProgress=!0
const timeSinceUse=Date.now()-lastTimeUsed
if(timeSinceUse>500){triggerReset()}else{setTimeout(triggerReset,500)}})}
function triggerReset(){global.location.reload()}