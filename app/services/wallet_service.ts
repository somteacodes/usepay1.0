import User from '#models/user'

export default class WalletService {
  async getWalletBalance({
    text,
    sessionId,
    serviceCode,
    phoneNumber,
  }: {
    text: string
    sessionId: string
    serviceCode: string
    phoneNumber: string
  }): Promise<string> {
    let menuResponse = 'END Invalid selection\n. Please try again'

    return text
  }

  async createNewWallet(user: User): Promise<string> {
    const newWallet = user.related('wallet').create({
      balance: 0,
      status: 'ACTIVE',
    })
    if (!newWallet) return 'FAILURE Wallet creation failed'
    return 'SUCCESS Wallet created successfully'
  }
}
