const Component=require('react').Component
const h=require('react-hyperscript')
const inherits=require('util').inherits
const actions=require('../actions')
const clone=require('clone')
const ethUtil=require('ethereumjs-util')
const BN=ethUtil.BN
const hexToBn=require('../../../app/scripts/lib/hex-to-bn')
const util=require('../util')
const MiniAccountPanel=require('./mini-account-panel')
const Copyable=require('./copyable')
const EthBalance=require('./eth-balance')
const addressSummary=util.addressSummary
const nameForAddress=require('../../lib/contract-namer')
const BNInput=require('./bn-as-decimal-input')
const MIN_GAS_PRICE_BN=new BN('20000000000')
const MIN_GAS_LIMIT_BN=new BN('21000')
module.exports=PendingTx
inherits(PendingTx,Component)
function PendingTx(){Component.call(this)
this.state={valid:!0,txData:null,submitting:!1,}}
PendingTx.prototype.render=function(){const props=this.props
const{currentCurrency,blockGasLimit,network}=props
const conversionRate=props.conversionRate
const txMeta=this.gatherTxMeta()
const txParams=txMeta.txParams||{}
const{lastGasPrice}=txMeta
let forceGasMin
if(lastGasPrice){const stripped=ethUtil.stripHexPrefix(lastGasPrice)
const lastGas=new BN(stripped,16)
const priceBump=lastGas.divn('10')
forceGasMin=lastGas.add(priceBump)}
const address=txParams.from||props.selectedAddress
const identity=props.identities[address]||{address:address}
const account=props.accounts[address]
let balance
if(network===88){balance=account?account.balance:new BN(0,16)}else{balance=account?account.balance:'0x0'}
const isValidAddress=!txParams.to||util.isValidAddress(txParams.to)
const gas=txParams.gas
const gasBn=hexToBn(gas)
const gasLimit=new BN(parseInt(blockGasLimit))
const safeGasLimitBN=this.bnMultiplyByFraction(gasLimit,19,20)
const saferGasLimitBN=this.bnMultiplyByFraction(gasLimit,18,20)
const safeGasLimit=safeGasLimitBN.toString(10)
const gasPrice=txParams.gasPrice||MIN_GAS_PRICE_BN.toString(16)
const gasPriceBn=hexToBn(gasPrice)
const txFeeBn=gasBn.mul(gasPriceBn)
const valueBn=hexToBn(txParams.value)
const maxCost=txFeeBn.add(valueBn)
const dataLength=txParams.data?(txParams.data.length-2)/2:0
const balanceBn=hexToBn(balance)
const insufficientBalance=balanceBn.lt(maxCost)
const dangerousGasLimit=gasBn.gte(saferGasLimitBN)
const gasLimitSpecified=txMeta.gasLimitSpecified
const buyDisabled=insufficientBalance||!this.state.valid||!isValidAddress||this.state.submitting
const showRejectAll=props.unconfTxListLength>1
this.inputs=[]
return(h('div',{key:txMeta.id,},[h('form#pending-tx-form',{onSubmit:this.onSubmit.bind(this),},[h('div',[h('.flex-row.flex-center',{style:{maxWidth:'100%',},},[h(MiniAccountPanel,{imageSeed:address,picOrder:'right',},[h('span.font-small',{style:{fontFamily:'Montserrat Bold, Montserrat, sans-serif',},},identity.name),h(Copyable,{value:ethUtil.toChecksumAddress(address),},[h('span.font-small',{style:{fontFamily:'Montserrat Light, Montserrat, sans-serif',},},addressSummary(address,6,4,!1)),]),h('span.font-small',{style:{fontFamily:'Montserrat Light, Montserrat, sans-serif',},},[h(EthBalance,{value:balance,conversionRate,currentCurrency,network,inline:!0,labelColor:'#F7861C',}),]),]),forwardCarrat(),this.miniAccountPanelForRecipient(),]),h('style',`
            .table-box {
              margin: 7px 0px 0px 0px;
              width: 100%;
            }
            .table-box .row {
              margin: 0px;
              background: rgb(236,236,236);
              display: flex;
              justify-content: space-between;
              font-family: Montserrat Light, sans-serif;
              font-size: 13px;
              padding: 5px 25px;
            }
            .table-box .row .value {
              font-family: Montserrat Regular;
            }
          `),h('.table-box',[h('.row',[h('.cell.label','Amount'),h(EthBalance,{value:txParams.value,currentCurrency,conversionRate,network}),]),h('.cell.row',[h('.cell.label','Gas Limit'),h('.cell.value',{},[h(BNInput,{name:'Gas Limit',value:gasBn,precision:0,scale:0,min:MIN_GAS_LIMIT_BN,max:safeGasLimit,suffix:'UNITS',style:{position:'relative',top:'5px',},onChange:this.gasLimitChanged.bind(this),ref:(hexInput)=>{this.inputs.push(hexInput)},}),]),]),h('.cell.row',[h('.cell.label','Gas Price'),h('.cell.value',{},[h(BNInput,{name:'Gas Price',value:gasPriceBn,precision:9,scale:9,suffix:'GWEI',min:forceGasMin||MIN_GAS_PRICE_BN,style:{position:'relative',top:'5px',},onChange:this.gasPriceChanged.bind(this),ref:(hexInput)=>{this.inputs.push(hexInput)},}),]),]),h('.cell.row',[h('.cell.label','Max Transaction Fee'),h(EthBalance,{value:txFeeBn.toString(16),currentCurrency,conversionRate,network}),]),h('.cell.row',{style:{fontFamily:'Montserrat Regular',background:'white',padding:'10px 25px',},},[h('.cell.label','Max Total'),h('.cell.value',{style:{display:'flex',alignItems:'center',},},[h(EthBalance,{value:maxCost.toString(16),currentCurrency,conversionRate,network,inline:!0,labelColor:'black',fontSize:'16px',}),]),]),h('.cell.row',{style:{background:'#f7f7f7',paddingBottom:'0px',},},[h('.cell.label'),h('.cell.value',{style:{fontFamily:'Montserrat Light',fontSize:'11px',},},`Data included: ${dataLength} bytes`),]),]),]),h('style',`
          .conf-buttons button {
            margin-left: 10px;
            text-transform: uppercase;
          }
        `),h('.cell.row',{style:{textAlign:'center',},},[txMeta.simulationFails?h('.error',{style:{fontSize:'0.9em',},},'Transaction Error. Exception thrown in contract code.'):null,!isValidAddress?h('.error',{style:{fontSize:'0.9em',},},'Recipient address is invalid. Sending this transaction will result in a loss of ATH.'):null,insufficientBalance?h('span.error',{style:{fontSize:'0.9em',},},'Insufficient balance for transaction'):null,(dangerousGasLimit&&!gasLimitSpecified)?h('span.error',{style:{fontSize:'0.9em',},},'Gas limit set dangerously high. Approving this transaction is likely to fail.'):null,]),h('.flex-row.flex-space-around.conf-buttons',{style:{display:'flex',justifyContent:'flex-end',margin:'14px 25px',},},[h('button',{onClick:(event)=>{this.resetGasFields()
event.preventDefault()},},'Reset'),insufficientBalance?h('button.btn-green',{onClick:props.buyEth},'Buy Ether'):h('input.confirm.btn-green',{type:'submit',value:'SUBMIT',style:{marginLeft:'10px'},disabled:buyDisabled,}),h('button.cancel.btn-red',{onClick:props.cancelTransaction,},'Reject'),]),showRejectAll?h('.flex-row.flex-space-around.conf-buttons',{style:{display:'flex',justifyContent:'flex-end',margin:'14px 25px',},},[h('button.cancel.btn-red',{onClick:props.cancelAllTransactions,},'Reject All'),]):null,]),]))}
PendingTx.prototype.miniAccountPanelForRecipient=function(){const props=this.props
const txData=props.txData
const txParams=txData.txParams||{}
const isContractDeploy=!('to' in txParams)
if(!isContractDeploy){return h(MiniAccountPanel,{imageSeed:txParams.to,picOrder:'left',},[h('span.font-small',{style:{fontFamily:'Montserrat Bold, Montserrat, sans-serif',},},nameForAddress(txParams.to,props.identities)),h(Copyable,{value:ethUtil.toChecksumAddress(txParams.to),},[h('span.font-small',{style:{fontFamily:'Montserrat Light, Montserrat, sans-serif',},},addressSummary(txParams.to,6,4,!1)),]),])}else{return h(MiniAccountPanel,{picOrder:'left',},[h('span.font-small',{style:{fontFamily:'Montserrat Bold, Montserrat, sans-serif',},},'New Contract'),])}}
PendingTx.prototype.gasPriceChanged=function(newBN,valid){log.info(`Gas price changed to: ${newBN.toString(10)}`)
const txMeta=this.gatherTxMeta()
txMeta.txParams.gasPrice='0x'+newBN.toString('hex')
this.setState({txData:clone(txMeta),valid,})}
PendingTx.prototype.gasLimitChanged=function(newBN,valid){log.info(`Gas limit changed to ${newBN.toString(10)}`)
const txMeta=this.gatherTxMeta()
txMeta.txParams.gas='0x'+newBN.toString('hex')
this.setState({txData:clone(txMeta),valid,})}
PendingTx.prototype.resetGasFields=function(){log.debug(`pending-tx resetGasFields`)
this.inputs.forEach((hexInput)=>{if(hexInput){hexInput.setValid()}})
this.setState({txData:null,valid:!0,})}
PendingTx.prototype.onSubmit=function(event){event.preventDefault()
const txMeta=this.gatherTxMeta()
const valid=this.checkValidity()
this.setState({valid,submitting:!0})
if(valid&&this.verifyGasParams()){this.props.sendTransaction(txMeta,event)}else{this.props.dispatch(actions.displayWarning('Invalid Gas Parameters'))
this.setState({submitting:!1})}}
PendingTx.prototype.checkValidity=function(){const form=this.getFormEl()
const valid=form.checkValidity()
return valid}
PendingTx.prototype.getFormEl=function(){const form=document.querySelector('form#pending-tx-form')
if(!form){return{checkValidity(){return!0}}}
return form}
PendingTx.prototype.gatherTxMeta=function(){log.debug(`pending-tx gatherTxMeta`)
const props=this.props
const state=this.state
const txData=clone(state.txData)||clone(props.txData)
log.debug(`UI has defaulted to tx meta ${JSON.stringify(txData)}`)
return txData}
PendingTx.prototype.verifyGasParams=function(){if(!this.state){return!0}
return(this._notZeroOrEmptyString(this.state.gas)&&this._notZeroOrEmptyString(this.state.gasPrice))}
PendingTx.prototype._notZeroOrEmptyString=function(obj){return obj!==''&&obj!=='0x0'}
PendingTx.prototype.bnMultiplyByFraction=function(targetBN,numerator,denominator){const numBN=new BN(numerator)
const denomBN=new BN(denominator)
return targetBN.mul(numBN).div(denomBN)}
function forwardCarrat(){return(h('img',{src:'images/forward-carrat.svg',style:{padding:'5px 6px 0px 10px',height:'37px',},}))}