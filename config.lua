local blackEventList={

}
local rules = {

  {}
}

function filterOne(msg) 

end

reortInterval=1h
local v = {
  function updateAppinfo(appinfo)  --[[deviceid clientid userid... 可以重复调用，假如信息有变 ]]

  end,
  
  isEnable: function()
    return true 
  end,
  blackEventList: function(){
    return blackEventList
  },
  filter: function(msgs) {
  if  match(msg):

  else
    report.stat(msg)
    report[msg.event].count++
    report.top(100)
    ...
  },
  report: function(){
    return {}
  }
}

return 
