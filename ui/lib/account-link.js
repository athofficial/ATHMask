module.exports=function(address,network){const net=parseInt(network)
let link
switch(net){case 1:link=`https://scan.atheios.com/addr/${address}`
break
case 2:link=`https://morden.etherscan.io/address/${address}`
break
case 3:link=`https://ropsten.etherscan.io/address/${address}`
break
case 4:link=`https://rinkeby.etherscan.io/address/${address}`
break
case 42:link=`https://kovan.etherscan.io/address/${address}`
break
case 61:link=`https://gastracker.io/addr/${address}`
break
case 820:link=`https://explorer.callisto.network/account/${address}`
break
case 28:link=`https://explorer.ethereumsocial.kr/addr/${address}`
break
case 1620:link=`https://scan.atheios.com/addr/${address}`
break
default:link=''
break}
return link}