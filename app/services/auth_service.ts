import User from '#models/user'
import hash from '@adonisjs/core/services/hash'
import WalletService from './wallet_service.js'
import { confirmPIN, containsOnlyAlphabets, validatePIN } from '../utils/validator.js'

export default class AuthService {
  async loginUser(
    {
      password,
      phoneNumber,
    }: {
      password: string
      phoneNumber: string
    },
    successMessage: string
  ): Promise<string> {
    const user = await User.findBy('phoneNumber', phoneNumber)
    if (!user) {
      return 'END You are not registered, Register to continue.'
    } else {
      //start password/pin challange verification      
      
      if (await hash.verify(user.password, password)) {
        return successMessage
      } else {
        return 'END Invalid login credentials. Please try again.'
      }
    }
  }

  async registerUser({
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
    const user = await this.getUserByPhoneNumber(phoneNumber)
    if (user) {
      return 'END You are already registered.'
    }
    const response = text.split('*')
    if (response.length === 1) {
      return 'CON Enter your first name\n'
    }
    if (response.length === 2) {
      if (!containsOnlyAlphabets(response[1])) {
        return 'END Invalid first name. Please try again.'
      }
      return 'CON Enter your last name\n'
    }
    if (response.length === 3) {
      if (!containsOnlyAlphabets(response[2])) {
        return 'END Invalid last name. Please try again.'
      }
      return 'CON Create a PIN, must be 6 to 8 digits. \n'
    }
    if (response.length === 4) {
      if (!validatePIN(response[3])) {
        return 'END Invalid PIN. Please try again.'
      }
      return 'CON Confirm your PIN\n'
    }
    if (response.length === 5) {
      if (!confirmPIN(response[3], response[4])) {
        return 'END PINs do not match. Please try again.'
      }
      console.log(response[1], response[2], phoneNumber, response[3].trim())
      return this.createNewUser({
        firstName: response[1],
        lastName: response[2],
        phoneNumber,
        password: response[3].trim(),
      })
    }
    return 'END Registration failed. Please try again.'
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await hash.verify(hashedPassword, password)
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return await User.findBy('phoneNumber', phoneNumber)
  }

  async createNewUser({
    firstName,
    lastName,
    phoneNumber,
    password,
  }: {
    firstName: string
    lastName: string
    phoneNumber: string
    password: string
  }): Promise<string> {
    const newUser = new User()
    newUser.phoneNumber = phoneNumber
    newUser.firstName = firstName
    newUser.lastName = lastName
    newUser.password = password
    await newUser.save()
    const createWallet = await new WalletService().createNewWallet(newUser)
    if (createWallet.startsWith('FAILURE')) {
      return 'END Wallet creation failed'
    }
    return 'END Registration successful'
  }
}
