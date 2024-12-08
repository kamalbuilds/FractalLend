import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PriceData } from '@/types/lending.types';

@Injectable()
export class InscriptionService {
    private readonly unisatApiKey: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.unisatApiKey = this.configService.get<string>('UNISAT_API_KEY');
    }

    async verifyInscriptionOwnership(
        inscriptionId: string,
        ownerAddress: string
    ): Promise<boolean> {
        const url = `https://open-api-fractal.unisat.io/v1/indexer/inscription/${inscriptionId}`;
        
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(url, {
                    headers: {
                        Authorization: `Bearer ${this.unisatApiKey}`,
                    },
                })
            );

            return data.data.address === ownerAddress;
        } catch (error) {
            console.error('Error verifying inscription ownership:', error);
            return false;
        }
    }

    async createTransferInscription(
        inscriptionId: string,
        fromAddress: string,
        toAddress: string
    ) {
        // Step 1: Get inscription UTXO
        const utxo = await this.getInscriptionUtxo(inscriptionId);
        
        // Step 2: Create unsigned transaction
        const unsignedTx = await this.createUnsignedTransferTx(
            utxo,
            fromAddress,
            toAddress
        );

        return {
            unsignedTx,
            utxo,
        };
    }

    private async getInscriptionUtxo(inscriptionId: string) {
        const url = `https://open-api-fractal.unisat.io/v1/indexer/inscription/${inscriptionId}/utxo`;
        
        const { data } = await firstValueFrom(
            this.httpService.get(url, {
                headers: {
                    Authorization: `Bearer ${this.unisatApiKey}`,
                },
            })
        );

        return data.data;
    }

    private async createUnsignedTransferTx(
        utxo: any,
        fromAddress: string,
        toAddress: string
    ) {
        const url = `https://open-api-fractal.unisat.io/v1/indexer/tx/create`;
        
        const { data } = await firstValueFrom(
            this.httpService.post(url, {
                inputs: [{
                    txId: utxo.txId,
                    outputIndex: utxo.outputIndex,
                    satoshis: utxo.satoshis,
                    address: fromAddress,
                }],
                outputs: [{
                    address: toAddress,
                    satoshis: utxo.satoshis - 1000, // Subtract fee
                }],
            }, {
                headers: {
                    Authorization: `Bearer ${this.unisatApiKey}`,
                },
            })
        );

        return data.data;
    }

    async getInscriptionPrice(tokenId: string): Promise<PriceData> {
        const url = `https://open-api-fractal.unisat.io/v1/cat20-dex/getTokenPrice?tokenId=${tokenId}`;
        
        const { data } = await firstValueFrom(
            this.httpService.get(url, {
                headers: {
                    Authorization: `Bearer ${this.unisatApiKey}`,
                },
            })
        );

        return data.data;
    }
} 
