declare module "zeptomail" {
  export class SendMailClient {
    constructor(config: { url: string; token: string })
    sendMail(data: any): Promise<any>
  }
}
