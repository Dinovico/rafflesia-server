import type { Request, Response } from 'express';
import * as UsersServices from "../services/users.services.js";







////////////////////////           RETRIEVING USERS              ////////////////////////


export async function getIdFromEmail(req: Request, res: Response) {
    
    const getIdFromEmailResult = await UsersServices.getIdFromEmail(req.params.email);

    switch (getIdFromEmailResult.status) {
        case 200:
            return res.status(getIdFromEmailResult.status)
                    .json({
                        status: getIdFromEmailResult.status,
                        message: 'User id successfully retrieved',
                        body: getIdFromEmailResult.id,
                    });
        case 404:
            return res.status(getIdFromEmailResult.status)
                    .json({
                        status: getIdFromEmailResult.status,
                        message: 'Email not found',
                        body: getIdFromEmailResult.id,
                    });
        case 500:
            return res.status(getIdFromEmailResult.status)
                    .json({
                        status: getIdFromEmailResult.status,
                        message: 'Failed to retrieve user id (Server error: ' + getIdFromEmailResult.error + ')',
                        body: getIdFromEmailResult.id,
                    });
        default:
            return res.status(getIdFromEmailResult.status)
                    .json({
                        status: getIdFromEmailResult.status,
                        message: 'Unexpected behaviour encountered',
                        body: getIdFromEmailResult?.id,
                    });
    }
};



export async function getUserById(req: Request, res: Response) {

    const getUserByIdResult = await UsersServices.getUserById(req.params.auth_id, req.params.id);
    
    switch (getUserByIdResult.status) {
        case 200:
            return res.status(getUserByIdResult.status)
                    .json({
                        status: getUserByIdResult.status,
                        message: 'User successfully retrieved',
                        body: getUserByIdResult.user,
                    });
        case 404:
            return res.status(getUserByIdResult.status)
                    .json({
                        status: getUserByIdResult.status,
                        message: 'User not found',
                        body: getUserByIdResult.user,
                        });
        case 500:
            return res.status(getUserByIdResult.status)
                    .json({
                        status: getUserByIdResult.status,
                        message: 'Failed to retrieve user (Server error: ' + getUserByIdResult.error + ')',
                        body: getUserByIdResult.user,
                    });
        default:
            return res.status(getUserByIdResult.status)
                    .json({
                        status: getUserByIdResult.status,
                        message: 'Unexpected behaviour encountered',
                        body: getUserByIdResult?.user,
                    });
    }
};


export async function getMinimalUserInfo(req: Request, res: Response) {

    const getUserByIdResult = await UsersServices.getUserById(req.params.auth_id, req.params.id);
    
    switch (getUserByIdResult.status) {
        case 200:
            return res.status(getUserByIdResult.status)
                    .json({
                        status: getUserByIdResult.status,
                        message: 'User successfully retrieved',
                        body: { 
                            id: getUserByIdResult.user?.id, 
                            firstname: getUserByIdResult.user?.firstname, 
                            lastname: getUserByIdResult.user?.lastname,
                            profile_pic_thumbnail: getUserByIdResult.user?.profile_pic_thumbnail
                        },
                    });
        case 404:
            return res.status(getUserByIdResult.status)
                    .json({
                        status: getUserByIdResult.status,
                        message: 'User not found',
                        body: getUserByIdResult.user,
                        });
        case 500:
            return res.status(getUserByIdResult.status)
                    .json({
                        status: getUserByIdResult.status,
                        message: 'Failed to retrieve user (Server error: ' + getUserByIdResult.error + ')',
                        body: getUserByIdResult.user,
                    });
        default:
            return res.status(getUserByIdResult.status)
                    .json({
                        status: getUserByIdResult.status,
                        message: 'Unexpected behaviour encountered',
                        body: getUserByIdResult?.user,
                    });
    }
};


export async function getCurrentUser(req: Request, res: Response) {

    const getCurrentUserResult = await UsersServices.getUserById(req.params.auth_id, req.params.auth_id);
    
    switch (getCurrentUserResult.status) {
        case 200:
            return res.status(getCurrentUserResult.status)
                    .json({
                        status: getCurrentUserResult.status,
                        message: 'User successfully retrieved',
                        body: getCurrentUserResult.user,
                    });
        case 404:
            return res.status(getCurrentUserResult.status)
                    .json({
                        status: getCurrentUserResult.status,
                        message: 'User not found',
                        body: getCurrentUserResult.user,
                        });
        case 500:
            return res.status(getCurrentUserResult.status)
                    .json({
                        status: getCurrentUserResult.status,
                        message: 'Failed to retrieve user (Server error: ' + getCurrentUserResult.error + ')',
                        body: getCurrentUserResult.user,
                    });
        default:
            return res.status(getCurrentUserResult.status)
                    .json({
                        status: getCurrentUserResult.status,
                        message: 'Unexpected behaviour encountered',
                        body: getCurrentUserResult?.user,
                    });
    }
};








////////////////////////            AUTH               ////////////////////////


