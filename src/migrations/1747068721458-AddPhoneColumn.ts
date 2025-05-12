import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPhoneColumnXXXXXXXXXXXX implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN "phone" varchar NOT NULL DEFAULT '01815532283'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            DROP COLUMN "phone"
        `);
    }
}