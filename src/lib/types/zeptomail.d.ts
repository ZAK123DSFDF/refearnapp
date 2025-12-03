declare module "zeptomail" {
  export interface ZeptoAddress {
    address: string
    name?: string
  }

  export interface ZeptoRecipient {
    email_address: ZeptoAddress
  }

  export interface ZeptoAttachment {
    content?: string
    mime_type?: string
    name: string
    file_cache_key?: string
  }

  export interface ZeptoInlineImage {
    mime_type?: string
    content?: string
    cid: string
    file_cache_key?: string
  }

  export interface ZeptoMailData {
    from: ZeptoAddress
    to: ZeptoRecipient[]

    reply_to?: ZeptoAddress[]

    cc?: ZeptoRecipient[]
    bcc?: ZeptoRecipient[]

    subject: string

    textbody?: string
    htmlbody?: string

    track_clicks?: boolean
    track_opens?: boolean

    client_reference?: string

    mime_headers?: Record<string, string>

    attachments?: ZeptoAttachment[]
    inline_images?: ZeptoInlineImage[]
  }

  export interface ZeptoConfig {
    url: string
    token: string
  }

  export class SendMailClient {
    constructor(config: ZeptoConfig)

    sendMail(data: ZeptoMailData): Promise<{
      message_id?: string
      request_id?: string
      status?: string
    }>
  }
}
