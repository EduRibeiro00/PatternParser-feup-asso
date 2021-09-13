import { Client } from 'ts-postgres';
import { CommunicationManager } from './CommunicationManager';

class RecoveryManager {
    private static INSTANCE : RecoveryManager;

    private postgres: Client;
    private tableName: string;

    public static getInstance() : RecoveryManager {
        if (!RecoveryManager.INSTANCE) {
            RecoveryManager.INSTANCE = new RecoveryManager();
        }
        return RecoveryManager.INSTANCE;
    }

    private constructor() {
        this.postgres = new Client({
            'host': process.env.POSTGRES_HOST || 'localhost',
            'port': process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : 5432,
            'user': process.env.POSTGRES_USER || 'asso2021',
            'password': process.env.POSTGRES_PASS || '',
            'database': process.env.POSTGRES_DB || 'reader',
        });
        this.tableName = process.env.POSTGRES_RECOV_TABLE || 'reader_recov';
        console.log('Connected to database!');
    }

    public async runRecovery() {
        console.log('Creating recovery table...');
        await this.postgres.connect();
        await this.postgres.query(`
            CREATE TABLE IF NOT EXISTS ${this.tableName} (
                id SERIAL PRIMARY KEY,
                paper_url TEXT NOT NULL UNIQUE, 
                processed BOOLEAN DEFAULT FALSE
            );
        `);

        console.log('Performing recovery analysis...');
        const result = this.postgres.query(`
            SELECT * FROM ${this.tableName}
            WHERE processed = FALSE;
        `);
        
        let found = false;
        for await (const row of result) {
            found = true;
            const url = row.get('paper_url') as string;
            console.log(`Recovered paper URL: ${url}`)
            CommunicationManager.getInstance().notifySubscribers(url);
        }
        if (!found) console.log('No URLs to be recovered.');
    }

    public async storeNewPaper(paper_url: string) {
        await this.postgres.query(`
            INSERT INTO ${this.tableName} (paper_url)
            VALUES ('${paper_url}')
            ON CONFLICT (paper_url) 
            DO UPDATE SET processed = FALSE;
        `);
    }

    public async storeFinishedPaperParsing(paper_url: string) {
        await this.postgres.query(`
            UPDATE ${this.tableName} 
            SET processed = TRUE 
            WHERE paper_url = '${paper_url}';
        `);
    }
}

// export singleton instance
export { RecoveryManager }