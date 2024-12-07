import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class InscriptionService {
    private readonly unisatApiKey: string;
    private readonly baseUrl = 'https://open-api-fractal.unisat.io/v1';

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.unisatApiKey = this.configService.get<string>('UNISAT_API_KEY');
    }

    private async makeRequest<T>(method: string, endpoint: string, data?: any): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                Authorization: `Bearer ${this.unisatApiKey}`,
            },
        };

        try {
            const response = method === 'GET'
                ? await firstValueFrom(this.httpService.get<T>(url, config))
                : await firstValueFrom(this.httpService.post<T>(url, data, config));

            return response.data;
        } catch (error) {
            console.error(`UniSat API error: ${error.message}`);
            throw error;
        }
    }

    async verifyInscriptionOwnership(
        inscriptionId: string,
        ownerAddress: string
    ): Promise<boolean> {
        const data = await this.makeRequest<any>(
            'GET',
            `/indexer/inscription/${inscriptionId}`
        );
        return data.data.address === ownerAddress;
    }

    async getInscriptionPrice(inscriptionId: string): Promise<any> {
        const data = await this.makeRequest<any>(
            'GET',
            `/indexer/inscription/${inscriptionId}/price`
        );
        return data.data;
    }

    async getTokenPrice(tokenId: string): Promise<any> {
        const data = await this.makeRequest<any>(
            'GET',
            `/cat20-dex/getTokenPrice?tokenId=${tokenId}`
        );
        return data.data;
    }

    async getInscriptionUtxo(inscriptionId: string) {
        const data = await this.makeRequest<any>(
            'GET',
            `/indexer/inscription/${inscriptionId}/utxo`
        );
        return data.data;
    }

    async createTransferInscription(
        inscriptionId: string,
        fromAddress: string,
        toAddress: string
    ): Promise<{ unsignedTx: string; utxo: any }> {
        // Step 1: Get inscription UTXO
        const utxo = await this.getInscriptionUtxo(inscriptionId);
        
        // Step 2: Create unsigned transaction
        const txData = await this.makeRequest<any>(
            'POST',
            '/indexer/tx/create',
            {
                inputs: [{
                    txId: utxo.txId,
                    outputIndex: utxo.outputIndex,
                    satoshis: utxo.satoshis,
                    address: fromAddress,
                    inscriptionId: inscriptionId
                }],
                outputs: [{
                    address: toAddress,
                    satoshis: utxo.satoshis - 1000, // Subtract fee
                }],
            }
        );

        return {
            unsignedTx: txData.data.psbt,
            utxo,
        };
    }

    async createCat20Transfer(
        tokenId: string,
        fromAddress: string,
        toAddress: string,
        amount: string
    ): Promise<string> {
        const data = await this.makeRequest<any>(
            'POST',
            '/cat20-dex/createTransfer',
            {
                tokenId,
                fromAddress,
                toAddress,
                amount,
            }
        );
        return data.data.psbt;
    }

    async broadcastTransaction(signedTx: string): Promise<string> {
        const data = await this.makeRequest<any>(
            'POST',
            '/indexer/tx/broadcast',
            {
                tx: signedTx,
            }
        );
        return data.data.txId;
    }
}