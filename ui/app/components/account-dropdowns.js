const Component=require('react').Component
const PropTypes=require('react').PropTypes
const h=require('react-hyperscript')
const actions=require('../actions')
const genAccountLink=require('etherscan-link').createAccountLink
const connect=require('react-redux').connect
const Dropdown=require('./dropdown').Dropdown
const DropdownMenuItem=require('./dropdown').DropdownMenuItem
const Identicon=require('./identicon')
const ethUtil=require('ethereumjs-util')
const copyToClipboard=require('copy-to-clipboard')
class AccountDropdowns extends Component{constructor(props){super(props)
this.state={accountSelectorActive:!1,optionsMenuActive:!1,}
this.accountSelectorToggleClassName='accounts-selector'
this.optionsMenuToggleClassName='fa-ellipsis-h'}
renderAccounts(){const{identities,selected,keyrings}=this.props
return Object.keys(identities).map((key,index)=>{const identity=identities[key]
const isSelected=identity.address===selected
const simpleAddress=identity.address.substring(2).toLowerCase()
const keyring=keyrings.find((kr)=>{return kr.accounts.includes(simpleAddress)||kr.accounts.includes(identity.address)})
return h(DropdownMenuItem,{closeMenu:()=>{},onClick:()=>{this.props.actions.showAccountDetail(identity.address)},style:{marginTop:index===0?'5px':'',fontSize:'24px',},},[h(Identicon,{address:identity.address,diameter:32,style:{marginLeft:'10px',},},),this.indicateIfLoose(keyring),h('span',{style:{marginLeft:'20px',fontSize:'24px',maxWidth:'145px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',},},identity.name||''),h('span',{style:{marginLeft:'20px',fontSize:'24px'}},isSelected?h('.check','✓'):null),])})}
indicateIfLoose(keyring){try{const type=keyring.type
const isLoose=type!=='HD Key Tree'
return isLoose?h('.keyring-label','LOOSE'):null}catch(e){return}}
renderAccountSelector(){const{actions}=this.props
const{accountSelectorActive}=this.state
return h(Dropdown,{useCssTransition:!0,style:{marginLeft:'-238px',marginTop:'38px',minWidth:'180px',overflowY:'auto',maxHeight:'300px',width:'300px',},innerStyle:{padding:'8px 25px',},isOpen:accountSelectorActive,onClickOutside:(event)=>{const{classList}=event.target
const isNotToggleElement=!classList.contains(this.accountSelectorToggleClassName)
if(accountSelectorActive&&isNotToggleElement){this.setState({accountSelectorActive:!1})}},},[...this.renderAccounts(),h(DropdownMenuItem,{closeMenu:()=>{},onClick:()=>actions.addNewAccount(),},[h(Identicon,{style:{marginLeft:'10px',},diameter:32,},),h('span',{style:{marginLeft:'20px',fontSize:'24px'}},'Create Account'),],),h(DropdownMenuItem,{closeMenu:()=>{},onClick:()=>actions.showImportPage(),},[h(Identicon,{style:{marginLeft:'10px',},diameter:32,},),h('span',{style:{marginLeft:'20px',fontSize:'24px',marginBottom:'5px',},},'Import Account'),]),])}
renderAccountOptions(){const{actions,network}=this.props
const{optionsMenuActive}=this.state
let blockExplorerName='Explorer'
if(network===61){blockExplorerName='Gastracker'}
return h(Dropdown,{style:{marginLeft:'-215px',minWidth:'180px',},isOpen:optionsMenuActive,onClickOutside:()=>{const{classList}=event.target
const isNotToggleElement=!classList.contains(this.optionsMenuToggleClassName)
if(optionsMenuActive&&isNotToggleElement){this.setState({optionsMenuActive:!1})}},},[h(DropdownMenuItem,{closeMenu:()=>{},onClick:()=>{const{selected,identities}=this.props
var identity=identities[selected]
actions.showQrView(selected,identity?identity.name:'')},},'Show QR Code',),h(DropdownMenuItem,{closeMenu:()=>{},onClick:()=>{const{selected}=this.props
const checkSumAddress=selected&&ethUtil.toChecksumAddress(selected)
copyToClipboard(checkSumAddress)},},'Copy Address to clipboard',),h(DropdownMenuItem,{closeMenu:()=>{},onClick:()=>{actions.requestAccountExport()},},'Export Private Key',),])}
render(){const{style,enableAccountsSelector,enableAccountOptions}=this.props
const{optionsMenuActive,accountSelectorActive}=this.state
return h('span',{style:style,},[enableAccountsSelector&&h('div.cursor-pointer.color-orange.accounts-selector',{style:{background:'url(images/switch_acc.svg) white center center no-repeat',height:'25px',width:'25px',transform:'scale(0.75)',marginRight:'3px',},onClick:(event)=>{event.stopPropagation()
this.setState({accountSelectorActive:!accountSelectorActive,optionsMenuActive:!1,})},},this.renderAccountSelector(),),enableAccountOptions&&h('i.fa.fa-ellipsis-h',{style:{marginRight:'0.5em',fontSize:'1.8em',},onClick:(event)=>{event.stopPropagation()
this.setState({accountSelectorActive:!1,optionsMenuActive:!optionsMenuActive,})},},this.renderAccountOptions()),])}}
AccountDropdowns.defaultProps={enableAccountsSelector:!1,enableAccountOptions:!1,}
AccountDropdowns.propTypes={identities:PropTypes.objectOf(PropTypes.object),selected:PropTypes.string,keyrings:PropTypes.array,actions:PropTypes.objectOf(PropTypes.func),network:PropTypes.string,style:PropTypes.object,enableAccountOptions:PropTypes.bool,enableAccountsSelector:PropTypes.bool,}
const mapDispatchToProps=(dispatch)=>{return{actions:{showConfigPage:()=>dispatch(actions.showConfigPage()),requestAccountExport:()=>dispatch(actions.requestExportAccount()),showAccountDetail:(address)=>dispatch(actions.showAccountDetail(address)),addNewAccount:()=>dispatch(actions.addNewAccount()),showImportPage:()=>dispatch(actions.showImportPage()),showQrView:(selected,identity)=>dispatch(actions.showQrView(selected,identity)),},}}
module.exports={AccountDropdowns:connect(null,mapDispatchToProps)(AccountDropdowns),}