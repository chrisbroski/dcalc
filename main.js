var dCalc = {
        race: "",
        clss: "",
        lvl: 1,
        stat: {
        Str: {base: 0, race: 0, tot: 0, mod: ""},
        Dex: {base: 0, race: 0, tot: 0, mod: ""},
        Con: {base: 0, race: 0, tot: 0, mod: ""},
        Int: {base: 0, race: 0, tot: 0, mod: ""},
        Wis: {base: 0, race: 0, tot: 0, mod: ""},
        Cha: {base: 0, race: 0, tot: 0, mod: ""}
        },
        save: {
        fort: {base: 0, misc: 0, clss: 0, tot: 0},
        rflx: {base: 0, misc: 0, clss: 0, tot: 0},
        will: {base: 0, misc: 0, clss: 0, tot: 0}
        },
        prfArmor: [], feat:[], featA:[],
        weapon: {prf: {rc:[], feat:[], tot:[]}, equip: {abil: [], other: [], tot: []}},
        abil: {race:[], clss:[], feat:[], tot:[]},
        skills: {}, size: "m",
        hp:0, init:0, mload:"", hload:"", speed:"", run:"", cgp:0, enc:0,
        ac: {prf: {clss:[], feat:[], tot:[]}, dex:0, size:0, monk:0, maxdex:9, tot:10, touch:10, flat:10, check:0, spell:0, bothName:""},
        lang: {skill:[], spoken:[], bonus:[], tot:[]},
        brbrnRdWrt:false, baseAtk:0
    },
    blnLoad = true,
    flagBonusLang,
    dC;

function abilList() {
    var ii, divStat, inputStat, selectStat, optionStat;

    for (ii = 0; ii < 6; ii = ii + 1) {
        divStat = document.createElement('div');
        divStat.appendChild(document.createTextNode('Stat' + (ii + 1) + ' '));

        inputStat = document.createElement('input');
        inputStat.name = "ffStat" + ii;
        inputStat.maxlength = 2;
        inputStat.onchange = recalc_all;
        divStat.appendChild(inputStat);

        selectStat = document.createElement('select');
        selectStat.name = "ffStatSel" + ii;
        selectStat.onchange = recalc_all
        optionStat = document.createElement('option');
        selectStat.appendChild(optionStat);

        Object.keys(dC.stat).forEach(function (key) {
            optionStat = document.createElement('option');
            optionStat.value = key;
            optionStat.appendChild(document.createTextNode(key));
            selectStat.appendChild(optionStat);
        });

        divStat.appendChild(selectStat);
        document.getElementById('dStats').appendChild(divStat);
    }
}

function choiceInit() {
  //$("loadScr").style.display = "block";
  dC = dCalc;
  objF = document.forms[0];
  //create race, class, deity, stat, armor, shield weapon drop-downs
  mkSel(objF.ffRace, oRc); mkSel(objF.ffClass, oCls); mkSel(objF.ffDeity, oGods);
  abilList();
  mkSel(objF.ffArmor, oArmr); mkSel(objF.ffShield, oShld);
  for (ii=1;ii<4;ii++) {mkSel(objF["ffWeapon"+ii], oWpn);}
  roll_stats(0);
  if (document.search != "" && blnLoad) {
    //enter querystring values
    objF.ffName.value = Q$("n"); S$(Q$("g").substr(0,1),"ffSex")
    objF.ffAlign1.value = Q$("a1"); objF.ffAlign2.value = Q$("a2")
    objF.ffHeight.value = Q$("h"); objF.ffWeight.value = Q$("w")
    objF.ffAge.value = Q$("ag"); objF.ffHair.value = Q$("hr"); objF.ffEyes.value = Q$("ey")
    //dC.race = F$("ffRace"); dC.clss = F$("ffClass");
    S$(Q$("r"),"ffRace"); S$(Q$("c"),"ffClass"); S$(Q$("d"),"ffDeity"); S$(Q$("l"),"ffLevel");
    for (ii=0;ii<6;ii++) {if (Q$("s"+ii+"v")) {objF["ffStat"+ii].value = Q$("s"+ii+"v"); S$(Q$("s"+ii+"s"),"ffStatSel"+ii)}}
    S$(Q$("a"),"ffArmor"); S$(Q$("sh"),"ffShield");
    for (ii=1;ii<4;ii++) {S$(Q$("w"+ii),"ffWeapon"+ii)}
    recalc_all(0);
    var aSkilz = Q$("k").split(",")
    for (ii=0;ii<aSkilz.length;ii++) {
      aSkTmp = aSkilz[ii].split(":")
      S$(aSkTmp[0],"ffTSkill")
      for (var ts=0;ts<parseInt(aSkTmp[1]);ts++) {train_skill(1, 0)}
    }
    tmpKl = Q$("kl").split(",")
    for (ii=0; ii<tmpKl.length; ii++) {
      S$("Speak "+tmpKl[ii],"ffTSkill")
      if (F$("ffTSkill") == "Speak "+tmpKl[ii]) {train_skill(1, 0)}
    }
    if (Q$("rw")) dC.brbrnRdWrt = true;
    list_skills(); make_feats(1); recalc_all(1);
    //if Randomly generated values are blank, then create some
    if (Q$("h") == "" && Q$("2") == "") {stat_race(3);}
    if (Q$("ag") == "") {stat_class(3);}
  } else {list_skills();dspAll(1)}
  //get rid of loading screen
  //$("loadScr").style.display = "none";
}

function stat_race(rclFlg) {
  dC.race = F$("ffRace");
  dC.lang.bonus = []; dC.lang.spoken = [];
  dC.size = (dC.race) ? oRc[dC.race].size : "m";
  if (objF.ffSex.value == "F") {IH$("dSex", "Female&nbsp;")}
  else {
    if (objF.ffSex.value == "M") {IH$("dSex", "Male&nbsp;")}
    else {IH$("dSex", "")}
  }
  if (!dC.race) {
    IH$("OtherSave","");
    dC.save.fort.misc = 0; dC.save.rflx.misc = 0; dC.save.will.misc = 0;
    dC.stat.Str.race = dC.stat.Dex.race = dC.stat.Con.race = dC.stat.Int.race = dC.stat.Wis.race = dC.stat.Cha.race = dC.ac.size = 0;
  } else {
    dC.save.fort.misc = oRc[dC.race].save.fort;
    dC.save.rflx.misc = oRc[dC.race].save.rflx;
    dC.save.will.misc = oRc[dC.race].save.will;
    //Look for save feats
    if (existFeat("Great Fortitude")) dC.save.fort.misc+=2;
    if (existFeat("Lightning Reflexes")) dC.save.rflx.misc+=2;
    if (existFeat("Iron Will")) dC.save.will.misc+=2;

    for (var ii in dC.stat) {dC.stat[ii].race = oRc[dC.race].abil[ii];}
    IH$("OtherSave",oRc[dC.race].save.other); dC.ac.size = sizeMod(oRc[dC.race].size);
    dC.abil.race = oRc[dC.race].traits;
    if (dC.size == "s") dC.abil.race = addArray(dC.abil.race, "-4 to grapple");
    //dC.prfArmor = addArray(dC.prfArmor, "Light");
    if (dC.size == "l") dC.abil.race = addArray(dC.abil.race, "+4 to grapple");
    move();

    //recalc random stuff
    if (rclFlg == 3 && !!F$("ffSex") && !!oRc[dC.race].hght) {
      //calculate random height and weight
      var heightMod = 0;
      if (oRc[dC.race].hght.mod) heightMod = roll_dice(oRc[dC.race].hght.mod);
      objF.ffHeight.value = oRc[dC.race].hght[F$("ffSex")]+heightMod;
      objF.ffWeight.value = oRc[dC.race].wght[F$("ffSex")]+heightMod*roll_dice(oRc[dC.race].wght.mod);
      height_dsp(); quick_dsp("Weight");
    }
  }
}

