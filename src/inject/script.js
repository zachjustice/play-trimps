console.log('script.js')
let prevLivingSpace = null;
var playTrimps = true;

playGame()

function playGame() {
	buyStuff = setInterval(() => {
    if(playTrimps) {
  		let bestLivingSpace = buyLivingSpace()
  		buyBuildings()
  		buyTrimps()
      // buyUpgrades();
      buyMyEquipment()

      if(!prevLivingSpace || bestLivingSpace.building != prevLivingSpace.building) {
        console.log(`${new Date} Best Living Space ${bestLivingSpace.building}`)
        prevLivingSpace = bestLivingSpace;
      }
    }

	}, 200);
}

function buyLivingSpace() {

    let bestLivingSpace = chooseBestLivingSpace();

		if(canAffordBuilding(bestLivingSpace.building)) {
			buyBuilding(bestLivingSpace.building)
			console.log(`${new Date} bought ${bestLivingSpace.building}`)

      // fire all trimps to redistribute
      fireAllTrimps()
		}

    return bestLivingSpace;
}

function chooseBestLivingSpace() {

		let livingSpacePrices = [
		{
			'building': 'Hut',
  		'foodPrice': getBuildingItemPrice(game.buildings.Hut, 'food', false, 1),
  		'woodPrice': getBuildingItemPrice(game.buildings.Hut, 'wood', false, 1),
      'metalPrice': 0,
			'foodPerTrimp': getBuildingItemPrice(game.buildings.Hut, 'food', false, 1) / game.buildings.Hut.increase.by
		},
		{
			'building': 'House',
  		'foodPrice': getBuildingItemPrice(game.buildings.House, 'food', false, 1),
  		'woodPrice': getBuildingItemPrice(game.buildings.House, 'wood', false, 1),
  		'metalPrice': getBuildingItemPrice(game.buildings.House, 'metal', false, 1),
			'foodPerTrimp': getBuildingItemPrice(game.buildings.House, 'food', false, 1) / game.buildings.House.increase.by
		},
		{
			'building': 'Hotel',
  		'foodPrice': getBuildingItemPrice(game.buildings.Hotel, 'food', false, 1),
  		'woodPrice': getBuildingItemPrice(game.buildings.Hotel, 'wood', false, 1),
  		'metalPrice': getBuildingItemPrice(game.buildings.Hotel, 'metal', false, 1),
			'foodPerTrimp': getBuildingItemPrice(game.buildings.Hotel, 'food', false, 1) / game.buildings.Hotel.increase.by
		},
    {
			'building': 'Mansion',
  		'foodPrice': getBuildingItemPrice(game.buildings.Mansion, 'food', false, 1),
  		'woodPrice': getBuildingItemPrice(game.buildings.Mansion, 'wood', false, 1),
  		'metalPrice': getBuildingItemPrice(game.buildings.Mansion, 'metal', false, 1),
			'foodPerTrimp': getBuildingItemPrice(game.buildings.Mansion, 'food', false, 1) / game.buildings.Mansion.increase.by
		},
    {
			'building': 'Resort',
  		'foodPrice': getBuildingItemPrice(game.buildings.Resort, 'food', false, 1),
  		'woodPrice': getBuildingItemPrice(game.buildings.Resort, 'wood', false, 1),
  		'metalPrice': getBuildingItemPrice(game.buildings.Resort, 'metal', false, 1),
			'foodPerTrimp': getBuildingItemPrice(game.buildings.Resort, 'food', false, 1) / game.buildings.Resort.increase.by
    }]


		let bestLivingSpace = livingSpacePrices[0]
		for(let livingSpace of livingSpacePrices) {
			if(livingSpace.foodPerTrimp < bestLivingSpace.foodPerTrimp && !game.buildings[livingSpace.building].locked) {
				bestLivingSpace = livingSpace;
			}
		}

    return bestLivingSpace;
}

function buyBuildings() {
    let bestLivingSpace = chooseBestLivingSpace();
		if((bestLivingSpace.foodPrice > game.resources.food.max || game.resources.food.max <= game.resources.food.owned)
      && canAffordBuilding('Barn')
      && !game.buildings.Barn.locked) {
      console.log(`${new Date} Bought Barn`)
			buyBuilding('Barn')
		}

		if ((bestLivingSpace.woodPrice > game.resources.wood.max || game.resources.wood.max <= game.resources.wood.owned)
      && canAffordBuilding('Shed')
      && !game.buildings.Shed.locked) {
      console.log(`${new Date} Bought Shed`)
			buyBuilding('Shed')
		}

		if ((bestLivingSpace.metalPrice > game.resources.metal.max || game.resources.metal.max <= game.resources.metal.owned)
      && canAffordBuilding('Forge')
      && !game.buildings.Forge.locked) {
      console.log(`${new Date} Bought Forge`)
			buyBuilding('Forge')
		}

		if(game.resources.food.owned - getBuildingItemPrice(game.buildings.Tribute, 'food', false, 1) > bestLivingSpace.foodPrice
      && canAffordBuilding('Tribute')
       && !game.buildings.Tribute.locked) {
      console.log(`${new Date} Bought Tribute`)
			buyBuilding('Tribute')
		}
}

