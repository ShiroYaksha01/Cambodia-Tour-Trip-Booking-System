import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateInventorySlotsTable1777565400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'inventory_slots',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'service_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'total_slots',
            type: 'smallint',
            isNullable: false,
          },
          {
            name: 'available_slots',
            type: 'smallint',
            isNullable: false,
          },
          {
            name: 'booked_slots',
            type: 'smallint',
            default: 0,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['available', 'low_stock', 'peak_demand', 'closed'],
            default: `'available'`,
            isNullable: false,
          },
          {
            name: 'markup_percentage',
            type: 'smallint',
            default: 0,
          },
          {
            name: 'is_peak_period',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
        uniques: [
          {
            columnNames: ['service_id', 'date'],
          },
        ],
      }),
      true,
    );

    // Add foreign key
    await queryRunner.createForeignKey(
      'inventory_slots',
      new TableForeignKey({
        columnNames: ['service_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'services',
        onDelete: 'CASCADE',
      }),
    );

    // Create index for faster queries
    await queryRunner.query(
      `CREATE INDEX idx_inventory_slots_service_date ON inventory_slots(service_id, date)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('inventory_slots');
  }
}