function raceHd() {
  if (oRc[dC.race].hd) {
    return aveDie(oRc[dC.race].lvl, oRc[dC.race].hd);
  }
  return 0;
}

function stat_class(rclFlg) {
  dC.lvl = F$("ffLevel");
  dC.save.fort.base = aMod('Con');
  dC.save.rflx.base = aMod('Dex');
  dC.save.will.base = aMod('Wis');
  dC.init = zMod(aMod('Dex'));
  if (existFeat("Improved Initiative")) dC.init = fMod(aMod('Dex')+4);
  dC.ac.dex = aMod('Dex');
  dC.clss = F$("ffClass");
  $("SA").style.display = "block"
  dC.weapon.prf.rc = []; dC.prfArmor = []; dC.weapon.prf.feat = [];
  if (!dC.clss) {
    dC.save.fort.clss = 0; dC.save.rflx.clss = 0; dC.save.will.clss = 0;
    $("specAbilities").innerHTML = ""; $("SA").style.display = "none";
  } else {
    var aTmpWP;
    dC.baseAtk = bsAtk(dC.lvl, oCls[dC.clss][9]);
    if (oRc[dC.race].atk) dC.baseAtk += oRc[dC.race].atk;
    dC.save.fort.clss = baseSave(dC.lvl, oCls[dC.clss][1]);
    dC.save.rflx.clss = baseSave(dC.lvl, oCls[dC.clss][2]);
    dC.save.will.clss = baseSave(dC.lvl, oCls[dC.clss][3]);
    dC.hp = getHp() + raceHd();
    if (F$("ffFeat1") == "Toughness") {dC.hp+=3}
    if (F$("ffFeat2") == "Toughness") {dC.hp+=3}
    objF.ffSkillP.value = skillPoints(oCls[dC.clss][5])
    objF.ffSkillT.value = F$("ffSkillP")-F$("ffSkillS")
    dC.prfArmor = oCls[dC.clss][7];
    //Add Armor Proficienies from Feats
    if (existFeat("Armor Proficiency (light)")) dC.prfArmor = addArray(dC.prfArmor, "Light");
    if (existFeat("Armor Proficiency (medium)")) dC.prfArmor.push("Medium");
    if (existFeat("Armor Proficiency (heavy)")) dC.prfArmor.push("Heavy");
    if (existFeat("Shield Proficiency")) dC.prfArmor.push("Shields");
    if (existFeat("Tower Shield Proficiency")) dC.prfArmor.push("Tower shield");
    dC.weapon.prf.rc = oCls[dC.clss][6];
    //Get Racial Weapon Proficiencies
    if (dC.race) {
      if (dC.weapon.prf.rc[1] != "Martial") {
        dC.weapon.prf.rc = addArray(dC.weapon.prf.rc, oRc[dC.race].wProf);
      } else {
        //Get Racial Exotic-as-Martial Proficiencies
        if (oRc[dC.race].exAsMart) dC.weapon.prf.rc = addArray(dC.weapon.prf.rc, oRc[dC.race].exAsMart);
      }
    }
    //Get Feat-based Weapon Proficiencies
    if (existFeat("Simple Weapon Proficiency")) dC.weapon.prf.rc[0] = "Simple";
    dC.weapon.prf.feat = [];
    for (ff=1;ff<=dC.feat.length;ff++) {
      if (F$("ffFeat"+ff) == "Exotic Weapon Proficiency" || F$("ffFeat"+ff) == "Martial Weapon Proficiency") {
        if (F$("ffFeat"+ff+"a")) dC.weapon.prf.feat[dC.weapon.prf.feat.length] = F$("ffFeat"+ff+"a");
      }
    }

    if (dC.race && (rclFlg == 2 || rclFlg == 3)) {
      objF.ffAge.value = rndAge();
      quick_dsp("Age");
    }
    dC.abil.clss = [];
    var aClss;
    for (var ii=0; ii<dC.lvl; ii++) {
      aClss = oCls[dC.clss][8][ii];
      if (aClss) {
        for (var jj=0; jj<aClss.length; jj++) {
          if (aClss[jj]) {
            if (aClss[jj].indexOf(":") > -1) {
              //if a : of the same type exists, replace it with this one
              aClFt = aClss[jj].split(":");
              var blnReplaced = false;
              for (var kk=0; kk<dC.abil.clss.length; kk++) {
                if (aClFt[0] == dC.abil.clss[kk].substr(0,aClFt[0].length)) {
                  dC.abil.clss[kk] = aClFt[0]+aClFt[1];
                  blnReplaced = true;
                  break;
                }
              }
              if (!blnReplaced) dC.abil.clss[dC.abil.clss.length] = aClFt[0]+aClFt[1];
            } else {
              dC.abil.clss[dC.abil.clss.length] = aClss[jj];
            }
          }
        }
      }
    }
    if (dC.clss == "Barbarian") {
      var iIllit = inArray("Illiteracy",dC.abil.clss)
      if (dC.brbrnRdWrt) {
        if (iIllit >= 0) dC.abil.clss.splice(iIllit,1);
      } else {
        if (iIllit < 0) dC.abil.clss[dC.abil.clss.length] = "Illiteracy";
      }
    }
    //This could probably be conditional depending on rclFlg
    dspAll(1)
  }
}

function rndAge() {
  switch (dC.clss) {
    case "Barbarian": case "Rogue": case "Sorcerer":
      agOrd = "mod1"; break;
    case "Bard": case "Fighter": case "Paladin": case "Ranger":
      agOrd = "mod2"; break;
    default :
      agOrd = "mod3";
  }
  if (oRc[dC.race].age) {
    return oRc[dC.race].age.adult+roll_dice(oRc[dC.race].age[agOrd]);
  } else {
    return "";
  }
}

function armor() {
  //Format naming
  dC.ac.bothName = "";
  if (F$("ffShield")) {
    if (F$("ffArmor")) {dC.ac.bothName = F$("ffArmor") + " armor &amp; "}
    dC.ac.bothName += F$("ffShield")
    if (F$("ffShield") != "Tower shield" && F$("ffShield") != "Buckler") {dC.ac.bothName += " shield"}
  } else {
    if (F$("ffArmor")) {dC.ac.bothName = F$("ffArmor") + " armor"}
  }
  if (!dC.ac.bothName) {dC.ac.bothName = "none"}

  //Calculate max dex
  acTMaxDex = oArmr[F$("ffArmor")][2];
  dC.ac.maxdex = oArmr[F$("ffArmor")][2];
  if (oShld[F$("ffShield")][1] < dC.ac.maxdex) {dC.ac.maxdex = oShld[F$("ffShield")][1]}
  if (dC.ac.maxdex) {if (dC.ac.dex > dC.ac.maxdex) {dC.ac.dex = dC.ac.maxdex}}

  //Calculate all ACs
  if (dC.clss == "Monk") {
    dC.ac.monk = (dC.stat.Wis.tot > 11) ? aMod('Wis') : 0;
    dC.ac.monk += Math.floor(dC.lvl/5);
  } else {dC.ac.monk = 0;}
  dC.ac.tot = 10+dC.ac.dex+dC.ac.size+oArmr[F$("ffArmor")][0]+oShld[F$("ffShield")][0]+dC.ac.monk+natAc();
  dC.ac.touch = 10+dC.ac.dex+dC.ac.size+dC.ac.monk;
  dC.ac.flat = 10+oArmr[F$("ffArmor")][0]+oShld[F$("ffShield")][0]+dC.ac.monk+natAc();
  //Total max dex, ac check, spell fail
  dC.ac.check = oArmr[F$("ffArmor")][3]+oShld[F$("ffShield")][2];
  dC.ac.spell = oArmr[F$("ffArmor")][4]+oShld[F$("ffShield")][3];
}

