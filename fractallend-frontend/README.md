## Fractal Lend

Uses UniSat APIs to get real-time CAT20 token prices
Implements health factor calculation based on collateral value
Handles loan position creation with proper validation
Includes liquidation monitoring system

Whats done
The current implementation includes:
Auction list and details pages
Real-time auction countdown
Bidding interface
Navigation component


````mermaid
graph TB
    subgraph Frontend
        UI[User Interface]
        WC[Wallet Connection]
        UI --> WC
    end

    subgraph Backend
        API[NestJS API]
        DB[(PostgreSQL)]
        PriceOracle[Price Oracle]
        API --> DB
    end

    subgraph UniSat_APIs
        InscriptionAPI[Inscription API]
        CollectionAPI[Collection API]
        CAT20API[CAT20 Market API]
    end

    subgraph LoanSystem
        Borrower[Borrower with Inscription]
        Lender[Lender with CAT20]
        Vault[Smart Contract Vault]
        LoanContract[Loan Agreement]
    end

    %% Price Feeds
    InscriptionAPI -->|Floor Price| PriceOracle
    CollectionAPI -->|Collection Stats| PriceOracle
    CAT20API -->|Token Price| PriceOracle

    %% Loan Flow
    Borrower -->|1. Deposit Inscription| Vault
    Vault -->|2. Lock Collateral| LoanContract
    Lender -->|3. Send CAT20| LoanContract
    LoanContract -->|4. Release CAT20| Borrower
    
    %% Repayment/Liquidation
    Borrower -->|5a. Repay CAT20 + Interest| LoanContract
    LoanContract -->|6a. Return Inscription| Borrower
    LoanContract -->|5b. Default: Transfer Inscription| Lender

    %% System Integration
    UI -->|API Calls| API
    API -->|Monitor Prices| PriceOracle
    API -->|Track Loans| DB
````

Key Components:

1. **Collateral Management**:
   - Use UniSat Collection API to get floor prices and collection stats
   - Monitor inscription values using `/v3/market/collection/auction/collection_statistic`
   - Track collection health using `/v3/market/collection/auction/actions`

2. **Loan Terms**:
   - Loan-to-Value (LTV) ratio based on inscription floor price
   - Interest rate determined by:
     - Collection volatility
     - CAT20 token demand
     - Loan duration

3. **Liquidation System**:
   - Monitor collateral value using UniSat price feeds
   - Trigger liquidation if value falls below threshold
   - Use `/v3/market/collection/auction/create_put_on` for liquidation sales

4. **Database Schema**:
````mermaid
erDiagram
    Loan {
        uuid id
        string borrower_address
        string lender_address
        string inscription_id
        string cat20_token_id
        decimal loan_amount
        decimal interest_rate
        decimal collateral_value
        timestamp start_date
        timestamp end_date
        enum status
    }
    
    Collateral {
        uuid id
        string inscription_id
        string collection_id
        decimal floor_price
        decimal liquidation_threshold
        string vault_address
    }

    LoanPayment {
        uuid id
        uuid loan_id
        decimal amount
        timestamp payment_date
        enum payment_type
    }
````


<!--  the current impl updates -->



Now we have a complete P2P lending implementation with:

1. Backend:
   - Direct P2P loan matching
   - Inscription collateral handling
   - CAT20 token transfers
   - Loan lifecycle management

2. Frontend:
   - Loan request creation with inscription selection
   - Available loan request browsing
   - Loan funding interface
   - Position management (repayment, health monitoring)

The flow is now:

1. Borrower:
   ```
   a. Creates loan request
   b. Selects inscription as collateral
   c. Sets loan terms (amount, interest, duration)
   d. Deposits collateral when matched
   ```

2. Lender:
   ```
   a. Browses available loan requests
   b. Views collateral and terms
   c. Funds loan with CAT20 tokens
   ```

3. Loan Management:
   ```
   a. Borrower can repay loan
   b. System monitors health factor
   c. Automatic liquidation if health drops
   ```
