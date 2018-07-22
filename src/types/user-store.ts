export enum UserStorePropertyType {
	String = 'string',
	Page = 'page'
}

export enum UserStoreActionType {
	Noop = 'noop',
	OpenExternal = 'open-external',
	Set = 'set',
	SetPage = 'set-page'
}

export type SerializedUserStorePropertyType = 'string' | 'page';

export type SerializedUserStoreActionType = 'noop' | 'set' | 'set-page' | 'open-external';

export type SavedUserStoreProperty = SerializedUserStoreProperty;

export interface SerializedUserStoreProperty {
	id: string;
	name: string;
	payload: string;
	type: SerializedUserStorePropertyType;
}

export interface SerializedUserStoreAction {
	acceptsProperty: boolean;
	id: string;
	name: string;
	storePropertyId?: string;
	type: SerializedUserStoreActionType;
}

export type SavedUserStoreAction = SerializedUserStoreAction;

export interface SavedUserStore {
	actionIds: string[];
	currentPagePropertyId: string;
	id: string;
	propertyIds: string[];
	referenceIds: string[];
}

export interface SerializedUserStore {
	actions: SerializedUserStoreAction[];
	currentPageProperty: SerializedUserStoreProperty;
	id: string;
	properties: SerializedUserStoreProperty[];
	references: SerializedUserStoreReference[];
}

export type UserStoreActionPayload = string;

export interface SerializedUserStoreReference {
	id: string;
	open: boolean;
	elementPropertyId: string;
	userStorePropertyId: string | undefined;
}

export interface SavedUserStoreReference {
	id: string;
	elementPropertyId: string;
	userStorePropertyId: string | undefined;
}