export async function authorizeEmail(req: Request, res: Response) {

    const authorizeResult = await UsersServices.authorizeEmail(req.body.email);

    switch (authorizeResult.status) {
        case 200:
            return res.status(authorizeResult.status)
                    .json({
                        status: authorizeResult.status,
                        message: `Email "${req.body.email}" is unused and whitelisted.`,
                    });
        case 403:
            return res.status(authorizeResult.status)
                    .json({
                        status: authorizeResult.status,
                        message: `Email "${req.body.email}" is not whitelisted.`,
                    });
        case 409:
            return res.status(authorizeResult.status)
                    .json({
                        status: authorizeResult.status,
                        message: `Email "${req.body.email}" already in use.`,
                    });
        case 500:
            return res.status(authorizeResult.status)
                    .json({
                        status: authorizeResult.status,
                        message: 'Authorization failed (Server error: ' + authorizeResult.error + ')',
                    });
        default:
            return res.status(authorizeResult.status)
                    .json({
                        status: authorizeResult.status,
                        message: 'Unexpected behaviour encountered',
                    });
    }
};


export async function authorizePhone(req: Request, res: Response) {

    const authorizeResult = await UsersServices.authorizePhone(req.body.phone_number);

    switch (authorizeResult.status) {
        case 200:
            return res.status(authorizeResult.status)
                    .json({
                        status: authorizeResult.status,
                        message: `Phone number "${req.body.phone_number}" is unused and whitelisted.`,
                    });
        case 403:
            return res.status(authorizeResult.status)
                    .json({
                        status: authorizeResult.status,
                        message: `Phone number "${req.body.phone_number}" is not whitelisted.`,
                    });
        case 409:
            return res.status(authorizeResult.status)
                    .json({
                        status: authorizeResult.status,
                        message: `Phone number "${req.body.phone_number}" already in use.`,
                    });
        case 500:
            return res.status(authorizeResult.status)
                    .json({
                        status: authorizeResult.status,
                        message: 'Authorization failed (Server error: ' + authorizeResult.error + ')',
                    });
        default:
            return res.status(authorizeResult.status)
                    .json({
                        status: authorizeResult.status,
                        message: 'Unexpected behaviour encountered',
                    });
    }
};


export async function login(req: Request, res: Response) {

    const result = await UsersServices.login(req.body.id);

    switch (result.status) {
        case 200:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Login successful',
                    });
        case 403:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Provided user id is not authorized',
                    });
        case 404:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Provided user id does not exist',
                    });
        case 500:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Login failed (Server error: ' + result.error + ')',
                    });
        default:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Unexpected behaviour encountered',
                    });
    }
};


export async function getUserAuthMethod(req: Request, res: Response) {
    
    const result = await UsersServices.getUserAuthMethod(req.params.auth_id);

    switch (result.status) {
        case 200:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'User auth method successfully retrieved',
                        body: result.method,
                    });
        case 404:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'User not found',
                        body: result.method,
                    });
        case 500:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Failed to retrieve user auth method (Server error: ' + result.error + ')',
                        body: result.method,
                    });
        default:
            return res.status(result.status)
                    .json({
                        status: result.status,
                        message: 'Unexpected behaviour encountered',
                        body: result?.method,
                    });
    }
};



export async function registerUser(req: Request, res: Response) {

    const registerResult = await UsersServices.register(req.body.method, req.body.id, req.body.contact, req.body.firstname, req.body.lastname, req.body.birthdate);

    switch (registerResult.status) {
        case 201:
            return res.status(registerResult.status)
                    .json({
                        status: registerResult.status,
                        message: 'Successfully registered user',
                    });
        case 400:
            return res.status(registerResult.status)
                .json({
                    status: registerResult.status,
                    message: 'Invalid registration method',
                });
        case 500:
            return res.status(registerResult.status)
                    .json({
                        status: registerResult.status,
                        message: 'Failed to register user (Server error: ' + registerResult.error + ')',
                    });
        default:
            return res.status(registerResult.status)
                    .json({
                        status: registerResult.status,
                        message: 'Unexpected behaviour encountered',
                    });
    }
};











////////////////////////           UPDATING USERS              ////////////////////////
  

export async function updateProfilePic(req: Request, res: Response) {

    const updateResult = await UsersServices.updateProfilePic(req.body.image_id, req.params.auth_id);

    switch (updateResult.status) {
        case 205:
            return res.status(updateResult.status)
                    .json({
                        status: updateResult.status,
                        message: 'Successfully updated profile picture',
                    });
        case 404:
            return res.status(updateResult.status)
                    .json({
                        status: updateResult.status,
                        message: 'Not found',
                    });
        case 500:
            return res.status(updateResult.status)
                    .json({
                        status: updateResult.status,
                        message: 'Failed to update profile picture (Server error: ' + updateResult.error + ')',
                    });
        default:
            return res.status(updateResult.status)
                    .json({
                        status: updateResult.status,
                        message: 'Unexpected behaviour encountered',
                    });
    }
};



export async function deleteUser(req: Request, res: Response) {

    const deleteResult = await UsersServices.deleteUser(req.params.auth_id);

    switch (deleteResult.status) {
        case 205:
            return res.status(deleteResult.status)
                    .json({
                        status: deleteResult.status,
                        message: 'Successfully deleted user',
                    });
        case 500:
            return res.status(deleteResult.status)
                    .json({
                        status: deleteResult.status,
                        message: 'Failed to delete user (Server error: ' + deleteResult.error + ')',
                    });
        default:
            return res.status(deleteResult.status)
                    .json({
                        status: deleteResult.status,
                        message: 'Unexpected behaviour encountered',
                    });
    }
};