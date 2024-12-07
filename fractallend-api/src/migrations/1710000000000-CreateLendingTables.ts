import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLendingTables1710000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create loan positions table
        await queryRunner.query(`
            CREATE TYPE loan_status AS ENUM ('pending', 'active', 'repaid', 'liquidated', 'closed');
            
            CREATE TABLE loan_positions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                borrower VARCHAR(200) NOT NULL,
                lender VARCHAR(200),
                collateral_inscription_id VARCHAR(200) NOT NULL,
                borrowed_token_id VARCHAR(200) NOT NULL,
                collateral_amount DECIMAL(36,18) NOT NULL,
                borrowed_amount DECIMAL(36,18) NOT NULL,
                interest_rate DECIMAL(5,2) NOT NULL,
                duration INTEGER NOT NULL,
                start_time BIGINT,
                interest_accrued DECIMAL(36,18) NOT NULL DEFAULT '0',
                last_update_time BIGINT NOT NULL,
                health_factor DECIMAL(5,2) NOT NULL,
                liquidation_threshold DECIMAL(5,2) NOT NULL,
                status loan_status NOT NULL DEFAULT 'pending',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create trigger for updated_at
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';

            CREATE TRIGGER update_loan_positions_updated_at
                BEFORE UPDATE ON loan_positions
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TRIGGER IF EXISTS update_loan_positions_updated_at ON loan_positions`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column`);
        await queryRunner.query(`DROP TABLE loan_positions`);
        await queryRunner.query(`DROP TYPE loan_status`);
    }
} 