function natAc() {
  if (oRc[dC.race].nAc) return oRc[dC.race].nAc;
  return 0;
}

function weapon(iW) {
  var wpnName = F$("ffWeapon"+iW);
  IH$("dWpn"+iW, "");
  if (wpnName) {
    dC.weapon.equip.other[iW] = weaponProf(wpnName);
    dC.weapon.equip.other[iW] += sizeMod(dC.size);

    if (oWpn[wpnName][6] != "r") {
      dC.weapon.equip.abil[iW] = aMod('Str');
    } else {
      dC.weapon.equip.abil[iW] = aMod('Dex');
      if (isComposite(wpnName)){
        if (aMod('Str') < compBonus(wpnName)) dC.weapon.equip.other[iW] += -2;
      }
    }

    for (var wf=1; wf<=dC.feat.length; wf++) {
      if (dC.feat[wf] == "Weapon Focus") {
        //I think this works to include composite bows as long as no other weapons are named the same as the beginning of any other weapon.
        if (dC.featA[wf] != "" && dC.featA[wf] == wpnName.substring(0,dC.featA[wf].length)) dC.weapon.equip.other[iW] += 1;
      }
    }
    if (dC.race == "Halfling" && oWpn[wpnName][7] == "t" && oWpn[wpnName][6] == "r") dC.weapon.equip.other[iW]++;
    //if not proficient in armor or shield, subtract AC check from atk (misc)
    if (!armorProf(F$("ffArmor"),"A")) dC.weapon.equip.other[iW] -= oArmr[F$("ffArmor")][3];
    if (F$("ffShield") == "Tower shield") dC.weapon.equip.other[iW] -= 2;
    if (!armorProf(F$("ffShield"),"S")) dC.weapon.equip.other[iW] -= oShld[F$("ffShield")][2];
    dC.weapon.equip.tot[iW] = dC.weapon.equip.abil[iW]+dC.baseAtk+dC.weapon.equip.other[iW];
    var wpnTbl = "<table class=\"ModTable\" id=\"W"+iW+"\"> \
  <thead><tr><td colspan=\"4\">Weapon</td><td>Abil</td><td>Base</td><td>Misc</td><td>Atk</td></tr></thead> \
  <tr><td colspan=\"4\">"+wpnName+"</td><td>"+fMod(dC.weapon.equip.abil[iW])+"</td><td>"+fMod(dC.baseAtk)+"</td><td>"+fMod(dC.weapon.equip.other[iW])+"</td><td>"+zMod(dC.weapon.equip.tot[iW])+"</td></tr> \
  <tr><td class=\"tL\">"+wpnRngTyp(wpnName)+"</td><td>"+wpnRng(wpnName)+"</td><td class=\"tL\">Dam</td><td>"+wpnDm(wpnName)+"</td><td class=\"tL\">Threat</td><td>"+oWpn[wpnName][3]+"</td><td class=\"tL\">Crit</td><td>"+oWpn[wpnName][4]+"</td></tr> \
</table>";
    IH$("dWpn"+iW, wpnTbl);
  }
  gold_tot();
}

function rchRng(wpnNm) {
  var baseRng = 5;
  if (dC.size == "l") baseRng = 10;
  if (oWpn[wpnNm][7] == "r") return baseRng*2+"'";
  return baseRng+"'";
}

function wpnRngTyp(wpnNm) {
  if (oWpn[wpnNm][7] == "t") return "Thrown";
  if (oWpn[wpnNm][6] == "r") return "Range";
  return "Reach";
}

function wpnRng(wpnNm) {
  if (oWpn[wpnNm][5]) return oWpn[wpnNm][5] + "'";
  return rchRng(wpnNm);
}

function wpnDm(wpnNm) {
  var wpnDam;
  var baseDam = oWpn[wpnNm][2];
  if (dC.clss == "Monk" && wpnNm == "Unarmed") baseDam = oWpnDam[oMnkUnArmd[dC.lvl]][dC.size];
  if (oWpn[wpnNm][6] != "r") {
    //melee
    if (baseDam.indexOf("/") > -1) {
      //double weapon
      aDam = baseDam.split("/")
      aDam[0] = oWpnDam[aDam[0]][dC.size];
      aDam[1] = oWpnDam[aDam[1]][dC.size];
      if (aMod('Str') > 0) {
        wpnDam = aDam[0] + fMod(aMod('Str')) + "/" + aDam[1] + fMod(Math.floor(aMod('Str')*.5));
      } else {
        wpnDam = aDam[0] + fMod(aMod('Str')) + "/" + aDam[1] + fMod(aMod('Str'));
      }
    } else {
      baseDam = oWpnDam[baseDam][dC.size];
      wpnDam = baseDam + fMod(aMod('Str'));
      //2-handed
      if (oWpn[wpnNm][6] == "2") {
        if (aMod('Str') > 0) {
          wpnDam = baseDam + fMod(Math.floor(aMod('Str')*1.5));
        } else {
          wpnDam = baseDam + fMod(Math.ceil(aMod('Str')*1.5));
        }
      }
    }
  } else {
    //ranged
    baseDam = oWpnDam[baseDam][dC.size];
    wpnDam = baseDam;
    if (oWpn[wpnNm][7] == "t") {wpnDam = baseDam + fMod(aMod('Str'))}
    else {
      if (isBow(wpnNm)) {
        if (isComposite(wpnNm)) {
          //var compPlus = wpnNm.substr(-1,1);
          //if (compPlus == "w") {compPlus = 0} else {compPlus = parseInt(compPlus)}
          var compPlus = compBonus(wpnNm);
          if (aMod('Str') < compPlus) compPlus = aMod('Str');
          wpnDam = baseDam + fMod(compPlus);
        } else {
          if (aMod('Str') < 0) {wpnDam = baseDam + fMod(aMod('Str'))}
        }
      }
    }
  }
  return wpnDam;
}

function isBow(wpnNm) {
  wpnNm = wpnNm.substr(0,17);
  switch (wpnNm) {
    case "Longbow":
    case "Shortbow":
    case "Composite longbow":
    case "Composite shortbo":
      return 1;
      break;
    default:
      return 0;
  }
}

function isComposite(wpnNm) {
  wpnNm = wpnNm.substr(0,10);
  if (wpnNm == "Composite ") return 1;
  return 0;
}

function compBonus(wpnNm) {
  var compPlus = wpnNm.substr(-1,1);
  if (compPlus == "w") {compPlus = 0} else {compPlus = parseInt(compPlus)}
  return compPlus;
}

