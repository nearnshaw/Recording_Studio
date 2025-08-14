import { } from '@dcl/sdk/math'
import { AvatarShape, AvatarModifierArea, engine, Transform, TextShape} from '@dcl/sdk/ecs'
import { triggerEmote } from '~system/RestrictedActions'
import { getSpreadsheetData } from './scheduler'


export async function updateBannerText(){
  const jsonData = await getSpreadsheetData()
  console.log(jsonData)
  if(jsonData){
    
    const name = jsonData[0].NowPlaying
    const bannerText = engine.getEntityOrNullByName("Banner_Text")
    if (bannerText) {
      console.log("NAME ON SPREADSHEET: ", name)
      TextShape.getMutable(bannerText).text = name
    }

  }

}


export function main() {

  updateBannerText()
  

  const dispenser = engine.getEntityOrNullByName("dispenser")
  if (dispenser) {


    const wearable = engine.addEntity()

    Transform.create(wearable, {
      position: { x: 0, y: 1, z: 0 },
      scale: { x: 2, y: 2, z: 2 },
      parent: dispenser,
    })

    AvatarShape.create(wearable, {
      id: '',
      emotes: [],
      wearables: [ 'urn:decentraland:matic:collections-v2:0x90e5cb2d673699be8f28d339c818a0b60144c494:0'],
      expressionTriggerId: 'clap',
      expressionTriggerTimestamp:0,
      showOnlyWearables: true,
    })

    // Create clap emote system that triggers every 2 seconds
    let clapTimer = 0
    engine.addSystem((dt: number) => {
      clapTimer += dt
      
      if (clapTimer >= 2) { // 2 seconds
        // Trigger the clap emote
        AvatarShape.getMutable(wearable).expressionTriggerTimestamp =+ 1 
        
        clapTimer = 0 // Reset timer
      }
    })

   
  }


}
