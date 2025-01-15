import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import admin from 'firebase-admin';

import usersRouter from './routes/users.routes.js';
import imagesRouter from './routes/images.routes.js';
import albumsRouter from './routes/albums.routes.js';
import devicesRouter from './routes/devices.routes.js';
import wachatRouter from './routes/wachat.routes.js';
import logsRouter from './routes/errorLogs.routes.js';
import { routeNotFoundJsonHandler } from './services/handlers/routeNotFoundJsonHandler.js';
import { jsonErrorHandler } from './services/handlers/jsonErrorHandler.js';
import { appDataSource } from './datasource.js';

import serviceAccountKey from "./fbServiceAccountKey.json" with { type: 'json' };


const apiRouter = express.Router();

console.log(process.env.NODE_ENV);

var unless = function(path: string, middleware: Function) {
    return function(req: express.Request, res: express.Response, next: express.NextFunction) {
        if (req.path.startsWith(path)) {
            return next();
        } else {
            return middleware(req, res, next);
        }
    };
};




appDataSource
    .initialize()
    .then(() => {
        console.log('Data Source has been initialized!');
        const app = express();

        

        app.use(unless('/api/health', process.env.NODE_ENV === 'production' ? logger('tiny', {skip: (req, res) => res.statusCode < 400}) : logger('dev')));
        app.use(cors({
            origin: '*',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        }));
        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));

        //Initializing firebase admin for auth
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccountKey as admin.ServiceAccount),
        });
        const messaging = admin.messaging();

        // Register routes
        apiRouter.get('/health', (req, res) => {
            res.status(200).send('Hello from Express! All systems go !');
        });
        apiRouter.get('/version', (req, res) => {
            res.status(200).json({ status: 200, body: process.env.APP_VERSION});
        });
        apiRouter.post('/debug', (req, res) => {
            console.log('[DEBUG] ' + req.body.message);
            res.status(200).send('Logged');
        });
        apiRouter.use('/users', usersRouter);
        apiRouter.use('/images', imagesRouter);
        apiRouter.use('/albums', albumsRouter);
        apiRouter.use('/devices', devicesRouter);
        apiRouter.use('/wachat', wachatRouter);
        apiRouter.use('/logs', logsRouter);

        // Register API router
        app.use('/api', apiRouter);

        // Register 404 middleware and error handler
        app.use(routeNotFoundJsonHandler); // this middleware must be registered after all routes to handle 404 correctly
        app.use(jsonErrorHandler); // this error handler must be registered after all middleware to catch all errors

        // const job = schedule.scheduleJob('0 0 * * *', () => {
        //     temporaryGroupsHandler();
        // });

        const port = parseInt(process.env.PORT || '8080');

        app.listen(port, () => {
            console.log(`Server listening at http://localhost:${port}`);
        });

        // appDataSource.getRepository(User).findOne({ where: { id: 'UIxbjJaa3ZMxMajGvNeanMMMmgn2' } }).then((user) => {
        //     appDataSource.getRepository(WAChat).findOne({ where: { wachat_id: '8fe6e246-5df4-4b4f-9a05-850d4e337871' } }).then((wachat) => {

        //         onExportSharing( wachat!, [user!]);

        //     });
        // });

    })
    .catch((err) => {
        console.error('Error during Data Source initialization:', err);
    });

