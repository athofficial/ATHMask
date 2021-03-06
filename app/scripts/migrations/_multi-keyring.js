const version=5
const ObservableStore=require('obs-store')
const ConfigManager=require('../../app/scripts/lib/config-manager')
const IdentityStoreMigrator=require('../../app/scripts/lib/idStore-migrator')
const KeyringController=require('eth-keyring-controller')
const password='obviously not correct'
module.exports={version,migrate:function(versionedData){versionedData.meta.version=version
const store=new ObservableStore(versionedData.data)
const configManager=new ConfigManager({store})
const idStoreMigrator=new IdentityStoreMigrator({configManager})
const keyringController=new KeyringController({configManager:configManager,})
return idStoreMigrator.migratedVaultForPassword(password).then((result)=>{if(!result)return Promise.resolve(versionedData)
delete versionedData.data.wallet
const privKeys=result.lostAccounts.map(acct=>acct.privateKey)
return Promise.all([keyringController.restoreKeyring(result.serialized),keyringController.restoreKeyring({type:'Simple Key Pair',data:privKeys}),]).then(()=>{return keyringController.persistAllKeyrings(password)}).then(()=>{versionedData.data=store.get()
return Promise.resolve(versionedData)})})},}