function armorProf(armorName,armorType) {
  var blnArmor = false
  var genericArmor = ""
  if (armorName) {
    if (armorType == "A") {genericArmor = oArmr[armorName][1]
    } else {
      if (armorName != "Tower shield" && !!armorName) {genericArmor = "Shields"}
      if (armorName != "Buckler" && armorName != "Tower shield") {armorName += " shield"}
    }
    if (dC.prfArmor[0]) {
    for (aa=0;aa<dC.prfArmor.length;aa++) {
      if (dC.prfArmor[aa] == armorName || dC.prfArmor[aa] == genericArmor) {blnArmor = true; break}
    }}
  }
  return blnArmor;
}

function weaponProf(weaponName) {
  //deal with composite bows
  if (weaponName.substr(0,17) == "Composite longbow") weaponName = "Composite longbow";
  if (weaponName.substr(0,18) == "Composite shortbow") weaponName = "Composite shortbow";
  if (dC.weapon.prf.rc.length > 0 && !!weaponName) {
    //check for general proficiency
    if (dC.weapon.prf.rc[0] == "Simple" && oWpn[weaponName][0] == "s") return 0;
    if (dC.weapon.prf.rc[1] == "Martial" && oWpn[weaponName][0] == "m") return 0;
    //check for specific and feat-based proficiencies
    if (isInArray(weaponName, dC.weapon.prf.rc)) return 0;
    if (isInArray(weaponName, dC.weapon.prf.feat)) return 0;
  }
  return -4;
}

function addBonusLang(nameLang,a) {
  if (!isInArray(nameLang,a)) a[a.length] = nameLang;
  return a;
}

function getBonusLang() {
  var aTmpBl;
  if (oRc[dC.race].bLng.length == 0) {aTmpBl = aLang} else {
    aTmpBl = oRc[dC.race].bLng;
    switch (dC.clss) {
      case "Wizard" :
        aTmpBl = addBonusLang("Draconic",aTmpBl); break;
      case "Druid" :
        aTmpBl = addBonusLang("Sylvan",aTmpBl); break;
      case "Cleric" :
        aTmpBl = addBonusLang("Abyssal",aTmpBl);
        aTmpBl = addBonusLang("Celestial",aTmpBl);
        aTmpBl = addBonusLang("Infernal",aTmpBl);
    }
  }
  return aTmpBl;
}

function spoken_lang(rclFlg) {
  //if race selected, then add standard languages
  idCLang = $("cLang");
  if (dC.race) {
    aBonusLang = getBonusLang();
    dC.lang.bonus = [];
    for (var ii=0;ii<aBonusLang.length;ii++) {
      if (F$("ffLang"+aBonusLang[ii])) {
        if (F$("ffLang"+aBonusLang[ii])) {
          dC.lang.bonus[dC.lang.bonus.length] = aBonusLang[ii];
          if (dC.lang.bonus.length >= aMod('Int')) break;
        }
      }
    }
    dC.lang.spoken = oRc[dC.race].lng;
    //if Int selected, then allow for bonus languages
    if (dC.stat.Int.tot > 11) {
      var strBonusLang = "";
      idCLang.style.display = "block";
      flagBonusLang = dC.race;
      for (ii=0;ii<aBonusLang.length;ii++) {
        makeChecked = ""
        makeDisabled = ""
        if (isInArray(aBonusLang[ii], dC.lang.bonus)) makeChecked = " checked=\"checked\"";
        if (isInArray(aBonusLang[ii], dC.lang.skill)) makeDisabled = " disabled=\"disabled\"";
        strBonusLang+=" <input type=\"checkbox\" name=\"ffLang"+aBonusLang[ii]+"\""+makeChecked+makeDisabled+" onclick=\"spoken_lang(1)\" \/>" + aBonusLang[ii]
        if (ii % 3 == 0) {strBonusLang+="<br />"}
      }
      IH$("lBonusLang", strBonusLang);
      if (aMod('Int') > 1) {IH$("pBonusLang","s")} else {IH$("pBonusLang", "")}
      IH$("nBonusLang", aMod('Int'));
    }
    else {idCLang.style.display = "none";flagBonusLang = ""}
    if (rclFlg) {dspAll(rclFlg)}
  }
  else {
    idCLang.style.display = "none"; flagBonusLang = ""
  }
  sel_skils();
}

function encumber() {
  if (dC.stat.Str.base) {
    dC.mload = encSize(aMLoad[dC.stat.Str.tot]) + "lbs "
    dC.hload = encSize(aHLoad[dC.stat.Str.tot]) + "lbs "
  } else {dC.mload = ""; dC.hload = ""}
}

function encSize(encMed) {
  var encMod = encMed;
  var encCoef = 1;
  switch (dC.size) {
    case "m":
      return encMod;
      break;
    case "s":
      encCoef = .75;
      break;
    case "l":
      encCoef = 2;
      break;
  }
  aEnc = encMod.split("-")
  encMod = Math.round(aEnc[0]*encCoef) + "-" + Math.round(aEnc[1]*encCoef);
  return encMod;
}

function list_skills() {
  var abilTot, abilMod, abilAcMod;
  var skillList = "<table class=\"ModTable\" id=\"tSkl\"><thead><tr><td>Skill Name</td><td>Abil</td><td>Rnk</td><td>AC</td><td>Msc</td><td>Tot</td></tr></thead>"+String.fromCharCode(10,13)
  for (iSkl in oSkl) {
    if (oSkl[iSkl][0] == "u" || (oSkl[iSkl][0] == "t" && !!dC.skills[iSkl])) {
      abilTot = aMod(oSkl[iSkl][1]);
      abilMod = fMod(abilTot);
      abilAcMod = dC.ac.check*oSkl[iSkl][2];
      if (iSkl == "Open Lock" || iSkl == "Ride" || iSkl == "Use Rope") {
        abilAcMod = 0;
        if (!armorProf(F$("ffArmor"),"A")) {abilAcMod = oArmr[F$("ffArmor")][3]}
        if (!armorProf(F$("ffShield"),"S")) {abilAcMod += oShld[F$("ffShield")][2]}
      }
      if (abilAcMod > 0) {abilTot=abilTot-abilAcMod;abilAcMod=abilAcMod*-1} else {abilAcMod=""}
      //get racial bonuses
      abilRace = 0
      if (dC.race) {
        for (var rr=0;rr<oRc[dC.race].bSkill.length;rr++) {
          aTmpRSB = oRc[dC.race].bSkill[rr].split("+");
          if (aTmpRSB[0] == iSkl) {abilRace = parseInt(aTmpRSB[1]); break;}
        }
        //get size bonuses
        if (iSkl == "Hide") {
          switch (dC.size) {
            case "s":
              abilRace += 4;
              break;
            case "l":
              abilRace -= 4;
          }
        }
      }

      //Get Feat bonuses
      for (ff=1;ff<4;ff++) {
        feat_name = F$("ffFeat"+ff);
        if (feat_name) {
          if (oFts[feat_name][5]) {
            aTmpSkl = oFts[feat_name][5].split(";")
            for (var ss=0;ss<aTmpSkl.length;ss++) {
              aTmpSklMod = aTmpSkl[ss].split("+")
              if (aTmpSklMod[0] == "Skill") {aTmpSklMod[0] = F$("ffFeat"+ff+"a");}
              if (aTmpSklMod[0] == iSkl) {abilRace+=parseInt(aTmpSklMod[1])}
            }
          }
        }
      }
      if (abilRace > 0) {abilTot+=abilRace} else {abilRace=""}
      if (dC.skills[iSkl]) abilTot+=dC.skills[iSkl];
      skillList += "<tr><td>"+iSkl+" ("+oSkl[iSkl][1]+")</td><td>"+abilMod+"</td><td>"+fMod(dC.skills[iSkl])+"</td><td>"+abilAcMod+"</td><td>"+fMod(abilRace)+"</td><td>"+fMod(abilTot)+"</td></tr>"+String.fromCharCode(10,13)
    }
  }
  $("dSk").innerHTML = skillList + "</table>"
}

