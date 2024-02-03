import { Injectable } from '@angular/core';
window.Buffer = window.Buffer || require('buffer').Buffer;
import {
    clusterApiUrl,
    Connection,
    PublicKey,
    Keypair,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    transfer,
    Account,
    getMint,
    getAccount,
} from '@solana/spl-token';
import * as bs58 from 'bs58';
import { environment } from 'environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class SolanaServicesService {
    connectedPublicKey: any;
    provider: any;
    connection: any;
    fromWallet: any;
    toWallet: any;
    fromTokenAccount: Account;
    mint: PublicKey;
    balance: any;
    publicKey;
    constructor(private _httpClient: HttpClient) {
        // Generate a new wallet keypair and airdrop SOL

        // Public Key to your Phantom Wallet
        const isPhantomInstalled = window.phantom?.solana?.isPhantom;
        if (isPhantomInstalled) {
            this.fromWallet = Keypair.fromSecretKey(
                bs58.decode(
                    '2uNUjcwtokbkjuZWHTvNX3BuAsF3f8ZgMVcyMGxRQCJktjCKckjJLbgUTnW1F5NWuKU1HC2jKpjgZ2iv737mSkvX'
                )
            );
            this.connection = new Connection(
                clusterApiUrl('devnet'),
                'confirmed'
            );
            this.publicKey = new PublicKey(
                '5J3mK5wYkNY67QLyM3WLyyse6JuGgbDRd3qFEeJxtXmV'
            );
            this.getProvider();
            this.connectWallet();
            this.keyFromLocalStorage();
        }

        this.getSplInfo();
    }
    async keyFromLocalStorage() {
        this.connectWallet();
        this.toWallet = new PublicKey(localStorage.getItem('publicKeywallet'));
    }

    async getSplInfo() {
        return this._httpClient
            .get<any>(environment.apiUrl + 'sol/splinfo')
            .subscribe(async (response) => {
                if (response != null) {
                    this.mint = new PublicKey(response.mint);
                    this.fromTokenAccount =
                        await getOrCreateAssociatedTokenAccount(
                            this.connection,
                            this.fromWallet,
                            this.mint,
                            this.fromWallet.publicKey
                        );
                }
            });
    }

    async createToken() {
        // Create new token mint
        this.mint = await createMint(
            this.connection,
            this.fromWallet,
            this.fromWallet.publicKey,
            null,
            9 // 9 here means we have a decmial of 9 0's
        );
        // Get the token account of the fromWallet address, and if it does not exist, create it
        this.fromTokenAccount = await getOrCreateAssociatedTokenAccount(
            this.connection,
            this.fromWallet,
            this.mint,
            this.fromWallet.publicKey
        );
        return true;
    }
    async mintToken() {
        // Mint 1 new token to the "fromTokenAccount" account we just created
        try {
            const signature = await mintTo(
                this.connection,
                this.fromWallet,
                this.mint,
                this.fromTokenAccount.address,
                this.fromWallet.publicKey,
                1000000000000000000000 // 10 billion
            );
            return this._httpClient
                .post<any>(environment.apiUrl + 'sol/splinfo', {
                    mint: this.mint,
                    fromTokenAccount: this.fromTokenAccount.address,
                })
                .subscribe((response) => {});
        } catch (error) {
            console.error('Error occurred:', error);
        }
    }

    async checkBalance() {
        // get the supply of tokens we have minted into existance
        const mintInfo = await getMint(this.connection, this.mint);

        // get the amount of tokens left in the account
        const tokenAccountInfo = await getAccount(
            this.connection,
            this.fromTokenAccount.address
        );
        this.balance = tokenAccountInfo.amount;
    }
    async sendToken() {
        // Get the token account of the toWallet address, and if it does not exist, create it
        try {
            await this.getSplInfo();

            if (this.toWallet) {
                const toTokenAccount = await getOrCreateAssociatedTokenAccount(
                    this.connection,
                    this.fromWallet,
                    this.mint,
                    this.toWallet
                );

                const signature = await transfer(
                    this.connection,
                    this.fromWallet,
                    this.fromTokenAccount.address,
                    toTokenAccount.address,
                    this.fromWallet.publicKey,
                    1000000000 // 1 billion
                );
            } else {
                this.connectWallet();
            }
        } catch (error) {
            console.error('Error occurred:', error);
        }
    }
    async sendTokenAsTeacher(connectedPublicKey) {
        // Get the token account of the toWallet address, and if it does not exist, create it
        try {
            await this.getSplInfo();

            this.toWallet = new PublicKey(connectedPublicKey);

            if (this.toWallet) {
                const toTokenAccount = await getOrCreateAssociatedTokenAccount(
                    this.connection,
                    this.fromWallet,
                    this.mint,
                    this.toWallet
                );
                const signature = await transfer(
                    this.connection,
                    this.fromWallet,
                    this.fromTokenAccount.address,
                    toTokenAccount.address,
                    this.fromWallet.publicKey,
                    1000000000 // 1 billion
                );
                if (signature) {
                    return true;
                }
            }
        } catch (error) {
            console.error('Error occurred:', error);
        }
    }

    getProvider = () => {
        if ('phantom' in window) {
            const provider = window.phantom?.solana;

            if (provider?.isPhantom) {
                return provider;
            }
        }

        window.open('https://phantom.app/', '_blank');
    };
    
    async disconnectWallet() {
        await this.provider.request({ method: 'disconnect' });
    }

    // solidety functions
    async connectWallet() {
        this.provider = this.getProvider(); // see "Detecting the Provider"
        try {
            const resp = await this.provider.connect();
            this.connectedPublicKey = resp.publicKey;
            this.provider.on('connect', () => {
                this.toWallet = new PublicKey(this.connectedPublicKey);
                localStorage.setItem('publicKeywallet', resp.publicKey);
                return this._httpClient
                    .put<any>(environment.apiUrl + 'sol/solUser', {
                        pubKey: this.connectedPublicKey,
                    })
                    .subscribe();
            });
        } catch (err) {}
    }
}
