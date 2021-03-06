var assert=require('assert')
var path=require('path')
var sinon=require('sinon')
var actions=require(path.join(__dirname,'..','..','..','ui','app','actions.js'))
var reducers=require(path.join(__dirname,'..','..','..','ui','app','reducers.js'))
describe('#unlockMetamask(selectedAccount)',function(){beforeEach(function(){this.sinon=sinon.sandbox.create()})
afterEach(function(){this.sinon.restore()})
describe('after an error',function(){it('clears warning',function(){const warning='this is the wrong warning'
const account='foo_account'
const initialState={appState:{warning:warning,},}
const resultState=reducers(initialState,actions.unlockMetamask(account))
assert.equal(resultState.appState.warning,null,'warning nullified')})})
describe('going home after an error',function(){it('clears warning',function(){const warning='this is the wrong warning'
const initialState={appState:{warning:warning,},}
const resultState=reducers(initialState,actions.goHome())
assert.equal(resultState.appState.warning,null,'warning nullified')})})})