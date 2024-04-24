import UssdService from '#services/ussd_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class UssdsController {
  async index({ request, response }: HttpContext) {
    let { sessionId, serviceCode, phoneNumber, text } = request.body()
    response.header('Content-Type', 'text/plain')
    return new UssdService().index({ sessionId, serviceCode, phoneNumber, text })
  }
}
