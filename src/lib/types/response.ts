export type ActionResult<T> =
  | {
      ok: true
      data: T
      redirectUrl?: string
      toast?: string
      message?: string
    }
  | {
      ok: false
      error: string
      status: number
      toast?: string
      redirectUrl?: string
      data?: any
    }
export type MutationData =
  | Omit<Extract<ActionResult<any>, { ok: true }>, "data">
  | Extract<ActionResult<any>, { ok: false }>
