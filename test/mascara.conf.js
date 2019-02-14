const getBaseConfig=require('./base.conf.js')
module.exports=function(config){const settings=getBaseConfig(config)
settings.files.push('dist/mascara/ui.js')
settings.files.push('dist/mascara/tests.js')
settings.files.push({pattern:'dist/mascara/background.js',watched:!1,included:!1,served:!0}),settings.proxies['/background.js']='/base/dist/mascara/background.js'
settings.browserNoActivityTimeout=10000000
config.set(settings)}