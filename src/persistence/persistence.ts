import * as Crypto from 'crypto';
import * as Fs from 'fs';
import * as Model from '../model';
import * as Path from 'path';
// import * as Tar from 'tar-stream';
import * as Util from 'util';
import * as Yaml from 'js-yaml';

const sander = require('sander');

export enum PersistenceState {
	Error = 'error',
	Success = 'success'
}

export type PersistencePersistResult = PersistencePersistError | PersistencePersistSuccess;

export interface PersistencePersistError {
	error: Error;
	state: PersistenceState.Error;
}

export interface PersistencePersistSuccess {
	state: PersistenceState.Success;
}

export type PersistenceReadResult<T> = PersistenceReadError | PersistenceReadSuccess<T>;

export interface PersistenceReadError {
	error: Error;
	state: PersistenceState.Error;
}

export interface PersistenceReadSuccess<T> {
	contents: T;
	state: PersistenceState.Success;
}

const writeFile = Util.promisify(Fs.writeFile);

export class Persistence {
	public static async persist(
		path: string,
		model: Model.Project
	): Promise<PersistencePersistResult> {
		const registry: Map<string, string> = new Map();

		const project = model.toDisk();
		const pages = model.getPages().map(p => p.toDisk());

		const elements = model.getElements().map(e => e.toDisk());
		const elementActions = model.getElementActions().map(a => a.toDisk());
		const elementContents = model.getElementContents().map(e => e.toDisk());
		const elementProperties = model.getElementProperties().map(p => p.toDisk());

		const patternLibraries = model.getPatternLibraries().map(l => l.toDisk());
		const patterns = model.getPatterns().map(p => p.toDisk());
		const patternProperties = model.getPatternProperties().map(p => p.toDisk());
		const patternSlots = model.getPatternSlots().map(s => s.toDisk());

		const userStore = model.getUserStore().toDisk();
		const userStoreActions = model
			.getUserStore()
			.getActions()
			.map(a => a.toDisk());
		const userStoreProperties = model
			.getUserStore()
			.getProperties()
			.map(p => p.toDisk());
		const userStoreReferences = model
			.getUserStore()
			.getReferences()
			.map(r => r.toDisk());

		await write(project, { registry, basePath: Path.join('/Users/marneb/Desktop/test/project') });
		await write(pages, { registry, basePath: Path.join('/Users/marneb/Desktop/test/pages') });

		await write(elements, {
			registry,
			basePath: Path.join('/Users/marneb/Desktop/test/elements')
		});
		await write(elementActions, {
			registry,
			basePath: Path.join('/Users/marneb/Desktop/test/elementActions')
		});
		await write(elementContents, {
			registry,
			basePath: Path.join('/Users/marneb/Desktop/test/elementContents')
		});
		await write(elementProperties, {
			registry,
			basePath: Path.join('/Users/marneb/Desktop/test/elementProperties')
		});

		await write(patternLibraries, {
			registry,
			basePath: Path.join('/Users/marneb/Desktop/test/patternLibraries')
		});
		await write(patterns, {
			registry,
			basePath: Path.join('/Users/marneb/Desktop/test/patterns')
		});
		await write(patternProperties, {
			registry,
			basePath: Path.join('/Users/marneb/Desktop/test/patternProperties')
		});
		await write(patternSlots, {
			registry,
			basePath: Path.join('/Users/marneb/Desktop/test/patternSlots')
		});

		await write(userStore, {
			registry,
			basePath: Path.join('/Users/marneb/Desktop/test/userStore')
		});
		await write(userStoreActions, {
			registry,
			basePath: Path.join('/Users/marneb/Desktop/test/userStoreActions')
		});
		await write(userStoreProperties, {
			registry,
			basePath: Path.join('/Users/marneb/Desktop/test/userStoreProperties')
		});
		await write(userStoreReferences, {
			registry,
			basePath: Path.join('/Users/marneb/Desktop/test/userStoreReferences')
		});

		// tslint:disable-next-line:no-any
		const registryData = JSON.stringify(
			[...registry.entries()].reduce((r, [k, v]) => ({ ...r, [k]: v })),
			{} as any
		);
		const shasum = Crypto.createHash('sha256');
		shasum.update(registryData);
		const sum = shasum.digest('hex');
		await sander.writeFile(
			Path.join('/Users/marneb/Desktop/test/registry', `${sum}.json`),
			registryData
		);

		try {
			const yaml = Yaml.safeDump(model.toJSON(), { skipInvalid: true, noRefs: true });
			await writeFile(path, yaml);
			return { state: PersistenceState.Success };
		} catch (error) {
			return { state: PersistenceState.Error, error };
		}
	}

	public static read<T>(path: string): Promise<PersistenceReadResult<T>> {
		return new Promise(resolve => {
			Fs.readFile(path, (error, contents) => {
				if (error) {
					return resolve({
						state: PersistenceState.Error,
						error
					});
				}

				try {
					resolve({
						state: PersistenceState.Success,
						contents: Yaml.load(String(contents)) as T
					});
				} catch (error) {
					return resolve({
						state: PersistenceState.Error,
						error
					});
				}
			});
		});
	}
}

// tslint:disable-next-line:no-any
async function write(
	data: any | any[],
	{ basePath, registry }: { basePath: string; registry: Map<string, string> }
): Promise<WriteResult> {
	if (Array.isArray(data)) {
		return Promise.all(data.map(i => write(i, { basePath, registry })));
	}

	const content = JSON.stringify(data);
	const shasum = Crypto.createHash('sha256');
	shasum.update(content);
	const sum = shasum.digest('hex');
	registry.set(data.id, sum);

	await sander.writeFile(`${Path.join(basePath, data.id, sum)}.json`, content);
}
