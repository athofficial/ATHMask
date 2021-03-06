var iconFactory
const isValidAddress=require('ethereumjs-util').isValidAddress
const toChecksumAddress=require('ethereumjs-util').toChecksumAddress
const contractMap=require('eth-contract-metadata')
module.exports=function(jazzicon){if(!iconFactory){iconFactory=new IconFactory(jazzicon)}
return iconFactory}
function IconFactory(jazzicon){this.jazzicon=jazzicon
this.cache={}}
IconFactory.prototype.iconForAddress=function(address,diameter){const addr=toChecksumAddress(address)
if(iconExistsFor(addr)){return imageElFor(addr)}
return this.generateIdenticonSvg(address,diameter)}
IconFactory.prototype.generateIdenticonSvg=function(address,diameter){var cacheId=`${address}:${diameter}`
var identicon=this.cache[cacheId]||(this.cache[cacheId]=this.generateNewIdenticon(address,diameter))
var cleanCopy=identicon.cloneNode(!0)
return cleanCopy}
IconFactory.prototype.generateNewIdenticon=function(address,diameter){var numericRepresentation=jsNumberForAddress(address)
var identicon=this.jazzicon(diameter,numericRepresentation)
return identicon}
function iconExistsFor(address){return contractMap[address]&&isValidAddress(address)&&contractMap[address].logo}
function imageElFor(address){const contract=contractMap[address]
const fileName=contract.logo
const path=`images/contract/${fileName}`
const img=document.createElement('img')
img.src=path
img.style.width='75%'
return img}
function jsNumberForAddress(address){var addr=address.slice(2,10)
var seed=parseInt(addr,16)
return seed}