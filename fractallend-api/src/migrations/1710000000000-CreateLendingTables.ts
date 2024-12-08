import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLendingTables1710000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create lending pools table
        await queryRunner.query(`
            CREATE TABLE lending_pools (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                collateral_token_id VARCHAR(200) NOT NULL,
                lending_token_id VARCHAR(200) NOT NULL,
                total_deposited DECIMAL(36,18) NOT NULL DEFAULT '0',
                total_borrowed DECIMAL(36,18) NOT NULL DEFAULT '0',
                liquidation_threshold DECIMAL(5,2) NOT NULL,
                interest_rate DECIMAL(5,2) NOT NULL,
                minimum_collateral_ratio DECIMAL(5,2) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create loan positions table
        await queryRunner.query(`
            CREATE TYPE loan_status AS ENUM ('active', 'liquidated', 'closed');
            
            CREATE TABLE loan_positions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                borrower VARCHAR(200) NOT NULL,
                pool_id UUID NOT NULL REFERENCES lending_pools(id),
                collateral_amount DECIMAL(36,18) NOT NULL,
                borrowed_amount DECIMAL(36,18) NOT NULL,
                interest_accrued DECIMAL(36,18) NOT NULL DEFAULT '0',
                last_update_time BIGINT NOT NULL,
                health_factor DECIMAL(5,2) NOT NULL,
                status loan_status NOT NULL DEFAULT 'active',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE loan_positions`);
        await queryRunner.query(`DROP TYPE loan_status`);
        await queryRunner.query(`DROP TABLE lending_pools`);
    }
} 