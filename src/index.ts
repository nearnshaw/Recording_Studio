import { Quaternion } from '@dcl/sdk/math'
import { AvatarShape, AvatarModifierArea, engine, Transform, TextShape, Entity, VideoPlayer, pointerEventsSystem, InputAction, Material} from '@dcl/sdk/ecs'
import { openExternalUrl, triggerEmote } from '~system/RestrictedActions'
import { getSpreadsheetData, jsonData } from './scheduler'
import { syncEntity } from '@dcl/sdk/network'
import { getTriggerEvents, getActionEvents } from '@dcl/asset-packs/dist/events'

export async function updateFromSpreadsheet(spreadsheetIndex: number = 0){
  const jsonData = await getSpreadsheetData()
  console.log(jsonData)
  if(jsonData){
    
    // Update Banner Text
    const name = jsonData[spreadsheetIndex].NowPlaying
    const bannerText = engine.getEntityOrNullByName("Banner_Text")
    if (bannerText) {
      console.log("NAME ON SPREADSHEET: ", name)
      TextShape.getMutable(bannerText).text = "Now playing: " + name
    }
    const dispenser = engine.getEntityOrNullByName("dispenser")

    // Update wearabe on dispenser
    if (wearable && dispenser) {

      // swap wearabe
      AvatarShape.createOrReplace(wearable, {
        id: '',
        emotes: [],
        wearables: [ jsonData[spreadsheetIndex].WearableURN?jsonData[spreadsheetIndex].WearableURN : []],
        expressionTriggerId: 'idle',
        expressionTriggerTimestamp:0,
        showOnlyWearables: true,
      })

      // offset wearable
      const wearableTransform = Transform.getMutable(wearable)
      wearableTransform.position.y = jsonData[spreadsheetIndex].WearableOffset? jsonData[spreadsheetIndex].WearableOffset : 0
      wearableTransform.scale.x = jsonData[spreadsheetIndex].WearableScaleMult? jsonData[spreadsheetIndex].WearableScaleMult : 1.5
      wearableTransform.scale.y = jsonData[spreadsheetIndex].WearableScaleMult? jsonData[spreadsheetIndex].WearableScaleMult : 1.5
      wearableTransform.scale.z = jsonData[spreadsheetIndex].WearableScaleMult? jsonData[spreadsheetIndex].WearableScaleMult : 1.5
      
      // link
      pointerEventsSystem.onPointerDown(
          {
            entity: dispenser,
            opts: { button: InputAction.IA_PRIMARY, hoverText: 'Buy Wearable' },
          },
          function () {
            openExternalUrl({url: jsonData[spreadsheetIndex].BuyURL?jsonData[spreadsheetIndex].BuyURL : ""})
          }
      )   
    }

    // Change video URL
    const videoScreen = engine.getEntityOrNullByName("Video Screen")
    if (videoScreen) {

      VideoPlayer.createOrReplace(videoScreen, {
        src: jsonData[spreadsheetIndex].VideoURL?jsonData[spreadsheetIndex].VideoURL : "",
        playing: true,
        loop: true,
      })
      

      
    }

  }

}

let wearable: Entity | null = null
let currentIndex: number = 0

export function main() {

  // fetch data from spreadsheet and update scene
  updateFromSpreadsheet(0)

  // listen for switch artist button
  const switchArtist = engine.getEntityOrNullByName("Switch Artist")
  if (switchArtist) {
    const actions = getActionEvents(switchArtist)
		actions.on('Next', () => {
      currentIndex++
      if(currentIndex >= jsonData.length){
        currentIndex = 0
      }
			updateFromSpreadsheet(currentIndex)
		})

    actions.on('Previous', () => {
      currentIndex--
      if(currentIndex < 0){
        currentIndex = jsonData.length - 1
      }
			updateFromSpreadsheet(currentIndex)
		})
  }

  // listen for dispenser
  const dispenser = engine.getEntityOrNullByName("dispenser")
  if (dispenser) {


    wearable = engine.addEntity()

    Transform.create(wearable, {
      position: { x: 14, y: 0, z: 12 },
      scale: { x: 1.5, y: 1.5, z: 1.5 },
      rotation: Quaternion.fromEulerDegrees(0, 270, 0),
      //parent: dispenser,
    })

    AvatarShape.create(wearable, {
      id: '',
      emotes: [],
      wearables: [ 'urn:decentraland:matic:collections-v2:0x90e5cb2d673699be8f28d339c818a0b60144c494:0'],
      expressionTriggerId: '',
      expressionTriggerTimestamp:0,
      showOnlyWearables: true,
    })

    syncEntity(wearable, [Transform.componentId, AvatarShape.componentId])  
  }


}
