/*
 * Generic response interface for API actions
 */
export interface GenericResponse {
  /** Indicates if the request was successful */
  ok: boolean
  /** Message describing the request result */
  message: string
}