function sel_skils() {
  var skillsList = "<select name=\"ffTSkill\">"
  for (iSkl in oSkl) {
    if (iSkl != "Craft" && iSkl != "Perform" && iSkl != "Speak Language") {
      skillsList += "<option value=\""+iSkl+"\">"+iSkl+"</option>"
    }
  }
  if (dC.clss == "Barbarian") {skillsList += "<option value=\"Read/Write\">Read/Write</option>"}
  //add spoken language skills
  for (var oo=0; oo<aLang.length; oo++) {
    if (!isInArray(aLang[oo], dC.lang.spoken) && !isInArray(aLang[oo], dC.lang.bonus)) {skillsList += "<option value=\"Speak "+aLang[oo]+"\">Speak "+aLang[oo]+"</option>"}
  }
  $("lSkills").innerHTML = skillsList + "</select>";
}

function cSkill(csSkill) {
  if (oCls[dC.clss][4].length == 0) return true;
  var sklType = csSkill.substr(0,6);
  var genericSkill;
  switch (sklType) {
    case "Speak ":
      genericSkill = "Speak Language"; break;
    case "Craft ":
      genericSkill = "Craft"; break;
    case "Knowle":
      genericSkill = "Knowledge"; break;
    default:
      genericSkill = "";
  }
  if (genericSkill) {
    return (isInArray(csSkill, oCls[dC.clss][4]) || isInArray(genericSkill, oCls[dC.clss][4])) ? true : false;
  } else {
    return isInArray(csSkill, oCls[dC.clss][4]);
  }
}

function skilInfo(skilName) {
  var aSkil = [];
  if (cSkill(skilName)) {
    aSkil[0] = 1; aSkil[1] = 3+dC.lvl;
  } else {
    aSkil[0] = 2; aSkil[1] = 1+Math.ceil(dC.lvl/2);
  }
  if (oRc[dC.race].clsSkls) {
    if (isInArray(skilName, oRc[dC.race].clsSkls)) {
      aSkil[0] = 2;
      if (oRc[dC.race].lvl) aSkil[1] += oRc[dC.race].lvl;
    } else {
      //Add racial class skills
      if (oRc[dC.race].lvl) aSkil[1] += Math.floor(oRc[dC.race].lvl/2);
    }
  }
  return aSkil;
}

function buySkil(cost, chng) {
  if ((F$("ffSkillT") >= cost && chng == 1) || (F$("ffSkillS") >= cost && chng == -1)) return true;
  return false;
}

function needSkil(skilName, maxRank, valChng) {
  if (skilName == "Read/Write") {
    return (valChng == 1) ? !dC.brbrnRdWrt : dC.brbrnRdWrt;
  } else if (skilName.substr(0,6) == "Speak ") {
    var lngName = skilName.substr(6);
    if (valChng == 1) {
      return !isInArray(lngName, dC.lang.skill);
    } else {
      return !!isInArray(lngName, dC.lang.skill);
    }
  } else {
    if (valChng == 1) {
      if (dC.skills[skilName]) {
        return (dC.skills[skilName] < maxRank);
      } else {
        return true;
      }
    } else {
      return !!dC.skills[skilName];
    }
  }
}

function train_skill(chgVal, lstSkl) {
  var skillName = F$("ffTSkill");
  var aSi = skilInfo(skillName);
  var maxRank = aSi[1];
  var costSkil = aSi[0];
  if (buySkil(costSkil, chgVal)) {
    if (needSkil(skillName, maxRank, chgVal)) {
      var iTmpS = F$("ffSkillS");
      if (skillName == "Read/Write") {
        dC.brbrnRdWrt = (!dC.brbrnRdWrt);
        stat_class(1);
      } else if (skillName.substr(0,6) == "Speak ") {
        var lngName = skillName.substr(6);
        if (chgVal > 0) {
          dC.lang.skill.push(lngName);
          if (objF["ffLang"+lngName]) objF["ffLang"+lngName].disabled = true;
        } else {
          dC.lang.skill.splice(inArray(lngName, dC.lang.skill),1);
          if (objF["ffLang"+lngName]) objF["ffLang"+lngName].disabled = false;
        }
        dspLang();
      } else {
        if (dC.skills[skillName]) {
          dC.skills[skillName] += chgVal;
        } else {
          dC.skills[skillName] = 1;
        }
        if (dC.skills[skillName] <= 0) delete dC.skills[skillName];
        if (lstSkl) list_skills();
      }
      iTmpS = iTmpS+chgVal*costSkil;
      objF.ffSkillS.value = iTmpS;
      objF.ffSkillT.value = F$("ffSkillP")-iTmpS;
    }
  }
}

function isValidFeat(featName, iFeat, featType) {
  var fp, aTmpAbil;
  if (featType != "r" && featType != oFts[featName][7]) return false;
  if (dC.clss == "Monk" && featName == "Improved Unarmed Strike") return false;
  if (dC.clss == "Wizard" && featName == "Scribe Scroll") return false;
  //find out if all prereqs for the feat are met
  if (featName.indexOf("Proficiency") < 0) {
    if (oFts[featName][1]) {
      aTmpAbil = oFts[featName][1].split(";");
      for (fp=0;fp<aTmpAbil.length;fp++) {
        if (!existFeat(aTmpAbil[fp])) return false;
      }
    }
  }
  if (oFts[featName][2]) {
    aTmpAbil = oFts[featName][2].split(";");
    for (fp=0;fp<aTmpAbil.length;fp++) {
      aTmpStat = aTmpAbil[fp].split(":");
      if (dC.stat[aTmpStat[0]].tot < parseInt(aTmpStat[1])) return false;
    }
  }
  if (oFts[featName][3]) {
    aTmpAbil = oFts[featName][3].split(";")
    for (fp=0;fp<aTmpAbil.length;fp++) {
      aTmpStat = aTmpAbil[fp].split(":")
      switch (aTmpStat[0]) {
        case "Caster" :
          if (dC.clss != "Wizard" && dC.clss != "Sorcerer" && dC.clss != "Bard" && dC.clss != "Cleric" && dC.clss != "Druid") {return false;}
          else {if (parseInt(aTmpStat[1]) > dC.lvl) return false;}
          break;
        case "Attack" :
          if (parseInt(aTmpStat[1]) > dC.baseAtk) return false;
          break;
        case "Fighter" :
          if (dC.clss != "Fighter" || parseInt(aTmpStat[1]) > dC.lvl) return false;
          break;
        case "Wizard" :
          if (dC.clss != "Wizard" || parseInt(aTmpStat[1]) > dC.lvl) return false;
          break;
        case "Turning" :
          if (dC.clss != "Cleric" && (dC.clss != "Paladin" && dC.lvl < 4)) return false;
          break;
        case "Arcane" :
          if (dC.clss != "Wizard" && dC.clss != "Sorcerer") return false;
          else {if (parseInt(aTmpStat[1]) > dC.lvl) return false;}
          break;
      }
    }
  }
  //if (aTmpFeat[4] != "") {
    //so far, ride for mounted combat is the only one
    //validFeat = false
  //}
  //don't display armor and weapon profs if the character already has them
  switch (featName) {
    case "Simple Weapon Proficiency" :
      if (dC.weapon.prf.rc[0] == "Simple") return false; break;
    case "Martial Weapon Proficiency" :
      if (dC.weapon.prf.rc[1] == "Martial") return false; break;
    case "Armor Proficiency (light)" :
      if (armrProf("Light") && dC.feat[iFeat] != "Armor Proficiency (light)") return false; break;
    case "Armor Proficiency (medium)" :
      if (!armrProf("Light")) return false;
      if (armrProf("Medium") && dC.feat[iFeat] != "Armor Proficiency (medium)") return false; break;
    case "Armor Proficiency (heavy)" :
      if (!armrProf("Medium")) return false;
      if (armrProf("Heavy") && dC.feat[iFeat] != "Armor Proficiency (heavy)") return false; break;
    case "Shield Proficiency" :
      if (armrProf("Shields") && dC.feat[iFeat] != "Shield Proficiency") return false; break;
    case "Tower Shield Proficiency" :
      //debug("TS: "+armrProf("Tower shield"));
      if (!armrProf("Shields")) return false;
      if (armrProf("Tower shield") && dC.feat[iFeat] != "Tower Shield Proficiency") return false;
  }
  //Only display those that have not been selected unless they are stackable
  for (fp=1;fp<=dC.feat.length;fp++) {if (featName == dC.feat[fp] && fp != iFeat && !oFts[featName][9]) return false;}
  return true;
}

