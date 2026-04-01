import { google } from 'googleapis';
import logger from '@/lib/logger';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export interface SubmissionData {
  timestamp: string;
  name: string;
  phone: string;
  message?: string;
  ip: string;
  telegramStatus: 'sent' | 'failed' | 'partial';
  telegramError?: string;
}

export class SheetsProvider {
  private spreadsheetId: string;
  private auth: ReturnType<typeof this.getAuth>;

  constructor(spreadsheetId: string, credentialsJson: string) {
    this.spreadsheetId = spreadsheetId;
    this.auth = this.getAuth(credentialsJson);
  }

  private getAuth(credentialsJson: string) {
    if (!credentialsJson) {
      logger.error({ event: 'sheets_config_error' }, 'GOOGLE_SERVICE_ACCOUNT_KEY not set');
      return null;
    }

    try {
      const parsedCreds = JSON.parse(credentialsJson);
      return new google.auth.GoogleAuth({
        credentials: parsedCreds,
        scopes: SCOPES,
      });
    } catch (error) {
      logger.error({ event: 'sheets_auth_error', error: (error as Error).message }, 'Failed to parse credentials');
      return null;
    }
  }

  async save(data: SubmissionData): Promise<boolean> {
    if (!this.auth) {
      logger.error({ event: 'sheets_not_configured' }, 'Sheets provider not configured');
      return false;
    }

    try {
      const sheets = google.sheets({ version: 'v4', auth: this.auth });
      
      // Add apostrophe before phone to preserve leading zeros
      const phoneWithApostrophe = data.phone ? `'${data.phone}` : '';
      
      const row = [
        data.timestamp,
        data.name,
        phoneWithApostrophe,
        data.message || '-',
        data.ip,
        data.telegramStatus,
        data.telegramError || '-',
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'A:G',
        valueInputOption: 'RAW',
        requestBody: { values: [row] },
      });

      logger.info({ event: 'sheets_saved', name: data.name }, 'Saved submission to Sheets');
      return true;
    } catch (error) {
      logger.error({ event: 'sheets_save_error', error: (error as Error).message }, 'Failed to save to Sheets');
      return false;
    }
  }

  async getAll(): Promise<Array<{
    id: number;
    timestamp: string;
    name: string;
    phone: string;
    message?: string;
    ip: string;
    telegramStatus: string;
    telegramError?: string;
  }>> {
    if (!this.auth) {
      logger.error({ event: 'sheets_not_configured' }, 'Sheets provider not configured');
      return [];
    }

    try {
      const sheets = google.sheets({ version: 'v4', auth: this.auth });
      
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'A2:G',
      });

      const rows = response.data.values || [];
      
      return rows.map((row, index) => ({
        id: index + 2,
        timestamp: row[0] || '',
        name: row[1] || '',
        phone: row[2] || '',
        message: row[3] || '',
        ip: row[4] || '',
        telegramStatus: row[5] || '',
        telegramError: row[6] || '',
      }));
    } catch (error) {
      logger.error({ event: 'sheets_get_error', error: (error as Error).message }, 'Failed to get submissions');
      return [];
    }
  }
}
