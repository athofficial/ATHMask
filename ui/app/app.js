const inherits=require('util').inherits
const Component=require('react').Component
const connect=require('react-redux').connect
const h=require('react-hyperscript')
const actions=require('./actions')
const MascaraFirstTime=require('../../mascara/src/app/first-time').default
const MascaraBuyEtherScreen=require('../../mascara/src/app/first-time/buy-ether-screen').default
const InitializeMenuScreen=require('./first-time/init-menu')
const NewKeyChainScreen=require('./new-keychain')
const UnlockScreen=require('./unlock')
const AccountDetailScreen=require('./account-detail')
const SendTransactionScreen=require('./send')
const ConfirmTxScreen=require('./conf-tx')
const NoticeScreen=require('./components/notice')
const generateLostAccountsNotice=require('../lib/lost-accounts-notice')
const ConfigScreen=require('./config')
const AddTokenScreen=require('./add-token')
const Import=require('./accounts/import')
const InfoScreen=require('./info')
const Loading=require('./components/loading')
const SandwichExpando=require('sandwich-expando')
const Dropdown=require('./components/dropdown').Dropdown
const DropdownMenuItem=require('./components/dropdown').DropdownMenuItem
const NetworkIndicator=require('./components/network')
const BuyView=require('./components/buy-button-subview')
const QrView=require('./components/qr-code')
const HDCreateVaultComplete=require('./keychains/hd/create-vault-complete')
const HDRestoreVaultScreen=require('./keychains/hd/restore-vault')
const RevealSeedConfirmation=require('./keychains/hd/recover-seed/confirmation')
const AccountDropdowns=require('./components/account-dropdowns').AccountDropdowns
module.exports=connect(mapStateToProps)(App)
inherits(App,Component)
function App(){Component.call(this)}
function mapStateToProps(state){const{identities,accounts,address,keyrings,isInitialized,noActiveNotices,seedWords,}=state.metamask
const selected=address||Object.keys(accounts)[0]
return{isLoading:state.appState.isLoading,loadingMessage:state.appState.loadingMessage,noActiveNotices:state.metamask.noActiveNotices,isInitialized:state.metamask.isInitialized,isUnlocked:state.metamask.isUnlocked,currentView:state.appState.currentView,activeAddress:state.appState.activeAddress,transForward:state.appState.transForward,isMascara:state.metamask.isMascara,isOnboarding:Boolean(!noActiveNotices||seedWords||!isInitialized),seedWords:state.metamask.seedWords,unapprovedTxs:state.metamask.unapprovedTxs,unapprovedMsgs:state.metamask.unapprovedMsgs,menuOpen:state.appState.menuOpen,network:state.metamask.network,provider:state.metamask.provider,forgottenPassword:state.appState.forgottenPassword,lastUnreadNotice:state.metamask.lastUnreadNotice,lostAccounts:state.metamask.lostAccounts,frequentRpcList:state.metamask.frequentRpcList||[],identities,selected,keyrings,}}
App.prototype.render=function(){var props=this.props
const{isLoading,loadingMessage,transForward,network}=props
const isLoadingNetwork=network==='loading'&&props.currentView.name!=='config'
const loadMessage=loadingMessage||isLoadingNetwork?`Connecting to ${this.getNetworkName()}`:null
log.debug('Main ui render function')
return h('.flex-column.full-height',{style:{overflow:'hidden',position:'relative',alignItems:'center',},},[this.renderAppBar(),this.renderNetworkDropdown(),this.renderDropdown(),this.renderLoadingIndicator({isLoading,isLoadingNetwork,loadMessage}),h('.app-primary'+(transForward?'.from-right':'.from-left'),{style:{width:'100%',},},[this.renderPrimary()]),])}
App.prototype.renderAppBar=function(){if(window.METAMASK_UI_TYPE==='notification'){return null}
const props=this.props
const state=this.state||{}
const isNetworkMenuOpen=state.isNetworkMenuOpen||!1
const{isMascara,isOnboarding}=props
if(isMascara&&isOnboarding){return null}
if(isMascara&&props.currentView.name==='buyEth'){return null}
return h('.full-width',{height:'38px'},[h('.app-header.flex-row.flex-space-between',{style:{alignItems:'center',visibility:props.isUnlocked?'visible':'none',background:props.isUnlocked?'white':'none',height:'38px',position:'relative',zIndex:12,},},[h('div.left-menu-section',{style:{display:'flex',flexDirection:'row',alignItems:'center',},},[h('img',{height:24,width:24,src:'/images/icon-32.png',}),h(NetworkIndicator,{network:this.props.network,provider:this.props.provider,onClick:event=>{event.preventDefault()
event.stopPropagation()
this.setState({isNetworkMenuOpen:!isNetworkMenuOpen})},}),]),props.isUnlocked&&h('h1',{style:{position:'relative',left:'9px',},},'ATHMask'),props.isUnlocked&&h('div',{style:{display:'flex',flexDirection:'row',alignItems:'center',},},[props.isUnlocked&&h(AccountDropdowns,{style:{},enableAccountsSelector:!0,identities:this.props.identities,selected:this.props.currentView.context,network:this.props.network,keyrings:this.props.keyrings,},[]),props.isUnlocked&&h(SandwichExpando,{className:'sandwich-expando',width:16,barHeight:2,padding:0,isOpen:state.isMainMenuOpen,color:'#0099ff',onClick:()=>{this.setState({isMainMenuOpen:!state.isMainMenuOpen,})},}),]),]),])}
App.prototype.renderNetworkDropdown=function(){const props=this.props
const{provider:{type:providerType,rpcTarget:activeNetwork}}=props
const rpcList=props.frequentRpcList
const state=this.state||{}
const isOpen=state.isNetworkMenuOpen
return h(Dropdown,{useCssTransition:!0,isOpen,onClickOutside:event=>{const{classList}=event.target
const isNotToggleElement=[classList.contains('menu-icon'),classList.contains('network-name'),classList.contains('network-indicator'),].filter(bool=>bool).length===0
if(isNotToggleElement){this.setState({isNetworkMenuOpen:!1})}},zIndex:11,style:{position:'absolute',left:'2px',top:'36px',},innerStyle:{padding:'2px 16px 2px 0px',},},[h(DropdownMenuItem,{key:'atheios',closeMenu:()=>this.setState({isNetworkMenuOpen:!isOpen}),onClick:()=>props.dispatch(actions.setProviderType('atheios')),style:{fontSize:'18px',},},[h('.menu-icon.diamond'),'Main Atheios Network',providerType==='atheios'?h('.check','✓'):null,]),h(DropdownMenuItem,{key:'default',closeMenu:()=>this.setState({isNetworkMenuOpen:!isOpen}),onClick:()=>props.dispatch(actions.setDefaultRpcTarget()),style:{fontSize:'14px',},},[h('i.fa.fa-question-circle.fa-lg.menu-icon'),'Localhost 8696',activeNetwork==='http://localhost:8696'?h('.check','✓'):null,]),this.renderCustomOption(props.provider),this.renderCommonRpc(rpcList,props.provider),h(DropdownMenuItem,{closeMenu:()=>this.setState({isNetworkMenuOpen:!isOpen}),onClick:()=>this.props.dispatch(actions.showConfigPage()),style:{fontSize:'18px',},},[h('i.fa.fa-question-circle.fa-lg.menu-icon'),'Custom RPC',activeNetwork==='custom'?h('.check','✓'):null,]),])}
App.prototype.renderDropdown=function(){const state=this.state||{}
const isOpen=state.isMainMenuOpen
return h(Dropdown,{useCssTransition:!0,isOpen:isOpen,zIndex:11,onClickOutside:event=>{const classList=event.target.classList
const parentClassList=event.target.parentElement.classList
const isToggleElement=classList.contains('sandwich-expando')||parentClassList.contains('sandwich-expando')
if(isOpen&&!isToggleElement){this.setState({isMainMenuOpen:!1})}},style:{position:'absolute',right:'2px',top:'38px',},innerStyle:{},},[h(DropdownMenuItem,{closeMenu:()=>this.setState({isMainMenuOpen:!isOpen}),onClick:()=>{this.props.dispatch(actions.showConfigPage())},},'Settings'),h(DropdownMenuItem,{closeMenu:()=>this.setState({isMainMenuOpen:!isOpen}),onClick:()=>{this.props.dispatch(actions.lockMetamask())},},'Lock'),h(DropdownMenuItem,{closeMenu:()=>this.setState({isMainMenuOpen:!isOpen}),onClick:()=>{this.props.dispatch(actions.showInfoPage())},},'Info/Help')])}
App.prototype.renderLoadingIndicator=function({isLoading,isLoadingNetwork,loadMessage}){const{isMascara}=this.props
return isMascara?null:h(Loading,{isLoading:isLoading||isLoadingNetwork,loadingMessage:loadMessage,})}
App.prototype.renderBackButton=function(style,justArrow=!1){var props=this.props
return h('.flex-row',{key:'leftArrow',style:style,onClick:()=>props.dispatch(actions.goBackToInitView())},[h('i.fa.fa-arrow-left.cursor-pointer'),justArrow?null:h('div.cursor-pointer',{style:{marginLeft:'3px'},onClick:()=>props.dispatch(actions.goBackToInitView())},'BACK')])}
App.prototype.renderPrimary=function(){log.debug('rendering primary')
var props=this.props
const{isMascara,isOnboarding}=props
if(isMascara&&isOnboarding){return h(MascaraFirstTime)}
if(!props.noActiveNotices){log.debug('rendering notice screen for unread notices.')
return h(NoticeScreen,{notice:props.lastUnreadNotice,key:'NoticeScreen',onConfirm:()=>props.dispatch(actions.markNoticeRead(props.lastUnreadNotice)),})}else if(props.lostAccounts&&props.lostAccounts.length>0){log.debug('rendering notice screen for lost accounts view.')
return h(NoticeScreen,{notice:generateLostAccountsNotice(props.lostAccounts),key:'LostAccountsNotice',onConfirm:()=>props.dispatch(actions.markAccountsFound()),})}
if(!props.isInitialized||props.forgottenPassword){log.debug('rendering an initialize screen')
switch(props.currentView.name){case 'restoreVault':log.debug('rendering restore vault screen')
return h(HDRestoreVaultScreen,{key:'HDRestoreVaultScreen'})
default:log.debug('rendering menu screen')
return h(InitializeMenuScreen,{key:'menuScreenInit'})}}
if(!props.isUnlocked){switch(props.currentView.name){case 'restoreVault':log.debug('rendering restore vault screen')
return h(HDRestoreVaultScreen,{key:'HDRestoreVaultScreen'})
case 'config':log.debug('rendering config screen from unlock screen.')
return h(ConfigScreen,{key:'config'})
default:log.debug('rendering locked screen')
return h(UnlockScreen,{key:'locked'})}}
if(props.seedWords){log.debug('rendering seed words')
return h(HDCreateVaultComplete,{key:'HDCreateVaultComplete'})}
switch(props.currentView.name){case 'accountDetail':log.debug('rendering account detail screen')
return h(AccountDetailScreen,{key:'account-detail'})
case 'sendTransaction':log.debug('rendering send tx screen')
return h(SendTransactionScreen,{key:'send-transaction'})
case 'newKeychain':log.debug('rendering new keychain screen')
return h(NewKeyChainScreen,{key:'new-keychain'})
case 'confTx':log.debug('rendering confirm tx screen')
return h(ConfirmTxScreen,{key:'confirm-tx'})
case 'add-token':log.debug('rendering add-token screen from unlock screen.')
return h(AddTokenScreen,{key:'add-token'})
case 'config':log.debug('rendering config screen')
return h(ConfigScreen,{key:'config'})
case 'import-menu':log.debug('rendering import screen')
return h(Import,{key:'import-menu'})
case 'reveal-seed-conf':log.debug('rendering reveal seed confirmation screen')
return h(RevealSeedConfirmation,{key:'reveal-seed-conf'})
case 'info':log.debug('rendering info screen')
return h(InfoScreen,{key:'info'})
case 'buyEth':log.debug('rendering buy ether screen')
return h(BuyView,{key:'buyEthView'})
case 'onboardingBuyEth':log.debug('rendering onboarding buy ether screen')
return h(MascaraBuyEtherScreen,{key:'buyEthView'})
case 'qr':log.debug('rendering show qr screen')
return h('div',{style:{position:'absolute',height:'100%',top:'0px',left:'0px',},},[h('i.fa.fa-arrow-left.fa-lg.cursor-pointer.color-orange',{onClick:()=>props.dispatch(actions.backToAccountDetail(props.activeAddress)),style:{marginLeft:'10px',marginTop:'50px',},}),h('div',{style:{position:'absolute',left:'44px',width:'285px',},},[h(QrView,{key:'qr'})]),])
default:log.debug('rendering default, account detail screen')
return h(AccountDetailScreen,{key:'account-detail'})}}
App.prototype.toggleMetamaskActive=function(){if(!this.props.isUnlocked){var passwordBox=document.querySelector('input[type=password]')
if(!passwordBox)return
passwordBox.focus()}else{this.props.dispatch(actions.lockMetamask(!1))}}
App.prototype.renderCustomOption=function(provider){const{rpcTarget,type}=provider
const props=this.props
if(type!=='rpc')return null
let label=rpcTarget
if(rpcTarget.length>31){label=label.substr(0,34)+'...'}
switch(rpcTarget){case 'http://localhost:8696':return null
default:return h(DropdownMenuItem,{key:rpcTarget,onClick:()=>props.dispatch(actions.setRpcTarget(rpcTarget)),closeMenu:()=>this.setState({isNetworkMenuOpen:!1}),},[h('i.fa.fa-question-circle.fa-lg.menu-icon'),label,h('.check','✓')])}}
App.prototype.getNetworkName=function(){const{provider}=this.props
const providerName=provider.type
let name
if(providerName==='mainnet'){name='Main Ethereum Network'}else if(providerName==='classic'){name='Main Ethereum Classic Network'}else if(providerName==='callisto'){name='Main Callisto Network'}else if(providerName==='ubiq'){name='Main UBIQ Network'}else if(providerName==='atheios'){name='Main Atheios Network'}else if(providerName==='social'){name='Main Ethereum Social Network'}else if(providerName==='ropsten'){name='Ropsten Test Network'}else if(providerName==='kovan'){name='Kovan Test Network'}else if(providerName==='rinkeby'){name='Rinkeby Test Network'}else{name='Unknown Private Network'}
return name}
App.prototype.renderCommonRpc=function(rpcList,provider){const props=this.props
const rpcTarget=provider.rpcTarget
return rpcList.map(rpc=>{if(rpc==='http://localhost:8696'||rpc===rpcTarget){return null}else{return h(DropdownMenuItem,{key:`common${rpc}`,closeMenu:()=>this.setState({isNetworkMenuOpen:!1}),onClick:()=>props.dispatch(actions.setRpcTarget(rpc)),},[h('i.fa.fa-question-circle.fa-lg.menu-icon'),rpc,rpcTarget===rpc?h('.check','✓'):null,])}})}