function selFeat(featNum, featType) {
  var optCount = 0;
  var featTypeDesc;
  switch (featType) {
    case "f":
      featTypeDesc = "Select a fighter bonus feat"; break;
    case "w":
      featTypeDesc = "Select a wizard bonus feat"; break;
    default:
      featTypeDesc = "Select a feat"; break;
  }
  var oSel = document.createElement("select");
  oSel.setAttribute("name","ffFeat"+featNum);
  oSel.setAttribute("id","ffFeat"+featNum);
  oSel.onchange = recalc_all;
  oSel.options[0] = new Option(featTypeDesc,"",false,false);
  for (var ff in oFts) {
    if (isValidFeat(ff, featNum, featType)) {
      ++optCount;
      oSel.options[optCount] = new Option(ff,ff,false,false);
    }
  }
  $("dFeats").appendChild(oSel);
  S$(dC.feat[featNum], "ffFeat"+featNum);
}

function selSubFeat(featNum, subType) {
  var optCount = 0;
  var featTypeDesc = "Select a weapon";
  var aSf = oWpn;
  switch (subType) {
    case "s" :
      featTypeDesc = "Select a skill";
      aSf = oSkl;
      sbFtChck = function(sfN) {return (oSkl[sfN][0] == "u" || (oSkl[sfN][0] == "t" && !!dC.skills[sfN]))}
      break;
    case "p" :
      sbFtChck = function(sfN) {return (weaponProf(sfN) == 0 && sfN.substr(-2,1) != "+")}
      break;
    case "e" :
      sbFtChck = function(sfN) {return (((weaponProf(sfN) == -4 || sfN == dC.featA[featNum]) && oWpn[sfN][0] == "e") && !((sfN == "Bastard sword" || sfN == "Dwarven waraxe") && dC.stat.Str.tot < 13))}
      break;
    case "n" :
      sbFtChck = function(sfN) {return ((weaponProf(sfN) == -4 && oWpn[sfN][0] == "m") || sfN == dC.featA[featNum])}
      break;
  }
  var oSel = document.createElement("select");
  oSel.setAttribute("name","ffFeat"+featNum+"a");
  oSel.setAttribute("id","ffFeat"+featNum+"a");
  oSel.setAttribute("class","sbFt");
  oSel.onchange = recalc_all;
  oSel.options[0] = new Option(featTypeDesc,"",false,false);
  for (var ff in aSf) {
    if (sbFtChck(ff)) {
      ++optCount;
      oSel.options[oSel.length] = new Option(ff,ff,false,false);
    }
  }
  $("dFeats").appendChild(oSel);
  S$(dC.featA[featNum], "ffFeat"+featNum+"a");
}

function bldArray(aAr, aVal, aI) {
  for (var ii=0; ii<aI; ii++) {
    aAr[aAr.length] = aVal;
  }
  return aAr;
}

function make_feats(initFlg) {
  var aSelFts = ["r"];
  //if (dC.race == "Human") aSelFts = bldArray(aSelFts, "r", 1);
  if (oRc[dC.race].feats) aSelFts = bldArray(aSelFts, "r", oRc[dC.race].feats);
  var bnsFts = Math.floor(dC.lvl/3);
  aSelFts = bldArray(aSelFts, "r", bnsFts);
  if (F$("ffClass") == "Fighter") {
    bnsFts = Math.floor(dC.lvl/2)+1;
    aSelFts = bldArray(aSelFts, "f", bnsFts);
  }
  if (F$("ffClass") == "Wizard") {
    bnsFts = Math.floor(dC.lvl/5);
    aSelFts = bldArray(aSelFts, "w", bnsFts);
  }

  /*if (initFlg) {
    debug("feat 1q: "+Q$("f1"));
  } else {
    //debug("feat 1: "+$("ffFeat1").value/*document.forms[0]["ffFeat1"].value);
    debug(F$("ffFeat1"));
  }*/
  if (initFlg) {
    for (var cc=1; cc<=aSelFts.length; cc++) {dC.feat[cc] = Q$("f"+cc); dC.featA[cc] = Q$("f"+cc+"a");}
  } else {
    for (var cc=1; cc<=aSelFts.length; cc++) {dC.feat[cc] = F$("ffFeat"+cc); dC.featA[cc] = F$("ffFeat"+cc+"a");}
  }
  //debug(dC.feat[1])
  IH$("dFeats", "");
  for (var mm=1;mm<=aSelFts.length;mm++) {
    selFeat(mm, aSelFts[mm-1]);
    if (dC.feat[mm]) {
      subFeatType = oFts[dC.feat[mm]][8];
      if (subFeatType) {
        selSubFeat(mm, subFeatType);
      }
    }
  }
}

function armrProf(profName) {
  var blnProf = false
  for (pp=0;pp<dC.prfArmor.length;pp++) {if (profName == dC.prfArmor[pp]) {blnProf=true;break;}}
  return blnProf;
}

function displayFeats() {
  dispFeat("1",!!dC.clss)
  dispFeat("2",objF.ffRace.value == "Human")
  dispFeat("3",dC.clss == "Fighter" || dC.clss == "Monk")
}

function dispFeat(feat_num,on_or_off) {
  objTmpFeat = $("Feat"+feat_num)
  if (on_or_off) {objTmpFeat.style.display = "block"
  } else {objTmpFeat.selectedIndex = 0; objTmpFeat.style.display = "none"}
}

function recalc_all(rclFlg) {
  dC = dCalc;
  if (rclFlg == undefined) rclFlg = 1;
  assign_stat_all(); stat_race(rclFlg)
  //Total Stats
  for (var ii in dC.stat) {
    dC.stat[ii].tot = dC.stat[ii].base+dC.stat[ii].race;
    if (ii == "Int") {if (!!dC.stat[ii].base && dC.stat[ii].tot < 3) {dC.stat[ii].tot = 3}}
    dC.stat[ii].mod = fMod(aMod(ii));
  }
  stat_class(rclFlg); make_feats(0);
  dC.save.fort.tot = dC.save.fort.base+dC.save.fort.misc+dC.save.fort.clss;
  dC.save.rflx.tot = dC.save.rflx.base+dC.save.rflx.misc+dC.save.rflx.clss;
  dC.save.will.tot = dC.save.will.base+dC.save.will.misc+dC.save.will.clss;
  armor(); move(); encumber();
  //IH$("dWpn1", "");
  //IH$("dWpn2", "");
  //IH$("dWpn3", "");
  for (ww=1;ww<4;ww++) {weapon(ww)}
  dC.weapon.prf.tot = dC.weapon.prf.rc.concat(dC.weapon.prf.feat);
  //bonus languages
  spoken_lang(rclFlg);
  if (document.search != "" && blnLoad) {
    for (var ll=0;ll<6;ll++) {if (Q$("bl"+ll)) {objF["ffLang"+Q$("bl"+ll)].checked=true;}}
  }
  get_name(); list_skills(); sel_skils(); blnLoad = false; dspAll(rclFlg);
}

