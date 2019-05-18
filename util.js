function $(id) {return document.getElementById(id);}
function aMod(aT) {var sM=0;if (dC.stat[aT].base) sM=Math.floor(dC.stat[aT].tot/2-5);return sM;}
function fMod(wM) {if(!wM)return"";return(wM>0)?"+"+wM:wM.toString();}
function zMod(wM) {return(wM<0)?wM.toString():"+"+wM;}
function Q$(fldNm) {
  var oRe = new RegExp("[\\?&]"+fldNm+"=([^&#]*)");
  var fldVal = oRe.exec(parent.location.search);
  return (fldVal) ? unescape(fldVal[1]) : "";
}
function S$(selVal,selName) {
  var oSel = document.forms[0][selName];
  for (var ss=0;ss<oSel.length;ss++) {
    if (oSel.options[ss].value == selVal) {oSel.selectedIndex = ss; break;}
  }
}
function ad_qs(qslink,qsname,qsval) {
  var qsAdded = qslink;
  if (qsval != "") {if (qslink.indexOf("?") == -1) {qsAdded+="?"} else {qsAdded+="&"} qsAdded+=qsname+"="+escape(qsval)}
  return qsAdded;
}
function skillPoints(skilMod) {
  if (dC.race == "Human") skilMod+=1;
  skilMod += aMod('Int');
  if (skilMod < 1) skilMod = 1;
  return skilMod*4+(dC.lvl-1)*skilMod+raceSkil();
}
function raceSkil() {
  if (oRc[dC.race].sklPnt) {
    var skilMod = aMod('Int')+oRc[dC.race].sklPnt;
    if (skilMod < 1) skilMod = 1;
    return skilMod*oRc[dC.race].sklPntLvl;
  }
  return 0;
}
function assign_stat_all() {
  var aStatVal = [];
  for (var ii in dC.stat) {
    dC.stat[ii].base = 0; dC.stat[ii].mod = "";
  }
  var oStat, ii, jj;
  for (ii=0;ii<6;ii++) {
    oStat = document.forms[0]["ffStatSel"+ii];
    if (oStat.value != "") {
      dC.stat[oStat.value].base = F$("ffStat"+ii);
    }
    aStatVal[ii] = oStat.value;
    for (var jj=0;jj<7;jj++) {oStat.options[0] = null}
  }
  //rebuild ability select boxes
  for (ii=0;ii<6;ii++) {
    oStat = document.forms[0]["ffStatSel"+ii];
    for (jj in dC.stat) {
      oStat.options[0] = new Option("","",false,false);
      if (aStatVal[ii] == jj || !isInArray(jj, aStatVal)) {
        oStat.options[oStat.length] = new Option(jj,jj,false,(aStatVal[ii] == jj));
      }
    }
    if (!aStatVal[ii]) oStat.selectedIndex = 0;
  }
}
function isDwarf() {
  if (dC.race == "Dwarf" || dC.race == "Deep Dwarf" || dC.race == "Duergar") return true;
  return false;
}
function move() {
  var speed = 30;
  if (oRc[dC.race].speed) speed = oRc[dC.race].speed;
  if (oArmr[F$("ffArmor")][1] == "Medium" || oArmr[F$("ffArmor")][1] == "Heavy") if (!isDwarf()) speed = oSpd[speed];
  if (oArmr[F$("ffArmor")][1] != "Heavy" && F$("ffClass") == "Barbarian") speed += 10;
  if (F$("ffClass") == "Monk") speed += Math.floor(dC.lvl/3)*10;
  var run = speed*4;
  if (oArmr[F$("ffArmor")][1] == "Heavy") run = speed*3;
  if (existFeat("Run")) {run = speed*5; if (oArmr[F$("ffArmor")][1] == "Heavy") {run = speed*4;}}
  dC.speed = speed; dC.run = run;
}
function sizeMod(charSize) {switch (charSize) {case "s":return 1; break; case "l": return -1; break; default: return 0}}
function roll_dice(dieCode) {
  var dieMult, dieSide, dieTotal; dieTotal = 0
  aDieCode1 = dieCode.split("d")
  dieMult = parseInt(aDieCode1[0]); dieSide = parseInt(aDieCode1[1])
  for (ii=1;ii<=dieMult;ii++) {dieTotal += Math.ceil(Math.random()*dieSide)}
  return dieTotal;
}
function IH$(id, ihVal) {document.getElementById(id).innerHTML = ihVal}
function existFeat(featName) {
  if (F$("ffClass") == "Monk" && featName == "Improved Unarmed Strike") return true;
  else {for (var ef=0;ef<dC.feat.length;ef++) {if (dC.feat[ef] == featName) return true;}}
  return false;
}
function dVal(dName) {$(dName).innerHTML = fMod(eval(dName))}
function cDel(sStr, sAdd) {if (sStr != "") {sStr += ",";} return sStr + sAdd;}
function cLst(sStr, sAdd) {if (sStr != "") {sStr += ", ";} return sStr + sAdd;}
function mkSel(oSel, oDat) {for (ii in oDat) {oSel.options[oSel.length] = new Option(ii,ii,0,0)}}
function aOrd(aVal, aArr) {
  for (iTmp in aArr) {if (aVal == aArr[iTmp]) return iTmp;}
  return -1;
}
function F$(fieldName, formName) {
  var fField;
  var fromForm = (formName) ? [document[formName]] : document.forms;
  for (var ff=0; ff<fromForm.length; ff++) {
    try {
      var fField = fromForm[ff][fieldName];
    } catch(E) {return undefined;}
    if (fField) return getFldVal(fField);
  }
  return "";
  
  function getFldVal(o) {
    var fType;
    try {fType = o.getAttribute("type");}
    catch(E){fType = o[0].getAttribute("type");}
    switch (fType) {
      case "checkbox":
        return (o.checked) ? o.value : "";
      case "radio":
        for (var ii=0; ii<o.length; ii++) {
          if (o[ii].checked) return o[ii].value;
        }
        return "";
      default:
        if (!o.value) return "";
        return (isNaN(o.value)) ? o.value : Number(o.value);
    }
  }
}
function dspLabel(dspVal, dspLbl) {return (dspVal != "") ? dspVal + " " + dspLbl : "none"}
function isInArray(sVal, a) {for (var ii=0;ii<a.length;ii++) {if (sVal == a[ii]) return true;}}
function inArray(sVal, a) {
  for (var ii=0;ii<a.length;ii++) {if (sVal == a[ii]) return ii;}
  return -1;
}
function bsAtk(lvl, baType) {
  //g = good, a = average, p = poor
  switch (baType) {
    case "g":
      return lvl;
    case "a":
      return Math.floor(lvl*.75)
    default:
      return Math.floor(lvl*.5)
  }
}
function baseSave(lvl, svType) {return (svType == "g") ? Math.floor(lvl*.5)+2 : Math.floor(lvl/3)}
function roll_stats(blnRrll) {
  var aDie = [];
  for (var ii = 0; ii < 6; ii++) {
    for (var dd=0; dd<4; dd++) {aDie[dd] = Math.ceil(Math.random()*6)}
    aDie[lowestInArray(aDie)] = 0;
    objF["ffStat"+ii].value = addUpArray(aDie);
  }
  if (blnRrll) recalc_all(1);
}
function lowestInArray(a) {
  var lowest = 0;
  for (var ii = 1; ii < a.length; ii++) {if (a[ii] < a[lowest]) lowest = ii;}
  return lowest;
}
function addUpArray(a) {
  var total = 0;
  for (var ii = 0; ii<a.length; ii++) {total += a[ii];}
  return total;
}
function getHp() {return oCls[dC.clss][0]+aMod('Con')+Math.floor((dC.lvl-1)*(oCls[dC.clss][0]/2+aMod('Con')+.5))}
function aveDie(rhdLvl, rhd) {return Math.floor(rhdLvl*((rhd-1)/2+1))}