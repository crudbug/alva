import { startUpdater, stopUpdater } from './auto-updater';
import { createServerMessageHandler } from './create-server-message-handler';
import * as Electron from 'electron';
import * as Ephemeral from './ephemeral-store';
import * as Express from 'express';
import * as Events from 'events';
import * as getPort from 'get-port';
import * as Message from '../message';
import * as Mobx from 'mobx';
import * as Model from '../model';
import { Sender } from '../sender/server';
import { showMainMenu } from './show-main-menu';
import { createServer } from '../server';
import { createWindow } from './create-window';
import * as uuid from 'uuid';

const log = require('electron-log');

export interface AppContext {
	app: undefined | Model.AlvaApp;
	base: undefined | string;
	hot: undefined | boolean;
	project: undefined | Model.Project;
	port: undefined | number;
	sender: undefined | Sender;
	win: undefined | Electron.BrowserWindow;
	middlewares: Express.RequestHandler[];
}

export async function startApp(ctx: AppContext): Promise<{ emitter: Events.EventEmitter }> {
	log.info(`App starting ${ctx.hot ? 'with hot reloading' : ''}...`);

	const emitter = new Events.EventEmitter();

	// Cast getPort return type from PromiseLike<number> to Promise<number>
	// to avoid async-promise tslint rule to produce errors here
	ctx.port = await (getPort({ port: ctx.port }) as Promise<number>);

	const sender = new Sender();
	const server = createServer({ port: ctx.port, sender, context: ctx });
	const ephemeralStore = new Ephemeral.EphemeralStore();

	const syncing = new WeakSet<Model.Project>();

	const dispose = Mobx.autorun(() => {
		if (ctx.app) {
			ephemeralStore.setAppState(ctx.app.toJSON());
			showMainMenu({ app: ctx.app, project: ctx.project }, { sender });
		}

		if (ctx.project && !syncing.has(ctx.project)) {
			syncing.add(ctx.project);
			ctx.project.sync(sender);
		}
	});

	const serverMessageHandler = await createServerMessageHandler(ctx, {
		emitter,
		ephemeralStore,
		server,
		sender
	});

	sender.receive(serverMessageHandler);

	server.on('client-message', e => sender.send(e));

	Electron.app.on('will-finish-launching', () => {
		Electron.app.on('open-file', async (event, path) => {
			event.preventDefault();

			if (!path) {
				return;
			}

			sender.send({
				id: uuid.v4(),
				type: Message.MessageType.OpenFileRequest,
				payload: { path }
			});
		});
	});

	Electron.app.on('activate', async () => {
		if (process.platform === 'darwin' && !ctx.win) {
			ctx.win = (await createWindow({ port: ctx.port as number })).window;
		}
	});

	await server.start();
	log.info(`Server started on port ${ctx.port}.`);

	if (ctx.win) {
		ctx.win.loadURL(`http://localhost:${ctx.port}/`);
	} else {
		ctx.win = (await createWindow({ port: ctx.port as number })).window;
	}

	startUpdater();

	emitter.once('reload', async payload => {
		log.info(`App reloading ${payload.forced ? 'forcefully' : ''}...`);

		if (payload && payload !== null && payload.forced) {
			ephemeralStore.clear();
		}

		dispose();
		await server.stop();
		sender.stop();
		server.removeAllListeners();
		emitter.removeAllListeners();
		Electron.app.removeAllListeners();
		stopUpdater();
	});

	log.info('App started.');
	return { emitter };
}
