export default class UssdService {
  async startMenu({
    sessionId,
    serviceCode,
    phoneNumber,
    text,
  }: {
    sessionId: string
    serviceCode: string
    phoneNumber: string
    text: string
  }): Promise<string> {
    console.log(sessionId, serviceCode, phoneNumber, text)
    let menuResponse = 'CON What would you like to do?\n'
    menuResponse += '1. Transfer Funds\n'
    menuResponse += '2. Check Balance\n'
    menuResponse += '3. Create Account\n'
    return menuResponse
  }
}