function buyUpgrades() {
}

function fireAllTrimps() {
    numTab('6');
    if (!game.global.firing) {
      fireMode();
    }

    ["Farmer", "Lumberjack", "Miner", "Scientist"].forEach((j) => buyJob(j))

    numTab('1');

    if (game.global.firing) {
      fireMode();
    }
}

function buyTrimps() {
  let bestLivingSpace = chooseBestLivingSpace();
	let trimpsUnemployed = Math.ceil(game.resources.trimps.realMax() / 2) - game.resources.trimps.employed
	if(trimpsUnemployed > 0) {
    // fireAllTrimps()
		buyJob('Scientist')
		trimpsUnemployed--
    let ownedFood = game.resources.food.owned;
    let ownedMetal = game.resources.metal.owned;
    let ownedWood = game.resources.wood.owned;

    let foodPrice = Math.max(bestLivingSpace.foodPrice - ownedFood, 0);
    let woodPrice = Math.max(bestLivingSpace.woodPrice - ownedWood, 0);
    let metalPrice = Math.max(bestLivingSpace.metalPrice - ownedMetal, 0);

		let totalCost = Math.max(foodPrice + woodPrice + metalPrice, 1);
		let foodRatio = foodPrice / totalCost;
		let woodRatio = woodPrice / totalCost;
		let metalRatio = metalPrice / totalCost;

		let trimpsToBuy = {
			'foodTrimps': Math.round(trimpsUnemployed * foodRatio),
			'woodTrimps': Math.round(trimpsUnemployed * woodRatio),
			'metalTrimps': Math.round(trimpsUnemployed * metalRatio)
		}

    console.log(`${new Date} buying trimps`, trimpsToBuy);

		while(trimpsToBuy.foodTrimps || trimpsToBuy.woodTrimps || trimpsToBuy.metalTrimps) {
			if(trimpsToBuy.foodTrimps > 0) {
				buyJob('Farmer')
				trimpsToBuy.foodTrimps--
			}

			if(trimpsToBuy.woodTrimps > 0) {
				buyJob('Lumberjack')
				trimpsToBuy.woodTrimps--
			}

			if(trimpsToBuy.metalTrimps > 0) {
				trimpsToBuy.metalTrimps--
				buyJob('Miner')
			}
		}
	}
}

// buy equipment if we have metal for the mansion
function buyMyEquipment() {
  let bestLivingSpace = chooseBestLivingSpace();
  let timeout = 100

  let equipmentValue = {
    "Shield" : game.equipment.Shield.blockCalculated / getBuildingItemPrice(game.equipment.Shield, 'wood', true, 1),

    "Dagger" : getWeaponAttackPerMetal("Dagger"),
    "Mace" : getWeaponAttackPerMetal("Mace"),
    "Polearm" : getWeaponAttackPerMetal("Polearm"),
    "Battleaxe" : getWeaponAttackPerMetal("Battleaxe"),
    "Greatsword" : getWeaponAttackPerMetal("Greatsword"),

    "Boots" : getArmorHealthPerMetal("Boots"),
    "Helmet" : getArmorHealthPerMetal("Helmet"),
    "Pants" : getArmorHealthPerMetal("Pants"),
    "Shoulderguards" : getArmorHealthPerMetal("Shoulderguards"),
    "Breastplate" : getArmorHealthPerMetal("Breastplate"),
  }

  Object.keys(game.equipment)
    .sort((equipment) => equipmentValue[equipment])
    .forEach((equipment) => {
      let equipmentResource = equipment === 'Shield' || bestLivingSpace.building === 'Hut' ? 'wood' : 'metal';
      let resourceOwned = game.resources[equipmentResource].owned;
      let equipmentPrice = 0;
      let buildingResourcePrice = 0;

      if(equipmentResource in game.equipment[equipment].cost) {
        equipmentPrice = getBuildingItemPrice(game.equipment[equipment], equipmentResource, true, 1);
        buildingResourcePrice = getBuildingItemPrice(game.buildings[bestLivingSpace.building], equipmentResource, false, 1)
      }

      if (!game.equipment[equipment].locked
        && canAffordEquipment(game.equipment[equipment])
        && (resourceOwned - equipmentPrice > buildingResourcePrice)) {
          console.log(`${new Date} bought ${equipment}`)
          buyEquipment(equipment);
          tooltip('hide');
      }
    })

}

function getWeaponAttackPerMetal(weapon) {
  return game.equipment[weapon].attackCalculated / getBuildingItemPrice(game.equipment[weapon], 'metal', true, 1)
}

function getArmorHealthPerMetal(armor) {
  return game.equipment[armor].healthCalculated / getBuildingItemPrice(game.equipment[armor], 'metal', true, 1)
}

function canAffordEquipment(equipment) {
  for(let resource in equipment.cost) {
    let equipmentPrice = getBuildingItemPrice(equipment, resource, true, 1)
    if (equipmentPrice > game.resources[resource].owned) {
      return false;
    }
  }

  return true;
}

function getTrimpIncrease(building) {
  return game.buildings[building].increase.by
}

function togglePlayTrimps() {
  playTrimps = !playTrimps;
}



// list of things to buy
// current gloal
// round robin place trimps on each resource
