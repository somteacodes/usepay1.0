import AuthService from '#services/auth_service'
import UssdService from '#services/ussd_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class UssdsController {
  async index({ request, response }: HttpContext) {
    let { sessionId, serviceCode, phoneNumber, text } = request.body()
    response.header('Content-Type', 'text/plain')
    if (!text) {
      return new UssdService().startMenu({ sessionId, serviceCode, phoneNumber, text })
    }
    if (text.startsWith('1')) {
      return 'CON Enter the phone number you want to transfer to\n'
    }
    if (text.startsWith('2')) {
      return 'END Your balance is 1000\n'
    }
    if (text.startsWith('3')) {
      return new AuthService().registerUser({
        sessionId,
        serviceCode,
        phoneNumber,
        text,
      })
    }
  }
}