function get_name() {
  var nameChar = F$("ffName");
  $("dName").innerHTML = nameChar;
  var sepTitle = "";
  if (nameChar) sepTitle = " - ";
  document.title = "D&D Character Calculator" + sepTitle + nameChar;
}
function quick_dsp(dspName) {$("d"+dspName).innerHTML = F$("ff"+dspName);}
function height_dsp() {
  var tmpHeight = F$("ffHeight");
  if (!tmpHeight) {
    IH$("dHeight", "");
  } else {
    IH$("dHeight", parseInt(tmpHeight/12) + "' " + tmpHeight % 12 + "\"");
  }
}
function gold_tot() {
  var shieldCost, weaponCost, totCost = 0;
  if (dC.clss) {
    shieldCost = (F$("ffShield")) ? oShld[F$("ffShield")][4] : 0;
    weaponCost = 0;
    for (var gg=1;gg<4;gg++) {weaponCost += (F$("ffWeapon"+gg)) ? oWpn[F$("ffWeapon"+gg)][8] : 0;}
    totCost = oArmr[F$("ffArmor")][5] + shieldCost + weaponCost;
  }
  //Calculate encumberance
  dC.enc = oArmr[F$("ffArmor")][6];
  if (F$("ffShield")) {dC.enc += oShld[F$("ffShield")][5]}
  for (gg=1;gg<4;gg++) {if (F$("ffWeapon"+gg)) dC.enc += oWpn[F$("ffWeapon"+gg)][9];}
  IH$("dGp", totCost+"gp")
  IH$("dEnc", dC.enc)
}

function dspLang() {
  var strLang = "";
  dC.lang.tot = addArray(dC.lang.spoken, dC.lang.bonus, dC.lang.skill);
  if (dC.clss == "Druid") dC.lang.tot[dC.lang.tot.length] = "Druidic";
  strLang = dC.lang.tot.join(", ");
  IH$("dLang",strLang);
}

function addArray() {
  var a = [];
  for (var ii = 0; ii<arguments.length; ii++) {
    if (isArray(arguments[ii])) {
      for (var jj = 0; jj<arguments[ii].length; jj++) {
        a[a.length] = arguments[ii][jj];
      }
    } else {
      if (arguments[ii]) {
        a[a.length] = arguments[ii];
      }
    }
  }
  return a;
}

function isArray(o) {
  if (o.constructor.toString().indexOf("Array") > -1) return true;
  return false;
}

function lvlAdjust() {
  if (oRc[dC.race].lvlAdjust) return oRc[dC.race].lvlAdjust;
  return 0;
}

function dspAll(rclFlg) {
  if (rclFlg) {
  var spcAblLst = "";
  if (dC.race) {IH$("dRace", dC.race+"&nbsp;");}
  else {IH$("dRace", "");}
  IH$("dClass", dC.clss);
  height_dsp(); quick_dsp('Weight'); quick_dsp('Age'); quick_dsp('Hair'); quick_dsp('Eyes')
  IH$("dAlign1",F$("ffAlign1")); IH$("dAlign2",F$("ffAlign2"))
  IH$("dEcl",dC.lvl+lvlAdjust());
  IH$("dDeity",F$("ffDeity")); IH$("dHP",dC.hp); IH$("dInit",dC.init)
  IH$("dMLoad",dC.mload); IH$("dHLoad",dC.hload); IH$("dSpeed",dC.speed+"'"); IH$("dRun",dC.run+"'"); //IH$("dGp",dC.gp+"gp")
  gold_tot(); dspLang();
  for (var ii in dC.stat) {IH$("dBase"+ii,dC.stat[ii].base);IH$("dRace"+ii,dC.stat[ii].race);IH$("dTot"+ii,dC.stat[ii].tot);IH$("dMod"+ii,dC.stat[ii].mod);}
  IH$("stFortB",fMod(dC.save.fort.base)); IH$("stFortR",fMod(dC.save.fort.misc)); IH$("stFortC",fMod(dC.save.fort.clss)); IH$("stFortT",fMod(dC.save.fort.tot));
  IH$("stRefB",fMod(dC.save.rflx.base)); IH$("stRefR",fMod(dC.save.rflx.misc)); IH$("stRefC",fMod(dC.save.rflx.clss)); IH$("stRefT",fMod(dC.save.rflx.tot));
  IH$("stWillB",fMod(dC.save.will.base)); IH$("stWillR",fMod(dC.save.will.misc)); IH$("stWillC",fMod(dC.save.will.clss)); IH$("stWillT",fMod(dC.save.will.tot));
  //armor
  IH$("dAcType",oArmr[F$("ffArmor")][1]); IH$("dAcArmor",fMod(oArmr[F$("ffArmor")][0]+natAc())); IH$("dAcShield",fMod(oShld[F$("ffShield")][0])); IH$("dAcMod",fMod(dC.ac.dex))
  IH$("dAcSize",fMod(dC.ac.size)); IH$("dAcMonk",fMod(dC.ac.monk)); IH$("dAcTot",dC.ac.tot); IH$("dAcTouch",dC.ac.touch); IH$("dAcFlat",dC.ac.flat)
  IH$("dAcCheck",oArmr[F$("ffArmor")][3]); IH$("dAcSpell",oArmr[F$("ffArmor")][4])
  IH$("dSAcCheck",oShld[F$("ffShield")][2]); IH$("dSAcSpell", oShld[F$("ffShield")][3])
  IH$("dTAcCheck",dC.ac.check); IH$("dTAcSpell",dC.ac.spell)
  if (oArmr[F$("ffArmor")][2] != 9) {IH$("dAcMaxDex",oArmr[F$("ffArmor")][2])} else {IH$("dAcMaxDex","")}
  if (oShld[F$("ffShield")][1] != 9) {IH$("dSAcMaxDex",oShld[F$("ffShield")][1])} else {IH$("dSAcMaxDex","")}
  if (dC.ac.maxdex != 9) {IH$("dTAcMaxDex",dC.ac.maxdex)} else {IH$("dTAcMaxDex","")}
  IH$("ArmorName",dspLabel(F$("ffArmor"),"armor")); IH$("ArmorShield",F$("ffShield")); IH$("ArmorAll",dC.ac.bothName)
  //weapons
  //IH$("dWpn1","");
  //IH$("dWpn2","");
  //IH$("dWpn3","");
  for (ii=1;ii<4;ii++) {
    //IH$("dW"+ii+"Stat",fMod(dC.weapon.equip.abil[ii]));
    //IH$("dW"+ii+"Class",fMod(dC.baseAtk));
    //IH$("dW"+ii+"Other",fMod(dC.weapon.equip.other[ii]));
    //IH$("dW"+ii+"Tot",zMod(dC.weapon.equip.tot[ii]))
    weapon(ii);
  }
  //abilities - Weapon Proficiencies, Armor Proficiencies, Racial, Class, Feats
  spcAblLst = "<ul>";
  spcAblLst += "<li><strong>Weapons:</strong> "+dC.weapon.prf.tot.join(", ")+"</li>";
  if (dC.prfArmor.length > 0) spcAblLst += "<li><strong>Armor:</strong> "+dC.prfArmor.join(", ")+"</li>";
  //Spells
  spcAblLst += getSpls(dC.clss, dC.lvl);
  spcAblLst += spllsKnown(dC.clss, dC.lvl);
  spcAblLst += "</ul>"
  //Add racial, class and feats
  dC.abil.tot = dC.abil.race;
  dC.abil.tot = dC.abil.tot.concat(dC.abil.clss);
  var tmpFtNm;
  for (ii=1; ii<=dC.feat.length; ii++) {
    tmpFtNm = dC.feat[ii];
    if (tmpFtNm) {
      if (dC.featA[ii]) tmpFtNm += " ("+dC.featA[ii]+")"
      dC.abil.tot.push(tmpFtNm);
    }
  }
  spcAblLst += "<table id=\"saTable\"><tr><td><ul>"
  for (ii=0;ii<dC.abil.tot.length/2;ii++) {spcAblLst+="<li>"+dC.abil.tot[ii]+"</li>"}
  spcAblLst+="</td><td><ul>"
  for (ii=parseInt((dC.abil.tot.length+1)/2);ii<dC.abil.tot.length;ii++) {spcAblLst+="<li>"+dC.abil.tot[ii]+"</li>"}
  spcAblLst+="</ul></td></tr><table>"
  IH$("specAbilities",spcAblLst);
  }
}

