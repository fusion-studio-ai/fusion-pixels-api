import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getServerStatusMessage(): string {
    return 'Server is running'
  }
}
