import User from '#models/user'
import { formatCurrency } from '../utils/common.js'
import AuthService from './auth_service.js'

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
    const user = await new AuthService().getUserByPhoneNumber(phoneNumber)
    if (!user) {
      return 'END You are not registered, Register to continue.'
    }
    const response = text.split('*')
    if (response.length === 1) {
      return 'CON Enter your PIN to continue\n'
    }
    if (response.length === 2 || response.length === 3) {
      const loginResponse = await new AuthService().loginUser(
        {
          password: response[1],
          phoneNumber,
        },
        'SUCCESS'
      )
      if (loginResponse === 'SUCCESS') {
        const userWallet = await user.related('wallet').query().first()
        if (!userWallet) {
          return 'END Wallet not found'
        }
        return `END Your balance is ${formatCurrency(userWallet.balance)}`
      } else {
        return loginResponse
      }
    }
    return 'END Invalid input. Please try again.'
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
