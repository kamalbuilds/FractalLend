import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VaultConfigService {
    constructor(private configService: ConfigService) {}

    getVaultAddress(): string {
        return this.configService.get<string>('VAULT_ADDRESS');
    }
} 