function get_link() {
  var qs = [];
  qs[qs.length] = "n="+F$("ffName"); qs[qs.length] = "r="+dC.race;
  qs[qs.length] = "c="+dC.clss; qs[qs.length] = "g="+F$("ffSex"); qs[qs.length] = "l="+dC.lvl;
  qs[qs.length] = "d="+F$("ffDeity"); qs[qs.length] = "a1="+F$("ffAlign1"); qs[qs.length] = "a2="+F$("ffAlign2");
  for (var ii=0; ii<6; ii++) {qs[qs.length] = "s"+ii+"v="+F$("ffStat"+ii); qs[qs.length] = "s"+ii+"s="+F$("ffStatSel"+ii);}
  qs[qs.length] = "a="+F$("ffArmor");
  qs[qs.length] = "sh="+F$("ffShield");
  for (ii=1; ii<4; ii++) {qs[qs.length] = "w"+ii+"="+F$("ffWeapon"+ii);}
  if (dC.race && dC.stat.Int.tot > 11) {
    aBl = getBonusLang(); var langNum = 0;
    for (ii=0; ii<aBl.length; ii++) {
      if (F$("ffLang"+aBl[ii])) {langNum+=1; qs[qs.length] = "bl"+langNum+"="+aBl[ii];}
    }
  }
  //Skills
  var strSkil = "";
  for (ii in dC.skills) {strSkil = cDel(strSkil,ii+":"+dC.skills[ii])}
  qs[qs.length] = "k="+strSkil;
  //Language skills
  var strSkil = ""
  for (ii = 0; ii<dC.lang.skill.length; ii++) {strSkil = cDel(strSkil,dC.lang.skill[ii])}
  qs[qs.length] = "kl="+strSkil;
  if (dC.brbrnRdWrt) qs[qs.length] = "rw=1";
  //Feats
  for (ii=1; ii<=dC.feat.length; ii++) {qs[qs.length] = "f"+ii+"="+F$("ffFeat"+ii); qs[qs.length] = "f"+ii+"a="+F$("ffFeat"+ii+"a");}
  qs[qs.length] = "h="+F$("ffHeight"); qs[qs.length] = "w="+F$("ffWeight");
  qs[qs.length] = "ag="+F$("ffAge"); qs[qs.length] = "hr="+F$("ffHair"); qs[qs.length] = "ey="+F$("ffEyes");
  alert("After the page finishes reloading, bookmark it to save your work.")
  location = location.href.substring(0,location.href.indexOf('?')) + "?" + qs.join("&");
}
function debug(debugMsg) {if (debugMsg) $("debug").innerHTML += "<br />"+debugMsg;}
function getSpls(cstrType, cstrLvl) {
  var aSpl = []; var aSplBase, keyStat, splType, ii;
  switch (cstrType) {
    case "Cleric":
    case "Druid":
      aSplBase = aSplCrlc; keyStat = "Wis"; splType = "Divine"
      break;
    case "Sorcerer":
      aSplBase = aSplSorc; keyStat = "Cha"; splType = "Arcane";
      break;
    case "Bard":
      aSplBase = aSplBard; keyStat = "Cha"; splType = "Arcane";
      break;
    case "Wizard":
      aSplBase = aSplWiz; keyStat = "Int"; splType = "Arcane";
      break;
    case "Paladin":
    case "Ranger":
      aSplBase = aSplPalRang; keyStat = "Wis"; splType = "Divine";
      break;
    case "Adept":
      aSplBase = aSplAdept; keyStat = "Wis"; splType = "Divine";
      break;
    default:
      return "";
  }
  //Add abil bonus
  for (ii=0; ii<aSplBase[cstrLvl].length; ii++) {
    if (dC.stat[keyStat].tot >= ii+10) {
      aSpl[ii] = aSplBase[cstrLvl][ii]+bnsSpl(aMod(keyStat), ii);
    } else {
      aSpl[ii] = 0;
    }
  }
  var lSpl = lstSplls(aSpl);
  if (lSpl) lSpl = "<li><strong>"+splType+" Spells/Day:</strong> " + lSpl + "</li>";
  return lSpl;
}

function spllsKnown(cstrType, cstrLvl) {
  var aSplBase, aSpl
  aSpl = [];
  if (cstrType == "Sorcerer") {
    aSplBase = aSplKnwnSorc[cstrLvl];
  } else if (cstrType == "Bard") {
    aSplBase = aSplKnwnBard[cstrLvl];
  } else {
    return "";
  }
  for (ii=0; ii<aSplBase.length; ii++) {
    if (dC.stat.Cha.tot >= ii+10) {
      if (cstrType == "Bard") {
        if ((aSplBard[cstrLvl][ii]+bnsSpl(aMod("Cha"), ii)) > 0) {
          aSpl[ii] = aSplBase[ii];
        } else {
          aSpl[ii] = 0;
        }
      } else {
        aSpl[ii] = aSplBase[ii];
      }
    } else {
      aSpl[ii] = 0;
    }
  }
  var lSpl = lstSplls(aSpl);
  if (lSpl) lSpl = "<li><strong>Spells Known:</strong> " + lSpl + "</li>";
  return lSpl;
}

function lstSplls(aSplLst) {
  var strSpl = "";
  for (ii=0; ii<aSplLst.length; ii++) {
    if (aSplLst[ii]) {
      if (strSpl != "") strSpl += ", ";
      strSpl += "Lvl&nbsp;"+ii+":&nbsp;"+aSplLst[ii];
    }
  }
  return strSpl;
}

function bnsSpl(splMod, splLvl) {
  if (splLvl < 1) return 0;
  var rsltSpl = Math.ceil((splMod-splLvl+1)/4);
  if (rsltSpl < 1) rsltSpl = 0;
  return rsltSpl;
}
