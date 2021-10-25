export declare module './impact' {
  type ImpactSound = {}
  type ImpactMusic = {}
  type ImpactSoundManager = {}

  interface Impact {
    Sound: ImpactClass<ImpactSound>
    Music: ImpactClass<ImpactMusic>
    SoundManager: ImpactClass<ImpactSoundManager>

    soundManager: ImpactSoundManager
    music: ImpactMusic
  }
}

export declare module './sound' {
  export default function (ig: Impact): void
}
