import { appDataSource } from '../datasource.js';
import Device from '../entities/device.js';



export async function registerDevice(userId: string, token: string, deviceNickname: string, systemName: string, systemVersion: string, brand: string, model: string): Promise<{ status: number, error?: unknown }> {

    try {

        if (token === undefined || token === null || token === '') {
            return { status: 400 };
        }

        const deviceRepository = appDataSource.getRepository(Device);

        const existingDeviceWithUser = await deviceRepository.findOne({ where: { token: token, user_id: userId }});

        if (existingDeviceWithUser !== null) {
            existingDeviceWithUser.last_use = new Date();
            existingDeviceWithUser.authentified = true;
            existingDeviceWithUser.device_nickname = deviceNickname;
            existingDeviceWithUser.system_name = systemName;
            existingDeviceWithUser.system_version = systemVersion;
            existingDeviceWithUser.brand = brand;
            existingDeviceWithUser.model = model;

            await deviceRepository.save(existingDeviceWithUser);
        } else {

            const newDeviceWithUser = deviceRepository.create({
                token: token,
                user_id: userId,
                last_use: new Date(),
                authentified: true,
                device_nickname: deviceNickname,
                system_name: systemName,
                system_version: systemVersion,
                brand: brand,
                model: model
            })

            await deviceRepository.save(newDeviceWithUser);
        }
        
        const otherExistingDeviceInstances = (await deviceRepository.find({ where: { token: token }}))
            .filter((device) => {
                device.user_id !== userId;
            });

        for (let index = 0; index < otherExistingDeviceInstances.length; index++) {
            otherExistingDeviceInstances[index].authentified = false;
            await deviceRepository.save(otherExistingDeviceInstances[index]);
        }

        return { status: 201 };

    } catch (error) {
        return { status: 500, error: error };
    }
}



export async function disconnectDevice(userId: string, token: string): Promise<{ status: number, error?: unknown }> {

    try {
        const deviceRepository = appDataSource.getRepository(Device);

        const existingDeviceWithUser = await deviceRepository.findOne({ where: { token: token, user_id: userId }});

        if(existingDeviceWithUser === null) {
            return { status: 404 };
        }

        existingDeviceWithUser.authentified = false;

        await deviceRepository.save(existingDeviceWithUser);

        return { status: 200 };
        
    } catch (error) {
        return { status: 500, error: error };
    }
}



export async function getUserActiveDevices(userId: string): Promise<{ status: number, devices: Device[] | null, error?: unknown }> {

    try {

        const deviceRepository = appDataSource.getRepository(Device);

        const userActiveDevices = (await deviceRepository.find({ where: { user_id: userId, authentified: true } })).filter((device) => device.token !== '');

        return { status: 200, devices: userActiveDevices };
    } catch (error) {
        return { status: 500, devices: null , error: error };
    }
}