// Types for LightRays.jsx, which is React Bits' component exactly as delivered.
import type { ComponentType, CSSProperties } from 'react'

export type LightRaysProps = {
  raysOrigin?:
    'top-center' | 'top-left' | 'top-right' | 'right' | 'left' | 'bottom-center' | 'bottom-right' | 'bottom-left'
  raysColor?: string
  raysSpeed?: number
  lightSpread?: number
  rayLength?: number
  rayDensity?: number
  tilt?: number
  raySharpness?: number
  glow?: number
  haze?: number
  atmosphere?: number
  intensity?: number
  pulsating?: boolean
  fadeDistance?: number
  saturation?: number
  followMouse?: boolean
  mouseInfluence?: number
  cursorShadow?: boolean
  clickPulse?: boolean
  noiseAmount?: number
  distortion?: number
  intro?: boolean
  lightMode?: boolean
  opacity?: number
  maxDevicePixelRatio?: number
  className?: string
  style?: CSSProperties
}

declare const LightRays: ComponentType<LightRaysProps>
export default LightRays
