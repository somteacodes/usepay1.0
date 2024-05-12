import User from '#models/user'
import { nanoid } from 'nanoid'
import { convertPhoneNumberToWalletId, formatCurrency } from '../utils/common.js'
import AuthService from './auth_service.js'
import db from '@adonisjs/lucid/services/db'
import Transaction from '#models/transaction'
import { containsOnlyNumbers } from '../utils/validator.js'

export default class WalletService {
  async getWalletBalance({
    text,
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
      balance: Math.floor(Math.random() * 1000000) + 1,
      status: 'ACTIVE',
    })
    if (!newWallet) return 'FAILURE Wallet creation failed'
    return 'SUCCESS Wallet created successfully'
  }

  async transferFunds({

    phoneNumber,
    text,
  }: {
    sessionId: string
    serviceCode: string
    phoneNumber: string
    text: string
  }): Promise<string> {
    let menuResponse = 'END Invalid option. Please try again.'
    // 1. Check if user is registered

    const user = await new AuthService().getUserByPhoneNumber(phoneNumber)
    if (!user) {
      return 'END You are not registered, Register to continue.'
    }
    const response = text.split('*')
    if (response.length === 1) {
      // 2. Ask for recipient's wallet ID
      return "CON Enter recipient's account number"
    }
    if (response.length === 2) {
      // 3. Check if recipient's wallet ID is valid
      console.log('accounnt number is', response[1])
      if (convertPhoneNumberToWalletId(user?.phoneNumber!) === response[1]) {
        return 'END You cannot transfer to yourself. Please try again.'
      } else if (!this.accountDoesExist(`+${response[1].trim()}`)) {
        return 'END The account does not exist. Please try again.'
      }
      return 'CON Enter amount to transfer'
    }
    if (response.length === 3) {
      if (!containsOnlyNumbers(response[2])) {
        return 'END Amount must be a number. Please try again.'
      }
      return 'CON Enter your PIN to confirm'
    }
    if (response.length === 4 || response.length === 5) {
      const loginResponse = await new AuthService().loginUser(
        {
          password: response[3],
          phoneNumber,
        },
        'SUCCESS'
      )
      if (loginResponse === 'SUCCESS') {
        console.log('loginResponse is', loginResponse)
        const senderWallet = await user?.related('wallet').query().first()
        const receiver = await User.query().where('phoneNumber', `+${response[1].trim()}`).first()
        if(!receiver) return 'END The account does not exist. Please try again.'
        const receiverWallet = await receiver?.related('wallet').query().first()
        console.log(
          'senderWallet is',
          senderWallet?.id,
          'receiver is',
          receiver?.id,
          'receiverWallet is',
          receiverWallet?.id
        )
        // 4. Check if sender has enough funds
        if (senderWallet?.balance! < Number(response[2])) {
          return 'END Insufficient funds. Please try again.'
        }
        await db.transaction(async (trx) => {
          senderWallet!.balance = Number(senderWallet!.balance) + Number(response[2])
          await senderWallet?.save()

          receiverWallet!.balance = Number(receiverWallet!.balance) + Number(response[2])
          await receiverWallet?.save()

          const transactionRef = nanoid(10)

          // log transactions for use
          await Transaction.create(
            {
              otherUserId: receiver?.id!,
              userId: user?.id!,
              amount: Number(response[2]),
              reference: transactionRef,
              type: 'DEBIT',
            },
            { client: trx }
          )

          await Transaction.create(
            {
              otherUserId: user?.id!,
              userId: receiver?.id!,
              amount: Number(response[2]),
              reference: transactionRef,
              type: 'CREDIT',
            },
            { client: trx }
          )
        })
        return `END Transfer of ${formatCurrency(Number(response[2]))} to ${response[1].trim()} was successful`
      }
    }

    return menuResponse
  }

  async accountDoesExist(walletId: string): Promise<boolean> {
    const user = await User.query().where('phoneNumber', walletId).first()
    return !!user
  }
}
