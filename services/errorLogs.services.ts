import { appDataSource } from '../datasource.js';
import ErrorLog from '../entities/errorLog.js';



export async function createErrorLog(deviceToken: string, customMessage: string, error: string, fileName: string, version: string): Promise<{ status: number, error?: unknown }> {
    
    try {

        const errorLogRepository = appDataSource.getRepository(ErrorLog);

        const newErrorLog = errorLogRepository.create({
            device_token: deviceToken,
            custom_message: customMessage,
            error: error,
            file_name: fileName,
            version: version
        });

        await errorLogRepository.save(newErrorLog);

        return { status: 201 };

    } catch (error) {
        return { status: 500, error: error };
    }
};
