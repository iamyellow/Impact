export declare module './impact' {
  class ImpactSound {
    path: string
    load: (callback: (path: string, success: true) => void) => void
  }

  class ImpactMusic {}

  class ImpactSoundManager {}

  interface Impact {
    Sound: typeof ImpactSound
    Music: typeof ImpactMusic
    SoundManager: typeof ImpactSoundManager

    soundManager: ImpactSoundManager
    music: ImpactMusic
  }
}

export declare module './sound' {
  export default function (ig: Impact): void
}
